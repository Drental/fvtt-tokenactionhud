import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerDs4 extends ActionHandler {

  /** @override */
  buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;
    if (actor) {
      this._buildSingleTokenActions(actionList, character, subcategoryIds);
    } else if (multipleTokens) {
      this._buildMultipleTokenActions(actionList, character, subcategoryIds);
    }
    return actionList;
  }

  _buildSingleTokenActions(actionList, character, subcategoryIds) {
    const items = actor.items
      .filter((item) => item.system.equipped)
      .sort((a, b) => a.sort - b.sort);

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "checks"))
      this._buildChecks(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "weapons"))
      this._buildWeapons(actionList, character, items);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "spells"))
      this._buildSpells(actionList, character, items);
  }

  _buildMultipleTokenActions(actionList, character, subcategoryIds) {
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "checks"))
      this._buildChecks(actionList, character);
  }

  // CHECKS

  _buildChecks(actionList, character) {
    const actor = character?.actor;
    const actorId = (actor) ? character?.actor?.id : "multi";
    const tokenId = (actor) ? character?.token?.id : "multi";
    const actionType = "check";
    const subcategoryId = "checks";
    const displayCheckTargetNumbers = !!actor && settings.get("displayCheckTargetNumbers");
    const checks = Object.entries(CONFIG.DS4.i18n.checks)
    const actions = checks.map((check) => {
      const id = check.id;
      const name = displayCheckTargetNumbers ? `${check.name} (${actor.system.checks[check.id]})` : check.name;
      const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
      const img = CONFIG.DS4.icons.checks[check.id];
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        img: img,
        selected: true
      }
    })
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // WEAPONS

  _buildWeapons(actionList, character, items) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "weapon";
    const subcategoryId = "weapons";
    const actions = items
      .filter((item) => item.type === actionType)
      .map((item) => {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
        const img = item.img;
        return {
          id: id,
          name: name,
          encodedValue: encodedValue,
          img: img,
        }
      });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // SPELLS

  _buildSpells(actionList, character, items) {
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "spell";
    const subcategoryId = "spells";
    const actions = items
      .filter((item) => item.type === actionType)
      .map((item) => {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
        const img = item.img;
        return {
          id: id,
          name: name,
          encodedValue: encodedValue,
          img: img,
        }
      });
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }
}
