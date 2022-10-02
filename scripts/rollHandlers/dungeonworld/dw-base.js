import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseDw extends RollHandler {
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
    let actionId = payload[2];

    let actor = super.getActor(characterId);
    let charType = actor.type;

    if (charType === "character") {
      switch (macroType) {
        case "damage":
          this._handleDamage(macroType, event, actor, actionId);
          break;
        case "move":
        case "spell":
        case "equipment":
          this._handleMove(macroType, event, tokenId, actor, actionId);
          break;
        case "ability":
          this._handleAbility(macroType, event, actor, actionId);
          break;
      }
    } else if (charType === "npc") {
      switch (macroType) {
        case "damage":
          this._handleDamage(macroType, event, actor, actionId);
          break;
        case "move":
          this._handleMoveNpc(macroType, event, actor, actionId);
          break;
        case "tag":
        case "quality":
        case "instinct":
          this._handleTextNpc(macroType, event, actor, actionId);
          break;
      }
    }
  }

  _handleDamage(macroType, event, actor, actionId) {
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

  _handleMove(macroType, event, tokenId, actor, actionId) {
    let move = actor.items.get(actionId);

    if (this.isRenderItem()) {
      this.doRenderItem(actorId, tokenId, actionId);
      return;
    }

    move.roll();
  }

  _handleAbility(macroType, event, actor, actionId) {
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

  _handleTextNpc(macroType, event, actor, actionId) {
    let action = decodeURIComponent(actionId);

    let title = macroType.charAt(0).toUpperCase() + macroType.slice(1);
    let templateData = {
      title: title,
      details: action,
    };
    actor.rollMove(null, actor, {}, templateData);
  }
}
