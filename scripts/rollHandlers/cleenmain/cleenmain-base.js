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
    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    let actor = super.getActor(tokenId, actorId);
    switch (actionType) {
      case "weapon":
        this._handleWeapon(actionType, event, actor, actionId);
        break;
      case "skill":
        this._handleSkill(actionType, event, actor, actionId);
        break;
    }
  }

  _handleWeapon(actionType, event, actor, actionId) {
    return actor.check(itemId, "weapon-attack");
  }

  _handleSkill(actionType, event, actor, actionId) {
    return actor.check(itemId, "skill");
  }
}