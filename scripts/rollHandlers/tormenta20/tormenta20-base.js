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

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    if (tokenId === "multi") {
      for (let t of canvas.tokens.controlled) {
        let idToken = t.id;
        await this._handleMacros(event, macroType, idToken, actionId);
      }
    } else {
      await this._handleMacros(event, macroType, tokenId, actionId);
    }
  }

  async _handleMacros(event, macroType, tokenId, actionId) {
    switch (macroType) {
      case "atributo":
        this.rollAbilityMacro(event, tokenId, actionId);
        break;
      case "pericia":
        this.rollSkillMacro(event, tokenId, actionId);
        break;
      case "item":
      case "magia":
      case "poder":
        if (this.isRenderItem()) this.doRenderItem(tokenId, actionId);
        else this.rollItemMacro(event, tokenId, actionId);
        break;
      // case 'effect':
      // await this.toggleEffect(event, tokenId, actionId);
      // break;
      case 'condition':
        await this.toggleCondition(event, tokenId, actionId);
      default:
        break;
    }
  }

  rollAbilityMacro(event, tokenId, checkId) {
    const actor = super.getActor(tokenId);
    actor.rollAtributo(checkId);
  }

  rollSkillMacro(event, tokenId, checkId) {
    const actor = super.getActor(tokenId);
    actor.rollPericia(checkId);
  }

  rollItemMacro(event, tokenId, itemId) {
    let actor = super.getActor(tokenId);
    let item = super.getItem(actor, itemId);
    return item.roll();
  }

  async performInitiativeMacro(tokenId) {
    let actor = super.getActor(tokenId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, tokenId, effectId) {
    const actor = super.getActor(tokenId);
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
    const condition = this.findCondition(effectId);
    if (!condition) return;

    isRightClick
      ? await token.toggleEffect(condition, { overlay: true })
      : await token.toggleEffect(condition);

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  findCondition(id) {
    return CONFIG.statusEffects.find((effect) => effect.id === id);
  }
}
