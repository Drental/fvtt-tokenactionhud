import { RollHandler } from "../rollHandler.js";

// Could potentially handle rolls from exampleActionHandler ('../actions/exampleActionHandler.js')
export class RollHandlerCoreOD6S extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");
    if (payload.length !== 4) {
      super.throwInvalidValueErr();
    }

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];
    let actor;
    if(actionType !== 'crew') actor = super.getActor(actorId, tokenId);
    switch (actionType) {
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
    actor.items.find((i) => i.id === actionId).roll(parry);
  }
}
