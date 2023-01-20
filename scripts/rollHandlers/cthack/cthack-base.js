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

    let macroType = payload[0];
    let tokenId = payload[1];
    let itemId = payload[2];

    let actor = super.getActor(tokenId);
    switch (macroType) {
      case "save":
        this._handleSaves(macroType, event, actor, itemId);
        break;
      case "resource":
        this._handleResources(macroType, event, actor, itemId);
        break;
      case "damage":
        this._handleDamages(macroType, event, actor, itemId);
        break;
      case "weapon":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleWeapon(macroType, event, actor, itemId);
        break;
      case "item":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleItem(macroType, event, actor, itemId);
        break;
      case "ability":
        if (this.isRenderItem()) this.doRenderItem(tokenId, itemId);
        else this._handleAbility(macroType, event, actor, itemId);
        break;
    }
  }

  _handleSaves(macroType, event, actor, actionId) {
    actor.rollSave(actionId);
  }

  _handleResources(macroType, event, actor, actionId) {
    actor.rollResource(actionId);
  }

  _handleDamages(macroType, event, actor, actionId) {
    actor.rollDamageRoll(actionId);
  }

  _handleWeapon(macroType, event, actor, actionId) {
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

  _handleItem(macroType, event, actor, actionId) {
    let item = actor.items.get(actionId);
    actor.rollMaterial(item);
  }

  _handleAbility(macroType, event, actor, actionId) {
    let ability = actor.items.get(actionId);

    if (ability.system.uses.value > 0) actor.useAbility(ability);
    else actor.resetAbility(ability);
  }
}
