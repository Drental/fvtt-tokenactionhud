import { RollHandler } from "./rollHandler.js";

// Could potentially handle rolls from exampleActionHandler ('../actions/exampleActionHandler.js')
export class ExampleHandler extends RollHandler {
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
    let characterId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(characterId);

    switch (actionType) {
      case "item":
        this.rollItemMacro(event, actor, actionId);
        break;
      default:
        break;
    }
  }

  rollItemMacro(event, actor, actionId) {
    actor.item.find((i) => i.id === actionId).use(event);
  }
}
