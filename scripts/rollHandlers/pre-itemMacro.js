import { PreRollHandler } from "./preRollHandler.js";
import * as settings from "../settings.js";

export class ItemMacroPreRollHandler extends PreRollHandler {
  constructor() {
    super();
  }

  /** @override */
  prehandleActionEvent(event, encodedValue) {
    this.registerKeyPresses(event);

    let payload = encodedValue.split("|");

    if (payload.length != 3) return false;

    let actionType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    if (actionType != "itemMacro") return false;

    if (this.isRenderItem()) {
      this.doRenderItem(actorId, tokenId, actionId);
      return true;
    }

    return this._tryExecuteItemMacro(event, actorId, tokenId, actionId);
  }

  _tryExecuteItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(characterId);
    let item = super.getItem(actor, actionId);

    try {
      item.executeMacro();
    } catch (e) {
      settings.Logger.error("ItemMacro error: ", e);
      return false;
    }

    return true;
  }
}
