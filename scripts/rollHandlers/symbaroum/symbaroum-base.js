import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseSymbaroum extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }
    let actionType = payload[0];
    let characterId = payload[1];
    let itemId = payload[2];

    let actor = super.getActor(characterId);
    switch (actionType) {
      case "weapon":
        this._handleWeapon(actionType, event, actor, itemId);
        break;
      case "armor":
        this._handleArmor(actionType, event, actor, itemId);
        break;
      case "ability":
        this._handleAbility(actionType, event, actor, itemId);
        break;
      case "mysticalPower":
        this._handleMysticalPowers(actionType, event, actor, itemId);
        break;
      case "trait":
        this._handleTraits(actionType, event, actor, itemId);
        break;
      case "attribute":
        this._handleAttributes(actionType, event, actor, itemId);
        break;
    }
  }

  _handleWeapon(actionType, event, actor, actionId) {
    let usedItem = actor.system.weapons.filter(
      (item) => item.id === actionId
    );
    actor.rollWeapon(usedItem[0]);
  }

  _handleArmor(actionType, event, actor, actionId) {
    actor.rollArmor();
  }

  _handleAbility(actionType, event, actor, actionId) {
    let usedPower = actor.items.filter((item) => item.id === actionId);
    actor.usePower(usedPower[0]);
  }

  _handleMysticalPowers(actionType, event, actor, actionId) {
    let usedPower = actor.items.filter((item) => item.id === actionId);
    actor.usePower(usedPower[0]);
  }

  _handleTraits(actionType, event, actor, actionId) {
    let usedPower = actor.items.filter((item) => item.id === actionId);
    actor.usePower(usedPower[0]);
  }

  _handleAttributes(actionType, event, actor, actionId) {
    actor.rollAttribute(actionId);
  }
}
