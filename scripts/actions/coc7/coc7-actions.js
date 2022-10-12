import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerCoC7 extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;
    const actorTypes = ["character", "npc", "creature"];
    if (!actorTypes.includes(actor.type)) {
      return result;
    }

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "actions"))
      this._buildActions(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);

    return actionList;
  }

  _buildActions(actionList, character) {
    const actorId = character?.actor?.id;
    const tokenId = character?.actor?.id;
    const actor = character?.actor;
    const categorySubcategoryId = "characteristic";
    const meleeSubcategoryId = "melee";
    const rangedSubcategoryId = "ranged";
    let categoryActions = [];
    let meleeActions = [];
    let rangedActions = [];

    // Characteristics
    for (const characteristicKey of actor.system.characteristics) {
      const actionType = "characteristic";
      const id = characteristicKey;
      const name = this.i18n(
        actor.system.characteristics[characteristicKey].label
      );
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      categoryActions.push({
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      });
    }
    if (actor.system.attribs.lck.value) {
      const actionType = "attribute";
      const id = "lck";
      const name = actor.system.attribs.lck.label;
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      categoryActions.push({
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      });
    }
    if (actor.system.attribs.san.value) {
      const actionType = "attribute";
      const id = "san";
      const name = actor.system.attribs.san.label;
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      categoryActions.push({
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      });
    }

    if (categoryActions.length) {
      categoryActions = this._sortItems(categoryActions);

      this.addActionsToActionList(
        actionList,
        categoryActions,
        categorySubcategoryId
      );
    }

    // Melee / Ranged
    for (const item of actor.items) {
      const actionType = "weapon";
      if (item.type === "weapon") {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, id].join(
          this.delimiter
        );
        const action = {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true,
        };
        if (item.system.properties?.rngd) {
          rangedActions.push(action);
        } else {
          meleeActions.push(action);
        }
      }
    }

    if (meleeActions.length) {
      meleeActions = this._sortItems(meleeActions);

      this.addActionsToActionList(actionList, meleeActions, meleeSubcategoryId);
    }

    if (rangedActions.length) {
      rangedActions = this._sortItems(rangedActions);

      this.addActionsToActionList(
        actionList,
        rangedActions,
        rangedSubcategoryId
      );
    }
  }

  _buildSkills(actionList, character) {
    const actorId = character?.actor?.id;
    const tokenId = character?.actor?.id;
    const actor = character?.actor;
    const actionType = "skill";
    const subcategoryId = "skills";

    let actions = [];
    for (const item of actor.items) {
      if (item.type === actionType) {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, item.name].join(
          this.delimiter
        );
        const action = {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true,
        };
        actions.push(action);
      }
    }

    if (actions.length) {
      actions = _sortItems(actions);

      this.addActionsToActionList(actionList, actions, subcategoryId);
    }
  }

  _sortItems(items) {
    let result = Object.values(items);
    result.sort((a, b) => {
      return a.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .localeCompare(
          b.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase()
        );
    });
    return result;
  }
}
