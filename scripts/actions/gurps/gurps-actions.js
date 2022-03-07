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
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.melee"),
          this._melee(actor, tokenId)
        );
     
      if (Object.keys(actor.data.data.ranged).length > 0)
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.ranged"),
          this._ranged(actor, tokenId)
        );
     
      if (Object.keys(actor.data.data.skills).length > 0)
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.skills"),
          this._skillsspells(actor, tokenId, 'skills', 'Sk')
        );
        
      if (Object.keys(actor.data.data.spells).length > 0)
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.spells"),
          this._skillsspells(actor, tokenId, 'spells', 'Sp')
        );
      
      this._advantages(result, actor, tokenId)
      
      if (settings.get('showManeuvers') && !!game.combats.combats.find(c => (c.isActive && !!c.getCombatantByToken(tokenId))))
        this._combineCategoryWithList(
          result,
          this.i18n("GURPS.setManeuver"),
          this._maneuvers(actor, tokenId)
        );
  
      if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;
  
      return result;
    }
    
  _advantages(result, actor, tokenId) {
    let any = false
    let cat = this.initializeEmptyCategory("ads");
    GURPS.recurselist(actor.data.data.ads, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)

      if (attributeCategory.actions.length > 0) {
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
  
  _skillsspells(actor, tokenId, key, otfprefix) {
    let result = this.initializeEmptyCategory(key);
    GURPS.recurselist(actor.data.data[key], (e, k, d) => {
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
      }
    })
    return result
  }

  _ranged(actor, tokenId) {
    let result = this.initializeEmptyCategory("ranged");
    GURPS.recurselist(actor.data.data.ranged, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      let q = '"'
      if (e.name.includes(q)) q = "'"
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.attack") + ' (' + e.level + ')',
        encodedValue: ["otf", tokenId, 'R:' + q + e.name + q].join(this.delimiter),
      }); 
      if (!isNaN(parseInt(e.acc))) {
        let acc = (e.acc >= 0 ? '+':'') + e.acc
        attributeCategory.actions.push({
          name: this.i18n("tokenactionhud.gurps.addacc") + ' (' + acc +')',
          encodedValue: ["otf", tokenId, acc + ' ' + e.name + ' ' + this.i18n('GURPS.acc')].join(this.delimiter),
        }); 
      }
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.damage") + ' (' + e.damage + ')',
        encodedValue: ["otf", tokenId, 'D:' + q + e.name + q].join(this.delimiter),
      }); 

      this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)

      this._combineSubcategoryWithCategory(result, e.name, attributeCategory);
    })
    return result
  }
  
  _addNoteOTFs(attributeCategory, tokenId, notes) {
      GURPS.gurpslink(notes, false, true).forEach(a => {
      attributeCategory.actions.push({
        name: a.text, // a.text.match(/<span.*>(.*)<\/span>/)[1],
        encodedValue: ["otf", tokenId, a.action.orig].join(this.delimiter),
        //cssClass: 'standalonggurpslink'
      }); 
    })
  }
 
  _melee(actor, tokenId) {
    let result = this.initializeEmptyCategory("melee");
    GURPS.recurselist(actor.data.data.melee, (e, k, d) => {
      let attributeCategory = this.initializeEmptySubcategory();
      let q = '"'
      if (e.name.includes(q)) q = "'"
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.attack") + ' (' + e.level + ')',
        encodedValue: ["otf", tokenId, 'M:' + q + e.name + q].join(this.delimiter),
      }); 
      if (!isNaN(parseInt(e.parry)))
        attributeCategory.actions.push({
          name: this.i18n("GURPS.parry") + ' (' + e.parry + ')',
          encodedValue: ["otf", tokenId, 'P:' + q + e.name + q].join(this.delimiter),
        }); 
      if (!isNaN(parseInt(e.block)))
        attributeCategory.actions.push({
          name: this.i18n("GURPS.block") + ' (' + e.block + ')',
          encodedValue: ["otf", tokenId, 'B:' + q + e.name + q].join(this.delimiter),
        }); 
      attributeCategory.actions.push({
        name: this.i18n("tokenactionhud.damage") + ' (' + e.damage + ')',
        encodedValue: ["otf", tokenId, 'D:' + q + e.name + q].join(this.delimiter),
      }); 

      this._addNoteOTFs(attributeCategory, tokenId, e.name + ' ' + e.notes)
      
      this._combineSubcategoryWithCategory(result, e.name, attributeCategory);
    })
    return result
  }
  
  _maneuvers(actor, tokenId) {
    let result = this.initializeEmptyCategory("maneuvers");
    let attributeCategory = this.initializeEmptySubcategory();
    Object.values(GURPS.Maneuvers.getAll()).map(e => this.i18n(e.data.label)).forEach(e => {
      attributeCategory.actions.push({
        name: e,
        encodedValue: ["otf", tokenId, '/man ' + e].join(this.delimiter),
      }); 
    })   
    this._combineSubcategoryWithCategory(result, '', attributeCategory);
    return result
  }
    
  _defenses(actor, tokenId) {
    let result = this.initializeEmptyCategory("defenses");

    let cat = this._addDefense(tokenId, this.i18n('GURPS.dodge') + ' (' + actor.data.data.currentdodge + ')', 'DODGE')
    this._addDefense(tokenId, this.i18n('tokenactionhud.gurps.retreatdodge', 'DODGE +3 ' + this.i18n('GURPS.modifierDodgeRetreat')), cat)
    this._combineSubcategoryWithCategory(result, '', cat);
    
    if (!!actor.data.data.equippedparry) {
      cat = this._addDefense(tokenId, this.i18n('GURPS.parry') + ' (' + actor.data.data.equippedparry + ')', 'PARRY')
      if (!!actor.data.data.equippedparryisfencing)
        this._addDefense(tokenId, this.i18n("tokenactionhud.gurps.retreatparryfence"), 'PARRY +3 fencing retreat', cat)
      else
        this._addDefense(tokenId, this.i18n("tokenactionhud.gurps.retreatparry"), 'PARRY +1 retreating', cat)
      this._combineSubcategoryWithCategory(result, '', cat);
    }
    if (!!actor.data.data.equippedblock) {
      cat = this._addDefense(tokenId, this.i18n('GURPS.block') + ' (' + actor.data.data.equippedblock + ')', 'BLOCK')
      this._addDefense(tokenId, this.i18n("tokenactionhud.gurps.retreatblock"), 'BLOCK +1 retreating', cat)
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
    return result;
  }

}