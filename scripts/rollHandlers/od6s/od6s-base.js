import { RollHandler } from "../rollHandler.js";

// Could potentially handle rolls from exampleActionHandler ('../actions/exampleActionHandler.js')
export class RollHandlerCoreOD6S extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];
    let actor;
    if(macroType !== 'crew') actor = super.getActor(tokenId);
    switch (macroType) {
      case "action":
        actor.rollAction(actionId);
        break;
      case "item":
        this.rollItemMacro(event, actor, actionId);
        break;
      case "parry":
        this.rollItemMacro(event, actor, actionId, true);
        break;
      case "attribute":
        actor.rollAttribute(actionId);
        break;
      case "skill":
        this.rollItemMacro(event, actor, actionId);
      case "crew":
        actor = await game.od6s.getActorFromUuid(tokenId);
        actor.rollAction(actionId);
      default:
        break;
    }
  }

  rollItemMacro(event, actor, actionId, parry = false) {
    actor.items.find((i) => i.data._id === actionId).roll(parry);
  }
}
