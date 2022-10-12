import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerBitD extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "actions"))
      this._buildActions(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "resistances"))
      this._buildResistances(actionList, character);

    return actionList;
  }

  _buildActions(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "action";
    const subcategoryId = "actions";

    let actions = [];

    for (const attribute of actor.system.attributes) {
      for (const skillName in actor.system.attributes[attribute].skills) {
        const skill = actor.system.attributes[attribute].skills[skillName];
        const id = skillName;
        const name = this.i18n(skill.label);
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter);
        const action = {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true,
        }

        actions.push(action);
      }
    }
    
    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildResistances(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "resistance";
    const subcategoryId = "actions";
   
    let actions = [];

    for (const attribute in actor.system.attributes) {
      const id = attribute;
      const name = this.i18n(actor.system.attributes[attribute].label);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: name,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      }
      
      actions.push(action);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }
}
