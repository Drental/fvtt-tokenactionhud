import { ActionHandler } from "./actionHandler.js";

export class ExampleActionHandler extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;
    if (actor) {
      this._buildSingleTokenActions(actionList, character, subcategoryIds);
    } else {
      this._buildMultipleTokenActions(actionList, subcategoryIds);
    }
    return actionList;
  }

  _buildSingleTokenActions(actionList, character, subcategoryIds) {
    // Get a list of subcategoryIds related to inventory
    const inventorySubcategoryIds = subcategoryIds.filter(
      (subcategoryId) =>
        subcategoryId === "weapons" ||
        subcategoryId === "equipment" ||
        subcategoryId === "consumables"
    );

    // If statement to only execute code where the subcategory is selected by the user
    if (inventorySubcategoryIds)
      this._buildInventory(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);
  }

  _buildMultipleTokenActions(actionList, subcategoryIds) {
    // Create new character variable for use in methods shared by single and multi tokens
    const character = { actor: { id: "multi" }, token: { id: "multi" } };

    // If statement to only execute code where the subcategory is selected by the user
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);
  }

  _buildInventoryCategory(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "item";
    const items = actor.items;

    // Weapons
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "weapons"
      )
    ) {
      const weapons = items.filter(
        (item) => item.type === "weapons" && item.system.equipped
      );
      this._buildItems(actionList, character, weapons, "weapons");
    }

    // Equipment
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "equipment"
      )
    ) {
      const equipment = items.filter(
       (item) => item.type === "equipment" && item.system.equipped
      );
    this._buildItems(actionList, character, equipment, "equipment");
    }

    // Consumables
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "consumables"
      )
    ) {
      const consumables = items.filter((item) => item.type === "consumables");
      this._buildItems(actionList, character, consumables, "consumables");
    }
  }

  /** @private */
  _buildItems(actionList, character, items, subcategoryId) {
    const actionType = "item";
    const actions = items.map((item) =>
      this._getAction(character, actionType, item)
    );
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _getAction(character, actionType, entity) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const id = entity.id;
    const name = entity.name;
    const encodedValue = [actionType, actorId, tokenId, id].join(
      this.delimiter
    );
    const action = {
      id: id,
      name: name,
      encodedValue: encodedValue,
      selected: true
    };
    return action;
  }
}
