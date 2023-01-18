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
export class ActionHandlerSWN extends ActionHandler {
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

    result.actorId = actor.id;

    // Build out the Inventory category
    let inventoryCategory = this._buildInventoryCategory(actor, tokenId);
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.inventory"),
      inventoryCategory
    ); // combines the inventory category with the list with the title given by the second argument.

    // build out skills category
    let skillsCategory = this._buildSkillsCategory(actor, tokenId);
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.skills"),
      skillsCategory
    );

    let focusCategory = this._buildAbilitiesCategory(actor, tokenId);
    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.abilities"),
      focusCategory
    );

    let shipCategory = this._buildShipCategory(actor, tokenId);
    this._combineCategoryWithList(
        result,
        this.i18n("ship"),
        shipCategory
    );

    return result;
  }

  _buildInventoryCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("inventory"); // string given is an ID not a title.
    let macroType = "item";

    let items = actor.items;

    let weapons = items.filter(
      (i) => i.type === "weapon" && i.system.location === "readied"
    );
    let weaponsActions = this._produceMap(tokenId, weapons, macroType);
    let weaponsSubcategory = this.initializeEmptySubcategory();
    weaponsSubcategory.actions = weaponsActions;
    this._combineSubcategoryWithCategory(result, "weapons", weaponsSubcategory);

    let misc = items.filter(
      (i) => i.type === "item" && i.system.location === "readied"
    );
    let miscActions = this._produceMap(tokenId, misc, macroType);
    let miscSubcategory = this.initializeEmptySubcategory("misc");
    miscSubcategory.actions = miscActions;
    this._combineSubcategoryWithCategory(result, "misc", miscSubcategory);

    return result;
  }

  _buildSkillsCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("skills");
    let macroType = "skill";

    let skills = actor.items.filter((i) => i.type === "skill");
    let skillActions = this._produceMap(tokenId, skills, macroType);
    let skillsSubcategory = this.initializeEmptySubcategory();
    skillsSubcategory.actions = skillActions;
    this._combineSubcategoryWithCategory(result, "skills", skillsSubcategory);
    return result;
  }

  _buildAbilitiesCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("focus");
    let focusMacroType = "focus";
    let powerMacroType = "power";
    let cyberareMacroType = "cyberware";


    let cyberware = actor.items.filter((i) => i.type === "cyberware");
    let cyberwareActions = this._produceMap(tokenId, cyberware, cyberareMacroType);
    let cyberwareSubcategory = this.initializeEmptySubcategory();
    cyberwareSubcategory.actions = cyberwareActions;
    this._combineSubcategoryWithCategory(result, "cyberware", cyberwareSubcategory);
    
    let focus = actor.items.filter((i) => i.type === "focus");
    let focusActions = this._produceMap(tokenId, focus, focusMacroType);
    let focusSubcategory = this.initializeEmptySubcategory();
    focusSubcategory.actions = focusActions;
    this._combineSubcategoryWithCategory(result, "focus", focusSubcategory);

    let powers = actor.items.filter((i) => i.type === "power");
    let powerActions = this._produceMap(tokenId, powers, powerMacroType);
    let powerSubcategory = this.initializeEmptySubcategory();
    powerSubcategory.actions = powerActions;
    this._combineSubcategoryWithCategory(result, "powers", powerSubcategory);
    
    return result;
  }

  _buildShipCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("shipFitting");
    let fittingMacroType = "shipFitting";
    let weaponMacroType = "shipWeapon";

    let shipWeapons = actor.items.filter((i) => i.type === "shipWeapon");
    let shipWeaponActions = this._produceMap(tokenId, shipWeapons, weaponMacroType);
    let shipWeaponSubcategory = this.initializeEmptySubcategory();
    shipWeaponSubcategory.actions = shipWeaponActions;
    this._combineSubcategoryWithCategory(
        result,
        "Weapons",
        shipWeaponSubcategory
    );

    let shipFittings = actor.items.filter((i) => i.type === "shipFitting");
    let shipFittingActions = this._produceMap(tokenId, shipFittings, fittingMacroType);
    let shipFittingSubcategory = this.initializeEmptySubcategory();
    shipFittingSubcategory.actions = shipFittingActions;
    this._combineSubcategoryWithCategory(
        result,
        "Fittings",
        shipFittingSubcategory
    );
    return result;
    }

  /** @private */
  _produceMap(tokenId, itemSet, macroType) {
    return itemSet
      .filter((i) => !!i)
      .map((i) => {
        let encodedValue = [macroType, tokenId, i.id].join(this.delimiter);
        return { name: i.name, encodedValue: encodedValue, id: i.id };
      });
  }
}
