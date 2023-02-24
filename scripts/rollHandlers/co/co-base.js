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

    let macroType = payload[0];
    let tokenId = payload[1];
    let itemId = payload[2];

    let actor = super.getActor(tokenId);
    switch (macroType) {
      case "stat":
        this._handleStats(macroType, event, actor, itemId);
        break;
      case "skill":
        this._handleSkills(macroType, event, actor, itemId);
        break;
      case "weapon":
        this._handleWeapon(macroType, event, actor, itemId);
        break;
      case "spell":
        this._handleSpell(macroType, event, actor, itemId);
        break;        
      case "item":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleItem(macroType, event, actor, itemId);
        break;
      case "capacity":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleCapacity(macroType, event, actor, itemId);
        break;
    }
  }

  _handleStats(macroType, event, actor, actionId) {
    // Roll without dialog
    if (this.isRightClick(event)) {
      actor.rollStat(actionId, {dialog : false});
    }
    else actor.rollStat(actionId);
  }

  _handleSkills(macroType, event, actor, actionId) {
    // Roll without dialog
    if (this.isRightClick(event)) {
      actor.rollStat(actionId, {dialog : false});
    }
    else actor.rollStat(actionId);
  }

  _handleWeapon(macroType, event, actor, actionId) {
    let item = actor.items.get(actionId);
    // Only Dommage
    if (this.isShift(event)) {
      actor.rollWeapon(item, {dmgOnly: true})
    }
    else actor.rollWeapon(item);
  }

  _handleSpell(macroType, event, actor, actionId) {
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

  _handleItem(macroType, event, actor, actionId) {
    let item = actor.items.get(actionId);  

    // Equipable item
    if (item.system.properties.equipable) actor.toggleEquipItem(item, this.isShift(event));

    // Consumable item
    if (item.system.properties.consumable) actor.consumeItem(item);
    
  }

  _handleCapacity(macroType, event, actor, actionId) {

    if (game.system.id === "cof") {
      let item = actor.items.get(actionId);  
      actor.activateCapacity(item);
    }
    
  }

}
