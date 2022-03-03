import {ActionHandler} from "../actionHandler.js";
import * as settings from "../../settings.js";
import {Logger} from "../../logger.js";

export class ActionHandlerGURPS extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }


    doBuildActionList(token, multipleTokens) {
      let result = this.initializeEmptyActionList();
      if (!token) return result;
      let tokenId = token.data._id;
      result.tokenId = tokenId;
      let actor = token.actor;
      if (!actor) return result;
      result.actorId = actor.data._id;
      
      
      let attributes = this._attributes(actor, tokenId);
  
      this._combineCategoryWithList(
        result,
        this.i18n("tokenactionhud.attributes"),
        attributes
      );
      
      this._combineCategoryWithList(
        result,
        this.i18n("tokenactionhud.defenses"),
        this._defenses(actor, tokenId)
      );
      
  
      if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;
  
      return result;
    }
    
  _defenses(actor, tokenId) {
    let result = this.initializeEmptyCategory("defenses");

    let cat = this._addDefense(tokenId, 'Dodge', 'DODGE')
    this._addDefense(tokenId, 'Retreating Dodge', 'DODGE +3 retreating', cat)
    this._combineSubcategoryWithCategory(result, '', cat);

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
      
      let name = this.i18n(`tokenactionhud.gurps.attribute.${attribute}`);

      attributeCategory.actions.push({
        name: name,
        encodedValue: ["otf", tokenId, attribute].join(this.delimiter),
      });
      attributeCategory.actions.push({
        name: this.i18n('tokenactionhud.gurps.blindroll') + ' ' + name,
        encodedValue: ["otf", tokenId, '!' + attribute].join(this.delimiter),
      });
     
     this._combineSubcategoryWithCategory(result, '', attributeCategory);
    }
    return result;
  }

}