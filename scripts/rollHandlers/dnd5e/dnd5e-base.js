import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBase5e extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length != 4) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let actorId = payload[1];
    let tokenId = payload[2];
    let actionId = payload[3];

    if (tokenId === "multi") {
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
        this.rollAbilityMacro(event, actorId, actionId);
        break;
      case "skill":
        this.rollSkillMacro(event, actorId, actionId);
        break;
      case "abilitySave":
        this.rollAbilitySaveMacro(event, actorId, actionId);
        break;
      case "abilityCheck":
        this.rollAbilityCheckMacro(event, actorId, actionId);
        break;
      case "item":
      case "weapon":
      case "spell":
      case "feat":
        if (this.isRenderItem()) this.doRenderItem(actorId, actionId);
        else this.rollItemMacro(event, actorId, actionId);
        break;
      case "utility":
        await this.performUtilityMacro(event, actorId, tokenId, actionId);
        break;
      case "effect":
        await this.toggleEffect(event, actorId, tokenId, actionId);
        break;
      case "condition":
        if (!tokenId) return;
        await this.toggleCondition(event, tokenId, actionId);
      default:
        break;
    }
  }

  rollAbilityMacro(event, actorId, checkId) {
    const actor = super.getActor(actorId);
    actor.rollAbility(checkId, { event: event });
  }

  rollAbilityCheckMacro(event, actorId, checkId) {
    const actor = super.getActor(actorId);
    actor.rollAbilityTest(checkId, { event: event });
  }

  rollAbilitySaveMacro(event, actorId, checkId) {
    const actor = super.getActor(actorId);
    actor.rollAbilitySave(checkId, { event: event });
  }

  rollSkillMacro(event, actorId, checkId) {
    const actor = super.getActor(actorId);
    actor.rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, actorId, itemId) {
    let actor = super.getActor(actorId);
    let item = super.getItem(actor, itemId);

    if (this.needsRecharge(item)) {
      item.rollRecharge();
      return;
    }

    return item.use({ event });
  }

  needsRecharge(item) {
    return (
      item.system.recharge && !item.system.recharge.charged && item.system.recharge.value
    );
  }

  async performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(actorId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case "shortRest":
        actor.shortRest();
        break;
      case "longRest":
        actor.longRest();
        break;
      case "inspiration":
        let update = !actor.system.attributes.inspiration;
        actor.update({ "data.attributes.inspiration": update });
        break;
      case "toggleCombat":
        if (!token) break;
        token.toggleCombat();
        Hooks.callAll("forceUpdateTokenActionHUD");
        break;
      case "toggleVisibility":
        if (!token) break;
        token.toggleVisibility();
        break;
      case "deathSave":
        actor.rollDeathSave({ event });
        break;
      case "initiative":
        await this.performInitiativeMacro(actorId);
        break;
      case "endTurn":
        if (!token) break;
        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        break;
    }
  }

  async performInitiativeMacro(actorId) {
    let actor = super.getActor(actorId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, actorId, tokenId, effectId) {
    const actor = super.getActor(actorId);
    const effects =
      "find" in actor.effects.entries ? actor.effects.entries : actor.effects;
    const effect = effects.find((e) => e.id === effectId);

    if (!effect) return;

    const statusId = effect.flags.core?.statusId;
    if (tokenId && statusId) {
      await this.toggleCondition(event, tokenId, statusId, effect);
      return;
    }

    await effect.update({ disabled: !effect.disabled });
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleCondition(event, tokenId, effectId, effect = null) {
    const token = super.getToken(tokenId);
    const isRightClick = this.isRightClick(event);
    if (
      game.cub &&
      effectId.includes("combat-utility-belt.") &&
      !isRightClick
    ) {
      const cubCondition = this.findCondition(effectId)?.label;
      if (!cubCondition) return;

      game.cub.hasCondition(cubCondition, token)
        ? await game.cub.removeCondition(cubCondition, token)
        : await game.cub.addCondition(cubCondition, token);
    }
    if (
         game.dfreds &&
         effect?.flags?.isConvenient
    ) {
      const effectLabel = effect.label;
      game.dfreds.effectInterface.toggleEffect(effectLabel);
      
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
