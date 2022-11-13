import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseCypherSystem extends RollHandler {

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
          case 'pool':
            // might-roll | speed-roll | intellect-roll
            game.cyphersystem.rollEngineMain({actorUuid: actor.uuid, pool: actionId});
            break;
          case 'attack':
            // item-roll
            game.cyphersystem.itemRollMacro(actor, actionId, "", "", "", "", "", "", "", "", "", "", "", "", false, "")
            break;
          case 'skill':
            // item-roll
            game.cyphersystem.itemRollMacro(actor, actionId, "", "", "", "", "", "", "", "", "", "", "", "", false, "")
            break;
          case 'ability':
            // item-pay
            game.cyphersystem.itemRollMacro(actor, actionId, "", "", "", "", "", "", "", "", "", "", "", "", true, "")
            break;
        }
    }
}