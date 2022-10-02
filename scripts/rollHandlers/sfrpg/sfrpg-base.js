import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseSfrpg extends RollHandler {
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

    switch (macroType) {
      case "ability":
        this.rollAbilityMacro(event, actorId, tokenId, actionId);
        break;
      case "skill":
        this.rollSkillMacro(event, actorId, tokenId, actionId);
        break;
      case "save":
        this.rollSaveMacro(event, actorId, tokenId, actionId);
        break;
      case "abilitySave":
        this.rollAbilitySaveMacro(event, actorId, tokenId, actionId);
        break;
      case "abilityCheck":
        this.rollAbilityCheckMacro(event, actorId, tokenId, actionId);
        break;
      case "item":
      case "spell":
      case "feat":
      case "starshipWeapon":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this.rollItemMacro(event, actorId, tokenId, actionId);
        break;
      case "shields":
        this._handleShields(event, tokenId, actionId);
        break;
      case "crewAction":
        this._handleCrewAction(event, tokenId, actionId);
      case "utility":
        if (actionId === 'endTurn') {
          if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        }
        break;
      default:
        break;
    }
  }

  rollAbilityMacro(event, actorId, tokenId, checkId) {
    super.getActor(characterId).rollAbility(checkId, { event: event });
  }

  rollAbilityCheckMacro(event, actorId, tokenId, checkId) {
    super.getActor(characterId).rollAbilityTest(checkId, { event: event });
  }

  rollAbilitySaveMacro(event, actorId, tokenId, checkId) {
    super.getActor(characterId).rollAbilitySave(checkId, { event: event });
  }

  rollSaveMacro(event, actorId, tokenId, checkId) {
    super.getActor(characterId).rollSave(checkId, { event: event });
  }

  rollSkillMacro(event, actorId, tokenId, checkId) {
    super.getActor(characterId).rollSkill(checkId, { event: event });
  }

  rollItemMacro(event, actorId, tokenId, itemId) {
    let actor = super.getActor(characterId);
    let item = actor.items.get(itemId);

    if (this.needsRecharge(item)) {
      item.rollRecharge();
      return;
    }

    if (item.type === "spell") return item.use();

    return item.use();
  }

  needsRecharge(item) {
    return (
      item.system.recharge &&
      !item.system.recharge.charged &&
      item.system.recharge.value
    );
  }

  async _handleShields(event, tokenId, actionId) {
    const actor = super.getActor(characterId);
    let payload = actionId.split(".");

    const side = payload[0];
    let shieldChange = parseInt(payload[1]);
    if (shieldChange === NaN) return;

    const shields = actor.system.attributes.shields;
    const shield = actor.system.quadrants[side]["shields"];

    let newValue;
    if (shieldChange < 0) {
      newValue = Math.clamped(shield.value + shieldChange, 0, shields.max);
    } else {
      newValue = this._calcPossibleIncrease(shields, shield, shieldChange);
    }

    if (newValue === shield.value) return;

    const update = { system: { quadrants: {} } };
    update.system.quadrants[side] = { shields: { value: newValue } };

    await actor.update(update);
  }

  _calcPossibleIncrease(shields, shield, change) {
    const overallPossible =
      shields.max - shields.value >= 0 ? shields.max - shields.value : 0;
    const localPossible =
      shields.limit - shield.value >= 0 ? shields.limit - shield.value : 0;

    let possibleChange = change;

    if (change > overallPossible) possibleChange = overallPossible;

    if (change > localPossible) possibleChange = localPossible;

    return shield.value + possibleChange;
  }

  _handleCrewAction(event, tokenId, actionId) {
    const actor = super.getActor(characterId);
    actor.useStarshipAction(actionId);
  }
}
