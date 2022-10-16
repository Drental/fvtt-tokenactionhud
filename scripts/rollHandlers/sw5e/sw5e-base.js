import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseSW5e extends RollHandler {
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
    let actorId = payload[1];
    let tokenId = payload[2];
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
    const actor = super.getActor(tokenId, actorId);
    actor.rollAbility(checkId, { event: event });
  }

  rollAbilityCheckMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollAbilityTest(checkId, { event: event });
  }

  rollAbilitySaveMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollAbilitySave(checkId, { event: event });
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(tokenId, actorId);
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
    let actor = super.getActor(tokenId, actorId);
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
    let actor = super.getActor(tokenId, actorId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async toggleEffect(event, tokenId, effectId) {
    const actor = super.getActor(tokenId, actorId);
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
