import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseCo extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    let actor = super.getActor(tokenId, actorId);
    switch (actionType) {
      case "stat":
        this._handleStats(actionType, event, actor, actionId);
        break;
      case "skill":
        this._handleSkills(actionType, event, actor, actionId);
        break;
      case "weapon":
        this._handleWeapon(actionType, event, actor, actionId);
        break;
      case "spell":
        this._handleSpell(actionType, event, actor, actionId);
        break;        
      case "item":
        if (this.isRenderItem()) this.doRenderItem(tokenId, actionId);
        else this._handleItem(actionType, event, actor, actionId);
        break;
      case "capacity":
        if (this.isRenderItem()) this.doRenderItem(tokenId, actionId);
        else this._handleCapacity(actionType, event, actor, actionId);
        break;
    }
  }

  _handleStats(actionType, event, actor, actionId) {
    // Roll without dialog
    if (this.isRightClick(event)) {
      actor.rollStat(actionId, {dialog : false});
    }
    else actor.rollStat(actionId);
  }

  _handleSkills(actionType, event, actor, actionId) {
    // Roll without dialog
    if (this.isRightClick(event)) {
      actor.rollStat(actionId, {dialog : false});
    }
    else actor.rollStat(actionId);
  }

  _handleWeapon(actionType, event, actor, actionId) {
    let item = actor.items.get(actionId);
    // Only Dommage
    if (this.isShift(event)) {
      actor.rollWeapon(item, {dmgOnly: true})
    }
    else actor.rollWeapon(item);
  }

  _handleSpell(actionType, event, actor, actionId) {
    let item = actor.items.get(actionId);

    // Consumable spell
    if (item.system.properties.consumable) actor.consumeItem(item);
    else {
      // Only Dommage
      if (this.isShift(event)) {
        actor.rollWeapon(item, {dmgOnly: true})
      }
      else actor.rollWeapon(item);
    }

  }

  _handleItem(actionType, event, actor, actionId) {
    let item = actor.items.get(actionId);  

    // Equipable item
    if (item.system.properties.equipable) actor.toggleEquipItem(item, this.isShift(event));

    // Consumable item
    if (item.system.properties.consumable) actor.consumeItem(item);
    
  }

  _handleCapacity(actionType, event, actor, actionId) {
    let item = actor.items.get(actionId);  

    actor.activateCapacity(item);
    
  }

}
