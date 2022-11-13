import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { ActionSet } from "../entities/actionSet.js";

/*
ActionList 
{
    "tokenId": "Normally token._id"
    "actionId": "Normally token.actor._id"
    "categories": []
}

A category:
{
    "id": 'Used for filtering',
    "name": 'Category title',
    "subcategories": []
}

A subcategory:
{
    id: 'Not used currently',
    name: 'Subcategory title',
    info1: 'Extra information to display alongside the category',
    actions: [],
    subcategories: []
}

An action:
    {
        name: "The name of the item",
        info1: "",
        info2: "",
        cssClass: "",
        encodedValue: "";
    }
*/

export class ActionHandlerCypherSystem extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
        let result = this.initializeEmptyActionList();
        if (!token) return result;
        let tokenId = token.id;
        result.tokenId = tokenId;
        let actor = token.actor;
        if (!actor) return result;
        
        if (actor.type !== 'pc') {
          return result;
        }        

        let pools = this._getPools(actor, tokenId);
        let skills = this._getSkills(actor, tokenId);
        let combat = this._getCombat(actor, tokenId);
        let abilities = this._getAbilities(actor, tokenId);
    
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.pools"),
          pools
        );
    
        this._combineCategoryWithList(
            result,
            this.i18n("tokenActionHud.skills"),
            skills
        );
      
        this._combineCategoryWithList(
            result,
            this.i18n("tokenActionHud.combat"),
            combat
        );
      
        this._combineCategoryWithList(
            result,
            this.i18n("tokenActionHud.abilities"),
            abilities
        );
      
        if (settings.get("showHudTitle")) result.hudTitle = token.name;
    
        return result;    
    }

    _getPools(actor, tokenId) {
        let result = this.initializeEmptyCategory("pools");
        let category = this.initializeEmptySubcategory();
        let pools = this.initializeEmptySubcategory();
        let combat = this.initializeEmptySubcategory();
    
        // Pools
        for (const key of [ "might", "speed", "intellect" ]) {
            category.actions.push({
              name: this.i18n(`CYPHERSYSTEM.${key.capitalize()}`),
              encodedValue: ["pool", tokenId, key.capitalize()].join(this.delimiter),
            });
        }
        /*
        // Can't roll from the ADDITIONAL POOL at the moment; but keep for later use
        if (actor.system.settings.general.additionalPool.active) {
            category.actions.push({
                name: actor.system.settings.general.additionalPool.label || this.i18n(`CYPHERSYSTEM.AdditionalPool`),
                encodedValue: ["pool", tokenId, "additional"].join(this.delimiter),
              });  
        }
        */

        this._combineSubcategoryWithCategory(
            result,
            this.i18n(`ACTOR.Type${actor.type.capitalize()}`),
            category
        );

        return result;
    }

    _getCombat(actor, tokenId) {
        let result = this.initializeEmptyCategory("combat");
        let subcat = this.initializeEmptySubcategory();

        for (const item of actor.items.filter( item => item.type === 'attack')) {
            subcat.actions.push({
                name: item.name,
                encodedValue: ["attack", tokenId, item.id].join(this.delimiter),
            });
        }

        this._combineSubcategoryWithCategory(
            result,
            this.i18n(`ACTOR.Type${actor.type.capitalize()}`),
            subcat
        );

        return result;
    }

    _getSkills(actor, tokenId) {
        let result = this.initializeEmptyCategory("skills");
        let subcat = this.initializeEmptySubcategory();

        for (const item of actor.items.filter( item => item.type === 'skill')) {
            subcat.actions.push({
                name: item.name,
                encodedValue: ["skill", tokenId, item.id].join(this.delimiter),
            });
        }

        this._combineSubcategoryWithCategory(
            result,
            this.i18n(`ACTOR.Type${actor.type.capitalize()}`),
            subcat
        );

        return result;
    }

    _getAbilities(actor, tokenId) {
        let result = this.initializeEmptyCategory("abilities");
        let subcat = this.initializeEmptySubcategory();

        for (const item of actor.items.filter( item => item.type === 'ability')) {
            subcat.actions.push({
                name: item.name,
                encodedValue: ["ability", tokenId, item.id].join(this.delimiter),
            });
        }

        this._combineSubcategoryWithCategory(
            result,
            this.i18n(`ACTOR.Type${actor.type.capitalize()}`),
            subcat
        );

        return result;
    }

}