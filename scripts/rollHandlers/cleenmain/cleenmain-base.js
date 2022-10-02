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
    let macroType = payload[0];
    let characterId = payload[1];
    let itemId = payload[2];

    let actor = super.getActor(characterId);
    switch (macroType) {
      case "weapon":
        this._handleWeapon(macroType, event, actor, itemId);
        break;
      case "skill":
        this._handleSkill(macroType, event, actor, itemId);
        break;
    }
  }

  _handleWeapon(macroType, event, actor, itemId) {
    return actor.check(itemId, "weapon-attack");
  }

  _handleSkill(macroType, event, actor, itemId) {
    return actor.check(itemId, "skill");
  }
}