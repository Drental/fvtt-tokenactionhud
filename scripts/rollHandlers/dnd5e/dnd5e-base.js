import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBase5e extends RollHandler {
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
      case "ability":
        this.rollAbilityMacro(event, tokenId, actionId);
        break;
      case "skill":
        this.rollSkillMacro(event, tokenId, actionId);
        break;
      case "abilitySave":
        this.rollAbilitySaveMacro(event, tokenId, actionId);
        break;
      case "abilityCheck":
        this.rollAbilityCheckMacro(event, tokenId, actionId);
        break;
      case "item":
      case "weapon":
      case "spell":
      case "feat":
        if (this.isRenderItem()) this.doRenderItem(tokenId, actionId);
        else this.rollItemMacro(event, tokenId, actionId);
        break;
      case "utility":
        await this.performUtilityMacro(event, tokenId, actionId);
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

  rollAbilityMacro(event, tokenId, checkId) {
    const actor = super.getActor(tokenId);
    actor.rollAbility(checkId, { event: event });
  }

  rollAbilityCheckMacro(event, tokenId, checkId) {
    const actor = super.getActor(tokenId);
    actor.rollAbilityTest(checkId, { event: event });
  }

  rollAbilitySaveMacro(event, tokenId, checkId) {
    const actor = super.getActor(tokenId);
    actor.rollAbilitySave(checkId, { event: event });
  }

  rollSkillMacro(event, tokenId, checkId) {
    const actor = super.getActor(tokenId);
    actor.rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, tokenId, itemId) {
    let actor = super.getActor(tokenId);
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

  async performUtilityMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
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
        token.toggleCombat();
        Hooks.callAll("forceUpdateTokenActionHUD");
        break;
      case "toggleVisibility":
        token.toggleVisibility();
        break;
      case "deathSave":
        actor.rollDeathSave({ event });
        break;
      case "initiative":
        await this.performInitiativeMacro(tokenId);
        break;
      case "endTurn":
        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        break;
    }
  }

  async performInitiativeMacro(tokenId) {
    let actor = super.getActor(tokenId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, tokenId, effectId) {
    const actor = super.getActor(tokenId);
    const effects =
      "find" in actor.effects.entries ? actor.effects.entries : actor.effects;
    const effect = effects.find((e) => e.id === effectId);

    if (!effect) return;

    const statusId = effect.flags.core?.statusId;
    if (statusId) {
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
         game.dfreds &&
         effect?.flags?.isConvenient
    ) {
      const effectLabel = effect.label;
      game.dfreds.effectInterface.toggleEffect(effectLabel);
    } else {
      const condition = this.findCondition(effectId);
      if (!condition) return;

      isRightClick
        ? await token.toggleEffect(condition, { overlay: true })
        : await token.toggleEffect(condition);
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  findCondition(id) {
    return CONFIG.statusEffects.find((effect) => effect.id === id);
  }
}
