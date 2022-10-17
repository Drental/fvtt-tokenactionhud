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
      return actionList;
    }

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "characteristics"))
      this._buildCharacteristics(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "attributes"))
      this._buildAttributes(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "weapons"))
      this._buildWeapons(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);

    return actionList;
  }

  _buildCharacteristics(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.actor?.id;
    const actionType = "characteristic"
    const subcategoryId = "characteristics";
    const characteristics = actor.system.characteristics
    const actions = characteristics.map((characteristic) => {
      const id = characteristic;
      const name = this.i18n(
        actor.system.characteristics[characteristic].label
      );
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      }
    });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildAttributes(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.actor?.id;
    const actionType = "attribute";
    const subcategoryId = "attributes";
    let actions = [];
    if (actor.system.attribs.lck.value) {
      const id = "lck";
      const name = actor.system.attribs.lck.label;
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      actions.push({
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      });
    }
    if (actor.system.attribs.san.value) {
      const id = "san";
      const name = actor.system.attribs.san.label;
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      actions.push({
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      });
    }
    this.addActionsToActionList(
      actionList,
      actions,
      subcategoryId
    );
  }

  _buildWeapons(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.actor?.id;
    const actionType = "weapon";
    const subcategoryId = "weapons";
    let items = actor.items;
    const actions = items
      .filter((item) => item.type === actionType)
      .map((item) => {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, id].join(
          this.delimiter
        );
        return {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true
        }
      })
    this.addActionsToActionList(
      actionList,
      actions,
      subcategoryId
    );
  }

  _buildSkills(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.actor?.id;
    const actionType = "skill";
    const subcategoryId = "skills";
    const items = actor.items;
    const actions = items
      .filter((item) => item.type === actionType)
      .map((item) => {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, id].join(
          this.delimiter
        );
        return {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true
        }
      });
    this.addActionsToActionList(actionList, actions, subcategoryId);
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
