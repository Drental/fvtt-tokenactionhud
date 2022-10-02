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

    let macroType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    if (characterId === "multi") {
      canvas.tokens.controlled.forEach((t) => {
        let idToken = t.id;
        this._handleMacros(event, macroType, idToken, actionId);
      });
    } else {
      await this._handleMacros(event, macroType, actorId, tokenId, actionId);
    }
  }

  async _handleMacros(event, macroType, actorId, tokenId, actionId) {
    switch (macroType) {
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
    const actor = super.getActor(characterId);
    actor.rollCMB(event);
  }

  rollMeleeAttackMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollAttack({ event: event, melee: true });
  }

  rollRangedAttackMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollAttack({ event: event, melee: false });
  }

  rollBAB(event, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollBAB({ event: event });
  }

  rollcasterLevelMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollCL(checkId);
  }

  rollConcentrationMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollConcentration(checkId);
  }

  rollAbilityMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollAbility(checkId, { event: event });
  }

  rollAbilityCheckMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollAbilityTest(checkId, { event: event });
  }

  rollAbilitySaveMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollSavingThrow(checkId, { event: event });
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    const actor = super.getActor(characterId);
    actor.rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, actorId, tokenId, itemId) {
    const actor = super.getActor(characterId);
    const item = super.getItem(actor, itemId);

    item.use({ ev: event, skipDialog: false });
  }

  rollDefenses(event, tokenId, itemId) {
    const actor = super.getActor(characterId);
    actor.rollDefenses();
  }

  async adjustBuff(event, tokenId, buffId) {
    let actor = super.getActor(characterId);
    let buff = super.getItem(actor, buffId);

    let update = { data: { active: !buff.system.active } };

    await buff.update(update);
  }

  async adjustCondition(event, tokenId, conditionKey) {
    let actor = super.getActor(characterId);

    const value = actor.system.attributes.conditions[conditionKey];

    let update = { system: { attributes: { conditions: {} } } };
    update.system.attributes.conditions[conditionKey] = !value;

    await actor.update(update);
  }

  async performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(characterId);
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
    let actor = super.getActor(characterId);

    await actor.rollInitiative({ createCombatants: true });

    Hooks.callAll("forceUpdateTokenActionHUD");
  }
}
