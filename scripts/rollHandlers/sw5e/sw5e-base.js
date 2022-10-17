import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseSW5e extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");

    if (payload.length !== 4) {
      super.throwInvalidValueErr();
    }

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

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
      case "ability":
        this.rollAbilityMacro(event, actorId, tokenId, actionId);
        break;
      case "skill":
        this.rollSkillMacro(event, actorId, tokenId, actionId);
        break;
      case "abilitySave":
        this.rollAbilitySaveMacro(event, actorId, tokenId, actionId);
        break;
      case "abilityCheck":
        this.rollAbilityCheckMacro(event, actorId, tokenId, actionId);
        break;
      case "item":
      case "power":
      case "feat":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollItemMacro(event, actorId, tokenId, actionId);
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
    const actor = super.getActor(actorId, tokenId);
    actor.rollAbility(checkId, { event: event });
  }

  rollAbilityCheckMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollAbilityTest(checkId, { event: event });
  }

  rollAbilitySaveMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollAbilitySave(checkId, { event: event });
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(actorId, tokenId);
    let item = super.getItem(actor, itemId);

    if (this.needsRecharge(item)) {
      item.rollRecharge();
      return;
    }

    if (item.type === "power") return actor.usePower(item);

    return item.use({ event });
  }

  needsRecharge(item) {
    return (
      item.system.recharge && !item.system.recharge.charged && item.system.recharge.value
    );
  }

  async performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(actorId, tokenId);
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
      case "rechargeRepair":
        actor.rechargeRepair();
        break;
      case "refittingRepair":
        actor.refittingRepair();
        break;
      case "regenRepair":
        actor.regenRepair();
        break;
      case "destructionSave":
        actor.rollDestructionSave({ event });
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
    let actor = super.getActor(actorId, tokenId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, tokenId, effectId) {
    const actor = super.getActor(actorId, tokenId);
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
        ? await token.toggleOverlay(condition)
        : await token.toggleEffect(condition);
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  findCondition(id) {
    return CONFIG.statusEffects.find((effect) => effect.id === id);
  }
}
