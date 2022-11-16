import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseCoC7 extends RollHandler {
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

        switch (actionType) {
        case 'attribute':
            actor.attributeCheck(actionId, event.shiftKey)
            break
        case 'characteristic':
            actor.characteristicCheck(actionId, event.shiftKey)
            break
        case 'skill':
            actor.skillCheck({ name: actionId }, event.shiftKey)
            break
        case 'weapon':
            actor.weaponCheck({ id: actionId }, event.shiftKey)
            break
        }
    }
}
