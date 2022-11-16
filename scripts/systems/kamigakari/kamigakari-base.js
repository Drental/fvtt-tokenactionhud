import { RollHandler } from "../../core/rollHandler/rollHandler.js";
import * as settings from "../../core/settings.js";

export class RollHandlerBaseKg extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    let ctrlClick = event.ctrlKey;

    const payload = encodedValue.split("|");
    if (payload.length !== 4) super.throwInvalidValueErr();

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    let actor = super.getActor(actorId, tokenId);
    let charType = actor.type;

    if (charType === "character") {
      switch (actionType) {
        case "stat":
          actor._rollDice(actionId, ctrlClick);
          break;

        case "burn":
          if (actionId === "transcend") actor._transcend();
          else if (actionId === "vitalIgnition") actor._vitalIgnition();
          else if (actionId === "conceptDestruction")
            actor._conceptDestruction();
          break;

        case "talent":
        case "item":
          actor._echoItemDescription(actionId);
          break;
      }
    } else if (charType === "enemy") {
      switch (actionType) {
        case "item":
          actor._echoItemDescription(actionId);
          break;
      }
    }
  }
}
