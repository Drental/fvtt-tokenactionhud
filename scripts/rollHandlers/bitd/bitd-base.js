import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseBitD extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let actionType = payload[0];
    let actorId = payload[1];
    let tokenId = payload[2];
    let actionId = payload[2];

    let actor = super.getActor(tokenId, actorId);

    actor.rollAttributePopup(actionId);
  }

  rollItemMacro(event, actor, actionId) {
    actor.item.find((i) => i.id === actionId).roll(event);
  }
}
