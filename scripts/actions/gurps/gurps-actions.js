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
        this.i18n("tokenactionhud.gurps.attributes"),
        attributes
      );
  
      if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;
  
      return result;
    }
    
  _attributes(actor, tokenId) {
    let result = this.initializeEmptyCategory("attributes");

    for (let attribute in actor.data.data.attributes) {
      let attributeCategory = this.initializeEmptySubcategory();
      
      let name = this.i18n(`tokenactionhud.gurps.attribute.${attribute}`);
      let encodedValue = ["attributes", tokenId, attribute].join(this.delimiter);

      attributeCategory.actions.push({
        name: name,
        encodedValue: ["attributes", tokenId, attribute].join(this.delimiter),
      });
      attributeCategory.actions.push({
        name: this.i18n('tokenactionhud.gurps.blindroll') + ' ' + name,
        encodedValue: ["blindroll", tokenId, attribute].join(this.delimiter),
      });
     
      let attributeTitle = this.i18n(
        actor.data.data.attributes[attribute].label
      );
      this._combineSubcategoryWithCategory(
        result,
        this.i18n('tokenactionhud.gurps.primary'),
        attributeCategory
      );
    }
    return result;
  }

}