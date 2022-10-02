import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseDemonlord extends RollHandler {
  constructor() {
    super();
  }

  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    if (characterId === "multi") {
      canvas.tokens.controlled.forEach((t) => {
        let idToken = t.id;
        this._handleMacros(event, macroType, idToken, actionId);
      });
    } else {
      this._handleMacros(event, macroType, actorId, tokenId, actionId);
    }
  }

  _handleMacros(event, macroType, actorId, tokenId, actionId) {
    let actor = super.getActor(characterId);
    let item = null;
    if (["weapon", "specialaction", "spell", "talent"].includes(macroType)) {
      item = actor.items.get(actionId);
    }

    switch (macroType) {
      case "challenge":
        const attribute = actor ? actor.system.attributes[actionId] : null;
        actor.rollChallenge(attribute, actionId);
        break;
      case "weapon":
        actor.rollWeaponAttack(item.id, null);
        break;
      case "talent":
      case "specialaction":
        actor.rollTalent(item.id, null);
        break;
      case "spell":
        actor.rollSpell(item.id, null);
        break;
      case "utility":
        this.performUtilityMacro(event, actorId, tokenId, actionId);
      default:
        break;
    }
  }

  async performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(characterId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case "rest":
        actor.restActor(token);
        break;
      case "toggleVisibility":
        token.toggleVisibility();
        break;
      case "toggleCombat":
        token.toggleCombat();
        Hooks.callAll("forceUpdateTokenActionHUD");
        break;
      case "endTurn":
        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        break;
    }
  }
}
