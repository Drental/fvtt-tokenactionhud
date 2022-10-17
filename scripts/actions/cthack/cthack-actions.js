import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerCthack extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;
    if (actor.type !== "character") return;

    const inventorySubcategoryIds = subcategoryIds.filter(
      (subcategoryId) =>
        subcategoryId === "weapons" || subcategoryId === "equipment"
    );

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "saves"))
      this._buildSaves(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "attributes"))
      this._buildAttributes(actionList, character);
    if (inventorySubcategoryIds)
      this._buildInventory(actionList, character, inventorySubcategoryIds);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "abilities"))
      this._buildAbilities(actionList, character);

    return actionList;
  }

  /** @private */
  _buildSaves(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "save";
    const subcategoryId = "saves";
    const saves = Object.entries(actor.system.saves);
    const actions = saves.map((save) => {
      const id = save[0];
      const name = game.cthack.config.saves[id];
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true
      };
    });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _buildAttributes(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const subcategoryId = "attributes";
    const attributes = actor.getAvailableAttributes();
    const actions = attributes.map((attribute) => {
      const id = attribute[0];
      let name;
      if (
        id === "miscellaneous" &&
        game.settings.get("cthack", "MiscellaneousResource") !== ""
      ) {
        name = game.settings.get("cthack", "MiscellaneousResource");
      } else {
        name = game.cthack.config.attributes[id];
      }
      let actionType = "resource";
      if (id === "armedDamage" || id === "unarmedDamage") {
        actionType = "damage";
      }
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true
      };
    });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _buildInventory(actionList, character, inventorySubcategoryIds) {
    const actor = character.actor;

    // Weapons
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "weapons"
      )
    ) {
      const weapons = actor.items.filter((item) => item.type === "weapon");
      this._buildItems(actionList, character, weapons, "weapons");
    }

    // Equipment
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "equipment"
      )
    ) {
      const equipment = actor.items.filter((item) => item.type === "item");
      this._buildItems(actionList, character, equipment, "items");
    }
  }

  /** @private */
  _buildAbilities(actionList, character) {
    const actor = character?.actor;
    const actionType = "ability";
    const subcategoryId = "abilities";
    const abilities = actor.items.filter((item) => item.type === "ability");
    const actions = abilities.map((ability) =>
      this._getAction(character, actionType, ability)
    );
    this.addActionsToActionList(actionList, actions, subcategoryId);
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
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actor = character?.actor;
    const id = entity.id;
    const name = entity.name;
    const encodedValue = [actionType, actorId, tokenId, id].join(
      this.delimiter
    );
    const img = this.getImage(entity);
    const icon = this._getIcon(entity);
    const action = {
      id: id,
      name: name,
      encodedValue: encodedValue,
      img: img,
      icon: icon,
      selected: true,
    };
    return action;
  }

  /** @private */
  _getIcon(item) {
    // Capacity activable
    if (item.type === "ability" && item.system.uses?.per !== "Permanent") {
      if (item.system.uses.value > 0) {
        return '<i class="fas fa-check"></i>';
      } else return '<i class="fas fa-times"></i>';
    }
    return "";
  }
}
