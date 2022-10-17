import { PreRollHandler } from "../preRollHandler.js";

export class MagicItemsPreRollHandler extends PreRollHandler {
  constructor() {
    super();
  }

  /** @override */
  prehandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");

    if (payload.length !== 4) return false;

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    if (actionType !== "magicItem") return false;

    this._magicItemMacro(event, actorId, tokenId, actionId);
    return true;
  }

  _magicItemMacro(event, actorId, tokenId, actionId) {
    let actor = super.getActor(actorId, tokenId);
    let actionParts = actionId.split(">");

    let itemId = actionParts[0];
    let magicEffectId = actionParts[1];

    let magicItemActor = MagicItems.actor(actor.id);

    magicItemActor.roll(itemId, magicEffectId);

    Hooks.callAll("forceUpdateTokenActionHUD");
  }
}
