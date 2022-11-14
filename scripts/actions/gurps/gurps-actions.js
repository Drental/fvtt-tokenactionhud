import {ActionHandler} from "../actionHandler.js";
import * as settings from "../../settings.js";
import {Logger} from "../../logger.js";

export class ActionHandlerGURPS extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }


    doBuildActionList(token, multipleTokens) {
      let result = this.initializeEmptyActionList();
      if (!GURPS) return result;  // If the GURPS Global is not defined, do nothing
      if (!token) return result;
      let tokenId = token.id;
      result.tokenId = tokenId;
      let actor = token.actor;
      if (!actor) return result;
      result.actorId = actor.id;
        
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.attributes"),
        this._attributes(actor, tokenId)
      );
      
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.defenses"),
        this._defenses(actor, tokenId)
      );
      
      if (Object.keys(actor.system.melee).length > 0)
        this._melee(result, this.i18n("tokenActionHud.melee"), actor, tokenId)
     
      if (Object.keys(actor.system.ranged).length > 0)
        this._ranged(result, this.i18n("tokenActionHud.ranged"), actor, tokenId)
     
      if (Object.keys(actor.system.skills).length > 0)
        this._addToList(result, this.i18n("tokenActionHud.skills"), actor, tokenId, 'skills', 'Sk')
        
      if (Object.keys(actor.system.spells).length > 0)
        this._addToList(result, this.i18n("tokenActionHud.spells"), actor, tokenId, 'spells', 'Sp')
      
      this._advantages(result, actor, tokenId)
      this._addQuickNotes(result, actor, tokenId)
      
      if (settings.get('showManeuvers') && !!game.combats.combats.find(c => (c.isActive && !!c.getCombatantByToken(tokenId))))
        this._combineCategoryWithList(
          result,
          this.i18n("GURPS.setManeuver"),
          this._maneuvers(actor, tokenId)
        );
  
     this._combineCategoryWithList(
      result,
      this.i18n("GURPS.modifierPosture"),
      this._postures(actor, tokenId)
    );

     if (settings.get("showHudTitle")) result.hudTitle = token.name;
  
      return result;
    }
    
  _advantages(result, actor, tokenId) {
    let any = false
    let cat = this.initializeEmptyCategory("ads");
    GURPS.recurselist(actor.system.ads, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      if (this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)) {
        any = true
        this._combineSubcategoryWithCategory(cat, e.name, attributeCategory);
      }
    })
    if (any)
        this._combineCategoryWithList(
          result,
          this.i18n("GURPS.advantages"),
          cat
        );
  }
  
  _addQuickNotes(result, actor, tokenId) {
    let any = false
    let cat = this.initializeEmptyCategory("qn");
    let attributeCategory = this.initializeEmptySubcategory();
    if (this._addNoteOTFs(attributeCategory, tokenId, actor.system.additionalresources.qnotes))
      this._combineSubcategoryWithCategory(cat, '', attributeCategory);
      this._combineCategoryWithList(result, this.i18n("GURPS.quicknotes"), cat);
   }
 
  _ranged(mainList, label, actor, tokenId) {
    let limit = settings.get('maxListSize')
    let cnt = 0
    let columns = 0
    let key = "ranged"
    let result = this.initializeEmptyCategory(key);
    GURPS.recurselist(actor.system.ranged, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      let q = '"'
      if (e.name.includes(q)) q = "'"
      let usage = !!e.mode ? ' (' + e.mode + ')' : ''
      let name = e.name + usage
      attributeCategory.actions.push({
        name: this.i18n("tokenActionHud.attack") + ' (' + e.level + ')',
        encodedValue: ["otf", tokenId, 'R:' + q + name + q].join(this.delimiter),
      }); 
      if (!isNaN(parseInt(e.acc))) {
        let acc = (e.acc >= 0 ? '+':'') + e.acc
        attributeCategory.actions.push({
          name: this.i18n("tokenActionHud.gurps.addAcc") + ' (' + acc +')',
          encodedValue: ["otf", tokenId, acc + ' ' + name + ' ' + this.i18n('GURPS.acc')].join(this.delimiter),
        }); 
      }
      attributeCategory.actions.push({
        name: this.i18n("tokenActionHud.damage") + ' (' + e.damage + ')',
        encodedValue: ["dam", tokenId, 'D:' + q + name + q].join(this.delimiter),
      }); 

      this._addNoteOTFs(attributeCategory, tokenId, name + ' ' + e.notes)

      this._combineSubcategoryWithCategory(result, name, attributeCategory);
      
      if (++cnt >= limit) {
        cnt = 0
        columns++
        this._combineCategoryWithList(mainList, label + (columns > 1 ? '-' + columns :''), result);  
        result = this.initializeEmptyCategory(key + columns);
      }
    })
    if (cnt > 0) {
      columns++
      this._combineCategoryWithList(mainList, label + (columns > 1 ? '-' + columns :''), result);  
    }
  }
  
  _addToList(mainList, label, actor, tokenId, key, otfprefix) {
    let limit = settings.get('maxListSize')
    let cnt = 0
    let columns = 0
    let result = this.initializeEmptyCategory(key);
    GURPS.recurselist(actor.system[key], (e, k, d) => {
      if (e.level > 0) {
        let attributeCategory = this.initializeEmptySubcategory();
        let q = '"'
        if (e.name.includes(q)) q = "'"
        attributeCategory.actions.push({
          name: e.name + ' (' + e.level + ')',
          encodedValue: ["otf", tokenId, otfprefix + ':' + q + e.name + q].join(this.delimiter)
        }); 
        this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)
        
        this._combineSubcategoryWithCategory(result, '', attributeCategory);
        if (++cnt >= limit) {
          cnt = 0
          columns++
          this._combineCategoryWithList(mainList, label + (columns > 1 ? '-' + columns :''), result);  
          result = this.initializeEmptyCategory(key + columns);
        }
      }
    })
    if (cnt > 0) {
      columns++
      this._combineCategoryWithList(mainList, label + (columns > 1 ? '-' + columns :''), result);  
    }
  }

  _addNoteOTFs(attributeCategory, tokenId, notes) {
    let any = false
    if (!!notes)
      GURPS.gurpslink(notes, false, true).forEach(a => {
        any = true
        attributeCategory.actions.push({
          name: a.text, 
          useRawHtmlName: true,
          encodedValue: ["otf", tokenId, a.action.orig].join(this.delimiter),
        }); 
      })
    return any
  }
  
  _melee(mainList, label, actor, tokenId) {
    let limit = settings.get('maxListSize')
    let cnt = 0
    let columns = 0
    let key = "melee"
    let result = this.initializeEmptyCategory(key);
    GURPS.recurselist(actor.system.melee, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      let q = '"'
      if (e.name.includes(q)) q = "'"
      let usage = !!e.mode ? ' (' + e.mode + ')' : ''
      let name = e.name + usage
      attributeCategory.actions.push({
        name: this.i18n("tokenActionHud.attack") + ' (' + e.level + ')',
        encodedValue: ["otf", tokenId, 'M:' + q + name + q].join(this.delimiter),
      }); 
      if (!isNaN(parseInt(e.parry)))
        attributeCategory.actions.push({
          name: this.i18n("GURPS.parry") + ' (' + e.parry + ')',
          encodedValue: ["otf", tokenId, 'P:' + q + name + q].join(this.delimiter),
        }); 
      if (!isNaN(parseInt(e.block)))
        attributeCategory.actions.push({
          name: this.i18n("GURPS.block") + ' (' + e.block + ')',
          encodedValue: ["otf", tokenId, 'B:' + q + name + q].join(this.delimiter),
        }); 
      attributeCategory.actions.push({
        name: this.i18n("tokenActionHud.damage") + ' (' + e.damage + ')',
        encodedValue: ["dam", tokenId, 'D:' + q + name + q].join(this.delimiter),
      }); 

      this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)
      this._combineSubcategoryWithCategory(result, name, attributeCategory);
        if (++cnt >= limit) {
          cnt = 0
          columns++
          this._combineCategoryWithList(mainList, label + (columns > 1 ? '-' + columns :''), result);  
          result = this.initializeEmptyCategory(key + columns);
        }
    })
    if (cnt > 0) {
      columns++
      this._combineCategoryWithList(mainList, label + (columns > 1 ? '-' + columns :''), result);  
    }
  }
  
  _maneuvers(actor, tokenId) {
    let result = this.initializeEmptyCategory("maneuvers");
    let attributeCategory = this.initializeEmptySubcategory();
    Object.values(GURPS.Maneuvers.getAll()).forEach(m => {
      let t = this.i18n(m.data.label)
      attributeCategory.actions.push({
        name: t,
        encodedValue: ["otf", tokenId, '/man ' + t].join(this.delimiter),
        img: m.icon
      }); 
    })   
    this._combineSubcategoryWithCategory(result, '', attributeCategory);
    return result
  }
  
  _postures(actor, tokenId) {
    let result = this.initializeEmptyCategory("postures");
    let attributeCategory = this.initializeEmptySubcategory();
    let postures = {...GURPS.StatusEffect.getAllPostures()}
    postures[GURPS.StatusEffectStanding] = { id: GURPS.StatusEffectStanding, label: GURPS.StatusEffectStandingLabel, icon: 'icons/svg/invisible.svg' }
    Object.values(postures).forEach(m => {
      attributeCategory.actions.push({
        name: this.i18n(m.label),
        encodedValue: ["otf", tokenId, '/st + ' + m.id].join(this.delimiter),
        img: m.icon
      }); 
    })   
    this._combineSubcategoryWithCategory(result, '', attributeCategory);
    return result
  }
    
  _defenses(actor, tokenId) {
    let result = this.initializeEmptyCategory("defenses");

    let cat = this._addDefense(tokenId, this.i18n('GURPS.dodge') + ' (' + actor.system.currentdodge + ')', 'DODGE')
    this._addDefense(tokenId, this.i18n('tokenActionHud.gurps.retreatDodge') + ' (' + (actor.system.currentdodge + 3) + ')', 'DODGE +3 ' + this.i18n('GURPS.modifierDodgeRetreat'), cat)
    this._combineSubcategoryWithCategory(result, '', cat);
    
    if (!!actor.system.equippedparry) {
      cat = this._addDefense(tokenId, this.i18n('GURPS.parry') + ' (' + actor.system.equippedparry + ')', 'PARRY')
      if (!!actor.system.equippedparryisfencing)
        this._addDefense(tokenId, this.i18n("tokenActionHud.gurps.retreatParryFencing") + ' (' + (actor.system.equippedparry + 3) + ')', 'PARRY +3 fencing retreat', cat)
      else
        this._addDefense(tokenId, this.i18n("tokenActionHud.gurps.retreatParry") + ' (' + (actor.system.equippedparry + 1) + ')', 'PARRY +1 retreating', cat)
      this._combineSubcategoryWithCategory(result, '', cat);
    }
    if (!!actor.system.equippedblock) {
      cat = this._addDefense(tokenId, this.i18n('GURPS.block') + ' (' + actor.system.equippedblock + ')', 'BLOCK')
      this._addDefense(tokenId, this.i18n("tokenActionHud.gurps.retreatBlock") + ' (' + (actor.system.equippedblock + 1) + ')', 'BLOCK +1 retreating', cat)
      this._combineSubcategoryWithCategory(result, '', cat);
    }
    return result;
  }
  
  _addDefense(tokenId, label, otf, attributeCategory) {
    if (!attributeCategory) attributeCategory = this.initializeEmptySubcategory();
    
    attributeCategory.actions.push({
      name: label,
      encodedValue: ["otf", tokenId, otf].join(this.delimiter),
    }); 
    return attributeCategory
  }

    
  _attributes(actor, tokenId) {
    let result = this.initializeEmptyCategory("attributes");

    for (let attribute in actor.system.attributes) {
      let attributeCategory = this.initializeEmptySubcategory();
      
      let name = this.i18n(`GURPS.attributes${attribute}`) + ' (' + actor.system.attributes[attribute].value + ')'

      attributeCategory.actions.push({
        name: name,
        encodedValue: ["otf", tokenId, attribute].join(this.delimiter),
      });
      attributeCategory.actions.push({
        name: this.i18n('tokenActionHud.gurps.blindRoll') + ' ' + name,
        encodedValue: ["otf", tokenId, '!' + attribute].join(this.delimiter),
      });
     
     this._combineSubcategoryWithCategory(result, this.i18n(`GURPS.attributes${attribute}NAME`), attributeCategory);
    }
    let any = false
    let attributeCategory = this.initializeEmptySubcategory();
    for (let rkey in actor.system.reactions) {
      let mod = actor.system.reactions[rkey]
      any = true
      let prefix = mod.modifier >= 0 ? '+' : ''
      let s = !!mod.situation ? ' ' + mod.situation : ''
      let n = prefix + mod.modifier + s
      this._addNoteOTFs(attributeCategory, tokenId, '[' + n + ']')
    }
    if (any) this._combineSubcategoryWithCategory(result, this.i18n(`GURPS.reaction`), attributeCategory);
    any = false
    attributeCategory = this.initializeEmptySubcategory();
    for (let rkey in actor.system.conditionalmods) {
      let mod = actor.system.conditionalmods[rkey]
      any = true
      let prefix = mod.modifier >= 0 ? '+' : ''
      let s = !!mod.situation ? ' ' + mod.situation : ''
      let n = prefix + mod.modifier + s
      this._addNoteOTFs(attributeCategory, tokenId, '[' + n + ']')
    }
    if (any) this._combineSubcategoryWithCategory(result, this.i18n(`GURPS.conditionalMods`), attributeCategory);
    return result;
  }

}