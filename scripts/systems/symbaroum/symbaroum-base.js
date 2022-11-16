import { RollHandler } from "../../core/rollHandler/rollHandler.js";
import * as settings from "../../core/settings.js";

export class RollHandlerBaseSymbaroum extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");
    if (payload.length !== 4) {
      super.throwInvalidValueErr();
    }
    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    let actor = super.getActor(actorId, tokenId);
    switch (actionType) {
      case "weapon":
        this._handleWeapon(actionType, event, actor, actionId);
        break;
      case "armor":
        this._handleArmor(actionType, event, actor, actionId);
        break;
      case "ability":
        this._handleAbility(actionType, event, actor, actionId);
        break;
      case "mysticalPower":
        this._handleMysticalPowers(actionType, event, actor, actionId);
        break;
      case "trait":
        this._handleTraits(actionType, event, actor, actionId);
        break;
      case "attribute":
        this._handleAttributes(actionType, event, actor, actionId);
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
