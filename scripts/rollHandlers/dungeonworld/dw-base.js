import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseDw extends RollHandler {
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
    let charType = actor.type;

    if (charType === "character") {
      switch (actionType) {
        case "damage":
          this._handleDamage(actionType, event, actor, actionId);
          break;
        case "move":
        case "spell":
        case "equipment":
          this._handleMove(actionType, event, tokenId, actor, actionId);
          break;
        case "ability":
          this._handleAbility(actionType, event, actor, actionId);
          break;
      }
    } else if (charType === "npc") {
      switch (actionType) {
        case "damage":
          this._handleDamage(actionType, event, actor, actionId);
          break;
        case "move":
          this._handleMoveNpc(actionType, event, actor, actionId);
          break;
        case "tag":
        case "quality":
        case "instinct":
          this._handleTextNpc(actionType, event, actor, actionId);
          break;
      }
    }
  }

  _handleDamage(actionType, event, actor, actionId) {
    let damage = actor.system.attributes.damage;
    let damageDie = `${damage.value}`;
    let damageMod = damage.misc.value > 0 ? damage.misc.value : 0;

    let flavour = damage.piercing;

    let formula = damageMod > 0 ? `${damageDie}+${damageMod}` : damageDie;
    let title = this.i18n("tokenActionHud.damage");

    let templateData = {
      title: title,
      flavor: `${flavour}`,
    };
    actor.rollMove(formula, actor, {}, templateData);
  }

  _handleMove(actionType, event, tokenId, actor, actionId) {
    let move = actor.items.get(actionId);

    if (this.isRenderItem()) {
      this.doRenderItem(actorId, tokenId, actionId);
      return;
    }

    move.roll();
  }

  _handleAbility(actionType, event, actor, actionId) {
    let ability = actor.system.abilities[actionId];

    let mod = ability.mod;
    let formula = `2d6+${mod}`;

    let title = `${ability.label} ${game.i18n.localize("tokenActionHud.roll")}`;
    let abilityText = ability.label.toLowerCase();

    let templateData = {
      title: title,
      flavor: `Made a move using ${abilityText}!`,
    };
    actor.rollMove(formula, actor, {}, templateData);
  }

  _handleTextNpc(actionType, event, actor, actionId) {
    let action = decodeURIComponent(actionId);

    let title = actionType.charAt(0).toUpperCase() + actionType.slice(1);
    let templateData = {
      title: title,
      details: action,
    };
    actor.rollMove(null, actor, {}, templateData);
  }
}
