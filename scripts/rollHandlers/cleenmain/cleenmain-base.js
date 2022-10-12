import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseCleenmain extends RollHandler {
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
      case "skill":
        this._handleSkill(actionType, event, actor, itemId);
        break;
    }
  }

  _handleWeapon(actionType, event, actor, itemId) {
    return actor.check(itemId, "weapon-attack");
  }

  _handleSkill(actionType, event, actor, itemId) {
    return actor.check(itemId, "skill");
  }
}