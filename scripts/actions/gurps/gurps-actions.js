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
      let tokenId = token.data._id;
      result.tokenId = tokenId;
      let actor = token.actor;
      if (!actor) return result;
      result.actorId = actor.data._id;
        
      this._combineCategoryWithList(
        result,
        this.i18n("tokenactionhud.attributes"),
        this._attributes(actor, tokenId)
      );
      
      this._combineCategoryWithList(
        result,
        this.i18n("tokenactionhud.defenses"),
        this._defenses(actor, tokenId)
      );
      
      if (Object.keys(actor.data.data.melee).length > 0)
        this._addList(result, this.i18n("tokenactionhud.melee"), actor, tokenId, 'melee', 'M')
     
      if (Object.keys(actor.data.data.ranged).length > 0)
        this._addList(result, this.i18n("tokenactionhud.ranged"), actor, tokenId, 'ranged', 'R')
     
      if (Object.keys(actor.data.data.skills).length > 0)
        this._addList(result, this.i18n("tokenactionhud.skills"), actor, tokenId, 'skills', 'Sk')
        
      if (Object.keys(actor.data.data.spells).length > 0)
        this._addList(result, this.i18n("tokenactionhud.spells"), actor, tokenId, 'spells', 'Sp')
      
      this._advantages(result, actor, tokenId)
      this._addQuickNotes(result, actor, tokenId)
      
      if (settings.get('showManeuvers') && !!game.combats.combats.find(c => (c.isActive && !!c.getCombatantByToken(tokenId))))
        this._combineCategoryWithList(
          result,
          this.i18n("GURPS.setManeuver"),
          this._maneuvers(actor, tokenId)
        );
  
      if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;
  
      return result;
    }
    
  _addList(mainList, label, actor, tokenId, key, otfprefix) {
    let limit = settings.get('maxListSize')
    let cnt = 0
    let columns = 0
    let result = this.initializeEmptyCategory(key);
    GURPS.recurselist(actor.data.data[key], (e, k, d) => {
      if (e.level > 0) {
        cnt++
        let attributeCategory = this.initializeEmptySubcategory();
        let q = '"'
        if (e.name.includes(q)) q = "'"
        attributeCategory.actions.push({
          name: e.name + ' (' + e.level + ')',
          encodedValue: ["otf", tokenId, otfprefix + ':' + q + e.name + q].join(this.delimiter)
        }); 
        this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)
        
        this._combineSubcategoryWithCategory(result, '', attributeCategory);
        if (cnt >= limit) {
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

  _advantages(result, actor, tokenId) {
    let any = false
    let cat = this.initializeEmptyCategory("ads");
    GURPS.recurselist(actor.data.data.ads, (e, k, d) => {
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
    if (this._addNoteOTFs(attributeCategory, tokenId, actor.data.data.additionalresources.qnotes))
      this._combineSubcategoryWithCategory(cat, '', attributeCategory);
      this._combineCategoryWithList(result, this.i18n("GURPS.quicknotes"), cat);
   }
 
  _ranged(actor, tokenId) {
    let result = this.initializeEmptyCategory("ranged");
    GURPS.recurselist(actor.data.data.ranged, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      let q = '"'
      if (e.name.includes(q)) q = "'"
      let usage = !!e.mode ? ' (' + e.mode + ')' : ''
      let name = e.name + usage
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.attack") + ' (' + e.level + ')',
        encodedValue: ["otf", tokenId, 'R:' + q + name + q].join(this.delimiter),
      }); 
      if (!isNaN(parseInt(e.acc))) {
        let acc = (e.acc >= 0 ? '+':'') + e.acc
        attributeCategory.actions.push({
          name: this.i18n("tokenactionhud.gurps.addacc") + ' (' + acc +')',
          encodedValue: ["otf", tokenId, acc + ' ' + name + ' ' + this.i18n('GURPS.acc')].join(this.delimiter),
        }); 
      }
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.damage") + ' (' + e.damage + ')',
        encodedValue: ["otf", tokenId, 'D:' + q + name + q].join(this.delimiter),
      }); 

      this._addNoteOTFs(attributeCategory, tokenId, name + ' ' + e.notes)

      this._combineSubcategoryWithCategory(result, name, attributeCategory);
    })
    return result
  }
  
  _addNoteOTFs(attributeCategory, tokenId, notes) {
    let any = false
    if (!!notes)
      GURPS.gurpslink(notes, false, true).forEach(a => {
        any = true
        attributeCategory.actions.push({
          name: a.text, // a.text.match(/<span.*>(.*)<\/span>/)[1],
          encodedValue: ["otf", tokenId, a.action.orig].join(this.delimiter),
          //cssClass: 'standalonggurpslink'
        }); 
      })
    return any
  }
  
  _melee(actor, tokenId) {
    let result = this.initializeEmptyCategory("melee");
    GURPS.recurselist(actor.data.data.melee, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      let q = '"'
      if (e.name.includes(q)) q = "'"
      let usage = !!e.mode ? ' (' + e.mode + ')' : ''
      let name = e.name + usage
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.attack") + ' (' + e.level + ')',
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
        name: this.i18n("tokenactionhud.damage") + ' (' + e.damage + ')',
        encodedValue: ["otf", tokenId, 'D:' + q + name + q].join(this.delimiter),
      }); 

      this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)
      this._combineSubcategoryWithCategory(result, name, attributeCategory);
    })
    return result
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
    
  _defenses(actor, tokenId) {
    let result = this.initializeEmptyCategory("defenses");

    let cat = this._addDefense(tokenId, this.i18n('GURPS.dodge') + ' (' + actor.data.data.currentdodge + ')', 'DODGE')
    this._addDefense(tokenId, this.i18n('tokenactionhud.gurps.retreatdodge') + ' (' + (actor.data.data.currentdodge + 3) + ')', 'DODGE +3 ' + this.i18n('GURPS.modifierDodgeRetreat'), cat)
    this._combineSubcategoryWithCategory(result, '', cat);
    
    if (!!actor.data.data.equippedparry) {
      cat = this._addDefense(tokenId, this.i18n('GURPS.parry') + ' (' + actor.data.data.equippedparry + ')', 'PARRY')
      if (!!actor.data.data.equippedparryisfencing)
        this._addDefense(tokenId, this.i18n("tokenactionhud.gurps.retreatparryfence") + ' (' + (actor.data.data.equippedparry + 3) + ')', 'PARRY +3 fencing retreat', cat)
      else
        this._addDefense(tokenId, this.i18n("tokenactionhud.gurps.retreatparry") + ' (' + (actor.data.data.equippedparry + 1) + ')', 'PARRY +1 retreating', cat)
      this._combineSubcategoryWithCategory(result, '', cat);
    }
    if (!!actor.data.data.equippedblock) {
      cat = this._addDefense(tokenId, this.i18n('GURPS.block') + ' (' + actor.data.data.equippedblock + ')', 'BLOCK')
      this._addDefense(tokenId, this.i18n("tokenactionhud.gurps.retreatblock") + ' (' + (actor.data.data.equippedblock + 1) + ')', 'BLOCK +1 retreating', cat)
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

    for (let attribute in actor.data.data.attributes) {
      let attributeCategory = this.initializeEmptySubcategory();
      
      let name = this.i18n(`GURPS.attributes${attribute}`) + ' (' + actor.data.data.attributes[attribute].value + ')'

      attributeCategory.actions.push({
        name: name,
        encodedValue: ["otf", tokenId, attribute].join(this.delimiter),
      });
      attributeCategory.actions.push({
        name: this.i18n('tokenactionhud.gurps.blindroll') + ' ' + name,
        encodedValue: ["otf", tokenId, '!' + attribute].join(this.delimiter),
      });
     
     this._combineSubcategoryWithCategory(result, this.i18n(`GURPS.attributes${attribute}NAME`), attributeCategory);
    }
    let any = false
    let attributeCategory = this.initializeEmptySubcategory();
    for (let rkey in actor.data.data.reactions) {
      let mod = actor.data.data.reactions[rkey]
      any = true
      let prefix = mod.modifier >= 0 ? '+' : ''
      let s = !!mod.situation ? ' ' + mod.situation : ''
      let n = prefix + mod.modifier + s
      this._addNoteOTFs(attributeCategory, tokenId, '[' + n + ']')
    }
    if (any) this._combineSubcategoryWithCategory(result, this.i18n(`GURPS.reaction`), attributeCategory);
    any = false
    attributeCategory = this.initializeEmptySubcategory();
    for (let rkey in actor.data.data.conditionalmods) {
      let mod = actor.data.data.conditionalmods[rkey]
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