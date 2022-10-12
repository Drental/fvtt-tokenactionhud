import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseT20 extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let actionType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    if (characterId === "multi") {
      for (let t of canvas.tokens.controlled) {
        let idToken = t.id;
        await this._handleMacros(event, actionType, idToken, actionId);
      }
    } else {
      await this._handleMacros(event, actionType, actorId, tokenId, actionId);
    }
  }

  async _handleMacros(event, actionType, actorId, tokenId, actionId) {
    switch (actionType) {
      case "atributo":
        this.rollAbilityMacro(event, actorId, tokenId, actionId);
        break;
      case "pericia":
        this.rollSkillMacro(event, actorId, tokenId, actionId);
        break;
      case "item":
      case "magia":
      case "poder":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollItemMacro(event, actorId, tokenId, actionId);
        break;
      // case 'effect':
      // await this.toggleEffect(event, tokenId, actionId);
      // break;
      // case 'condition':
      // await this.toggleCondition(event, tokenId, actionId);
      default:
        break;
    }
  }

  rollAbilityMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollAtributo(checkId);
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    const skillData = {
      actor: actor,
      type: "perícia",
      data: actor.system.pericias[checkId],
      name: actor.system.pericias[checkId].label,
      id: checkId,
    };
    actor.rollPericia(skillData);
  }

  rollItemMacro(event, actorId, tokenId, itemId) {
    let actor = super.getActor(characterId);
    let item = super.getItem(actor, itemId);

    // if (item.type === 'magia')
    // return actor._onItemRoll(item);

    return item.use({ event });
    // return actor._onItemRoll(item);
  }

  async performInitiativeMacro(tokenId) {
    let actor = super.getActor(characterId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, tokenId, effectId) {
    const actor = super.getActor(characterId);
    const effect = actor.effects.entries.find((e) => e.id === effectId);

    if (!effect) return;

    const statusId = effect.flags.core?.statusId;
    if (statusId) {
      await this.toggleCondition(event, tokenId, statusId);
      return;
    }

    await effect.update({ disabled: !effect.disabled });
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleCondition(event, tokenId, effectId) {
    const token = super.getToken(tokenId);
    const isRightClick = this.isRightClick(event);
    if (
      effectId.includes("combat-utility-belt.") &&
      game.cub &&
      !isRightClick
    ) {
      const cubCondition = this.findCondition(effectId)?.label;
      if (!cubCondition) return;

      game.cub.hasCondition(cubCondition, token)
        ? await game.cub.removeCondition(cubCondition, token)
        : await game.cub.addCondition(cubCondition, token);
    } else {
      const condition = this.findCondition(effectId);
      if (!condition) return;

      isRightClick
        ? await token.toggleOverlay(condition)
        : await token.toggleEffect(condition);
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  findCondition(id) {
    return CONFIG.statusEffects.find((effect) => effect.id === id);
  }
}
