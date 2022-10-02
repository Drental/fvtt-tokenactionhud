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

    let macroType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(characterId);

    actor.rollAttributePopup(actionId);
  }

  rollItemMacro(event, actor, actionId) {
    actor.item.find((i) => i.id === actionId).roll(event);
  }
}
