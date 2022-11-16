import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseBitD extends RollHandler {
    /** @override */
    doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')

        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        const actor = super.getActor(actorId, tokenId)

        actor.rollAttributePopup(actionId)
    }

    rollItemMacro (event, actor, actionId) {
        actor.item.find((item) => item.id === actionId).roll(event)
    }
}
