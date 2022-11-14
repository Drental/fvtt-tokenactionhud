import { ActionHandler } from "./actionHandler.js";

export class ExampleActionHandler extends ActionHandler {
  constructor(filterManager) {
    super(filterManager);
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

    let inventoryCategory = this._buildInventoryCategory(actor, tokenId);

    this._combineCategoryWithList(
      result,
      this.i18n("tokenActionHud.inventory"),
      inventoryCategory
    ); // combines the inventory category with the list with the title given by the second argument.

    return result;
  }

  _buildInventoryCategory(actor, tokenId) {
    let result = this.initializeEmptyCategory("inventory"); // string given is an ID not a title.
    let macroType = "item";

    let items = actor.items;

    let weapons = items.filter(
      (i) => i.type === "weapons" && i.system.equipped
    );
    let weaponsActions = this._produceMap(tokenId, weapons, macroType);
    let weaponsSubcategory = this.initializeEmptySubcategory();
    weaponsSubcategory.actions = weaponsActions;
    this._combineSubcategoryWithCategory(result, "weapons", weaponsSubcategory);

    let armor = items.filter(
      (i) => i.type === "armor" && i.system.equipped
    );
    let armorActions = this._produceMap(tokenId, armor, macroType);
    let armorSubcategory = this.initializeEmptySubcategory();
    armorSubcategory.actions = armorActions;
    this._combineSubcategoryWithCategory(result, "armor", armorSubcategory);

    let consumables = items.filter((i) => i.type === "consumables");
    let consumablesActions = this._produceMap(tokenId, consumables, macroType);
    let consumablesSubcategory = this.initializeEmptySubcategory();
    consumablesSubcategory.actions = consumablesActions;
    this._combineSubcategoryWithCategory(
      result,
      "consumables",
      consumablesSubcategory
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
