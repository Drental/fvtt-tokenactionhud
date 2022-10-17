import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseCo extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");
    if (payload.length !== 4) {
      super.throwInvalidValueErr();
    }
    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];
    const actor = super.getActor(actorId, tokenId);
    switch (actionType) {
      case "stat":
        this._handleStats(event, actor, actionId);
        break;
      case "skill":
        this._handleSkills(event, actor, actionId);
        break;
      case "weapon":
        this._handleWeapon(event, actor, actionId);
        break;
      case "spell":
        this._handleSpell(event, actor, actionId);
        break;
      case "item":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this._handleItem(event, actor, actionId);
        break;
      case "capacity":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this._handleCapacity(actor, actionId);
        break;
    }
  }

  _handleStats(event, actor, actionId) {
    // Roll without dialog
    if (this.isRightClick(event)) {
      actor.rollStat(actionId, { dialog: false });
    } else actor.rollStat(actionId);
  }

  _handleSkills(event, actor, actionId) {
    // Roll without dialog
    if (this.isRightClick(event)) {
      actor.rollStat(actionId, { dialog: false });
    } else actor.rollStat(actionId);
  }

  _handleWeapon(event, actor, actionId) {
    const item = actor.items.get(actionId);
    // Only Dommage
    if (this.isShift(event)) {
      actor.rollWeapon(item, { dmgOnly: true });
    } else actor.rollWeapon(item);
  }

  _handleSpell(event, actor, actionId) {
    const item = actor.items.get(actionId);
    // Consumable spell
    if (item.system.properties.consumable) actor.consumeItem(item);
    else {
      // Only Dommage
      if (this.isShift(event)) {
        actor.rollWeapon(item, { dmgOnly: true });
      } else actor.rollWeapon(item);
    }
  }

  _handleItem(event, actor, actionId) {
    const item = actor.items.get(actionId);
    // Equipable item
    if (item.system.properties.equipable)
      actor.toggleEquipItem(item, this.isShift(event));
    // Consumable item
    if (item.system.properties.consumable) actor.consumeItem(item);
  }

  _handleCapacity(actor, actionId) {
    let item = actor.items.get(actionId);
    actor.activateCapacity(item);
  }
}
