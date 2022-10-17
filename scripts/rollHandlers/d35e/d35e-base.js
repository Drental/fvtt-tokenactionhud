import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseD35E extends RollHandler {
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

    if (actorId === "multi") {
      canvas.tokens.controlled.forEach((token) => {
        const tokenActorId = token.actor.id;
        const tokenTokenId = token.id;
        awaitthis._handleMacros(event, actionType, tokenActorId, tokenTokenId, actionId);
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
      case "concentration":
        this.rollConcentrationMacro(actorId, tokenId, actionId);
        break;
      case "cmb":
        this.rollCmbMacro(event, actorId, tokenId);
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
        await this.adjustBuff(actorId, tokenId, actionId);
        break;
      case "item":
      case "spell":
      case "feat":
      case "attack":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollItemMacro(event, actorId, tokenId, actionId);
        break;
      case "defenses":
        this.rollDefenses(tokenId, actionId);
        break;
      case "utility":
        this.performUtilityMacro(event, actorId, tokenId, actionId);
      default:
        break;
    }
  }

  rollCmbMacro(event, actorId, tokenId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollCMB(event);
  }

  rollConcentrationMacro(actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollConcentration(actionId);
  }

  rollAbilityMacro(event, actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollAbility(actionId, { event: event });
  }

  rollAbilityCheckMacro(event, actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollAbilityTest(actionId, { event: event });
  }

  rollAbilitySaveMacro(event, actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollSavingThrow(actionId, { event: event });
  }

  rollSkillMacro(event, actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollSkill(actionId, { event: event });
  }

  rollItemMacro(event, actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    const item = super.getItem(actor, actionId);
    item.use({ ev: event, skipDialog: false });
  }

  rollDefenses(actorId, tokenId) {
    const actor = super.getActor(actorId, tokenId);
    actor.rollDefenses();
  }

  async adjustBuff(actorId, tokenId, actionId) {
    let actor = super.getActor(actorId, tokenId);
    let buff = super.getItem(actor, actionId);
    let update = { "data.active": !buff.system.active };
    await buff.update(update);
  }

  performUtilityMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(actorId, tokenId);
    switch (actionId) {
      case "rest":
        actor.sheet._onRest(event);
        break;
    }
  }
}
