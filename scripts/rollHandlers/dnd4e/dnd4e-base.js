import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseDnD4e extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length !== 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    if (characterId === "multi") {
      for (let t of canvas.tokens.controlled) {
        let idToken = t.id;
        await this._handleMacros(event, macroType, idToken, actionId);
      }
    } else {
      await this._handleMacros(event, macroType, actorId, tokenId, actionId);
    }
  }

  async _handleMacros(event, macroType, actorId, tokenId, actionId) {
    switch (macroType) {
      case "ability":
        this.rollAbilityMacro(event, actorId, tokenId, actionId);
        break;
      case "skill":
        this.rollSkillMacro(event, actorId, tokenId, actionId);
        break;
      case "feature":
      case "inventory":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollItemMacro(event, actorId, tokenId, actionId);
        break;
      case "power":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollPowerMacro(event, actorId, tokenId, actionId);
        break;
      case "utility":
        await this.performUtilityMacro(event, actorId, tokenId, actionId);
        break;
      case "effect":
        await this.toggleEffect(event, tokenId, actionId);
        break;
      case "condition":
        await this.toggleCondition(event, tokenId, actionId);
      default:
        break;
    }
  }

  rollAbilityMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    return game.dnd4eBeta.tokenBarHooks.rollAbility(actor, checkId, event);
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    return game.dnd4eBeta.tokenBarHooks.rollSkill(actor, checkId, event);
  }

  rollItemMacro(event, actorId, tokenId, itemId) {
    let actor = super.getActor(characterId);
    let item = super.getItem(actor, itemId);
    return game.dnd4eBeta.tokenBarHooks.rollItem(actor, item, event);
  }

  rollPowerMacro(event, actorId, tokenId, itemId) {
    let actor = super.getActor(characterId);
    let item = super.getItem(actor, itemId);

    if (this.needsRecharge(actor, item)) {
      event.currentTarget = { closest : (str) => {return {dataset : { itemId : itemId}}} };
      game.dnd4eBeta.tokenBarHooks.rechargePower(actor, item, event)
      return;
    }

    return game.dnd4eBeta.tokenBarHooks.rollPower(actor, item, event)
  }

  needsRecharge(actor, item) {
    return (
        item.system.useType === "recharge" && !game.dnd4eBeta.tokenBarHooks.isPowerAvailable(actor, item)
    );
  }

  async performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(characterId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case "toggleCombat":
        token.toggleCombat();
        Hooks.callAll("forceUpdateTokenActionHUD");
        break;
      case "toggleVisibility":
        token.toggleVisibility();
        break;
      case "saveDialog":
        game.dnd4eBeta.tokenBarHooks.saveDialog(actor, event)
        break;
      case "save":
        game.dnd4eBeta.tokenBarHooks.quickSave(actor, event)
        break;
      case "healDialog":
        game.dnd4eBeta.tokenBarHooks.healDialog(actor, event)
        break;
      case "initiative":
        await this.performInitiativeMacro(tokenId, event);
        break;
      case "actionPoint":
        game.dnd4eBeta.tokenBarHooks.actionPoint(actor, event)
        break;
      case "secondWind":
        game.dnd4eBeta.tokenBarHooks.secondWind(actor, event)
        break;
      case "deathSave":
        game.dnd4eBeta.tokenBarHooks.deathSave(actor, event)
        break;
      case "endTurn":
        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        break;
    }
  }

  async performInitiativeMacro(tokenId, event) {
    let actor = super.getActor(characterId);

    await actor.rollInitiative({ createCombatants: true, event });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, tokenId, effectId) {
    const actor = super.getActor(characterId);
    const effects =
      "find" in actor.effects.entries ? actor.effects.entries : actor.effects;
    const effect = effects.find((e) => e.id === effectId);

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
        ? await token.toggleEffect(condition, {overlay : true})
        : await token.toggleEffect(condition);
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  findCondition(id) {
    return CONFIG.statusEffects.find((effect) => effect.id === id);
  }
}
