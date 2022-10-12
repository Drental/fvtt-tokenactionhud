import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseCthack extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let actionType = payload[0];
    let characterId = payload[1];
    let itemId = payload[2];

    let actor = super.getActor(characterId);
    switch (actionType) {
      case "save":
        this._handleSaves(actionType, event, actor, itemId);
        break;
      case "resource":
        this._handleResources(actionType, event, actor, itemId);
        break;
      case "damage":
        this._handleDamages(actionType, event, actor, itemId);
        break;
      case "weapon":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleWeapon(actionType, event, actor, itemId);
        break;
      case "item":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleItem(actionType, event, actor, itemId);
        break;
      case "ability":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleAbility(actionType, event, actor, itemId);
        break;
    }
  }

  _handleSaves(actionType, event, actor, actionId) {
    actor.rollSave(actionId);
  }

  _handleResources(actionType, event, actor, actionId) {
    actor.rollResource(actionId);
  }

  _handleDamages(actionType, event, actor, actionId) {
    actor.rollDamageRoll(actionId);
  }

  _handleWeapon(actionType, event, actor, actionId) {
    let item = actor.items.get(actionId);

    // Material Roll
    if (this.isShift(event)) {
      actor.rollMaterial(item);
    }
    // Attack roll
    else {
      let mod = 0;
      if ( game.user.targets.size > 0) {
          const target = [...game.user.targets][0];
          if (target.actor.type=="opponent") {
              mod = target.actor.system.malus;
          }
      }
      if (mod < 0) {
          item.system.range === "" ? actor.rollSave("str", {modifier: mod}) : actor.rollSave("dex", {modifier: mod}); 
      }
      else {
          item.system.range === "" ? actor.rollSave("str") : actor.rollSave("dex"); 
      }
    }


  }

  _handleItem(actionType, event, actor, actionId) {
    let item = actor.items.get(actionId);
    actor.rollMaterial(item);
  }

  _handleAbility(actionType, event, actor, actionId) {
    let ability = actor.items.get(actionId);

    if (ability.system.uses.value > 0) actor.useAbility(ability);
    else actor.resetAbility(ability);
  }
}
