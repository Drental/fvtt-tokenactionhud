import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBasePf1 extends RollHandler {
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
      canvas.tokens.controlled.forEach((t) => {
        let idToken = t.id;
        this._handleMacros(event, actionType, idToken, actionId);
      });
    } else {
      await this._handleMacros(event, actionType, actorId, tokenId, actionId);
    }
  }

  async _handleMacros(event, actionType, actorId, tokenId, actionId) {
    switch (actionType) {
      case "ability":
        this.rollAbilityMacro(event, actorId, tokenId, actionId);
        break;
      case "casterLevel":
        this.rollcasterLevelMacro(event, actorId, tokenId, actionId);
        break;
      case "concentration":
        this.rollConcentrationMacro(event, actorId, tokenId, actionId);
        break;
      case "cmb":
        this.rollCmbMacro(event, actorId, tokenId, actionId);
        break;
      case "melee":
        this.rollMeleeAttackMacro(event, actorId, tokenId, actionId);
        break;
      case "ranged":
        this.rollRangedAttackMacro(event, actorId, tokenId, actionId);
        break;
      case "bab":
        this.rollBAB(event, tokenId, actionId);
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
      case "buff":
        await this.adjustBuff(event, tokenId, actionId);
        break;
      case "condition":
        await this.adjustCondition(event, tokenId, actionId);
        break;
      case "item":
      case "spell":
      case "feat":
      case "attack":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollItemMacro(event, actorId, tokenId, actionId);
        break;
      case "defenses":
        this.rollDefenses(event, tokenId, actionId);
        break;
      case "utility":
        await this.performUtilityMacro(event, actorId, tokenId, actionId);
        break;
      default:
        break;
    }
  }

  rollCmbMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollCMB(event);
  }

  rollMeleeAttackMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollAttack({ event: event, melee: true });
  }

  rollRangedAttackMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollAttack({ event: event, melee: false });
  }

  rollBAB(event, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollBAB({ event: event });
  }

  rollcasterLevelMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollCL(checkId);
  }

  rollConcentrationMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollConcentration(checkId);
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
    actor.rollSavingThrow(checkId, { event: event });
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, actorId, tokenId, actionId) {
    const actor = super.getActor(tokenId, actorId);
    const item = super.getItem(actor, itemId);
    const skipActionDialogs = (game.settings.settings.get("pf1.skipActionDialogs")) 
      ? game.settings.get("pf1", "skipActionDialogs")
      : false;
    const shiftKey = event.shiftKey;
    const skipDialog = (skipActionDialogs) ? !shiftKey : shiftKey;

    item.use({ ev: event, skipDialog: skipDialog });
  }

  rollDefenses(event, tokenId, actionId) {
    const actor = super.getActor(tokenId, actorId);
    actor.rollDefenses();
  }

  async adjustBuff(event, tokenId, buffId) {
    let actor = super.getActor(tokenId, actorId);
    let buff = super.getItem(actor, buffId);

    let update = { data: { active: !buff.system.active } };

    await buff.update(update);
  }

  async adjustCondition(event, tokenId, conditionKey) {
    let actor = super.getActor(tokenId, actorId);

    const value = actor.system.attributes.conditions[conditionKey];

    let update = { system: { attributes: { conditions: {} } } };
    update.system.attributes.conditions[conditionKey] = !value;

    await actor.update(update);
  }

  async performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(tokenId, actorId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case "rest":
        actor.sheet._onRest(event);
        break;
      case "toggleCombat":
        token.toggleCombat();
        Hooks.callAll("forceUpdateTokenActionHUD");
        break;
      case "toggleVisibility":
        token.toggleVisibility();
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
}
