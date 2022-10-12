import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBaseKg extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    let ctrlClick = event.ctrlKey;

    let payload = encodedValue.split("|");
    if (payload.length != 3) super.throwInvalidValueErr();

    let actionType = payload[0];
    let characterId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(characterId);
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
