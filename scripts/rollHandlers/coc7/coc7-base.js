import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseCoC7 extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  doHandleActionEvent(event, encodedValue) {
    console.log('doHandleActionEvent', event, encodedValue)
    let payload = encodedValue.split("|");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(tokenId);

    switch (macroType) {
      case 'characteristic':
        actor.characteristicCheck(actionId, event.shiftKey);
        break;
      case 'attribute':
        actor.attributeCheck(actionId, event.shiftKey);
        break;
      case 'weapon':
        actor.weaponCheck({ id: actionId }, event.shiftKey)
        break;
      case 'skill':
        actor.skillCheck({ name: actionId }, event.shiftKey)
        break;
    }
  }
}
