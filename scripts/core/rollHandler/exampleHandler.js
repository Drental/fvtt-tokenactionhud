import { RollHandler } from './rollHandler.js'

// Could potentially handle rolls from exampleActionHandler ('../actions/exampleActionHandler.js')
export class ExampleHandler extends RollHandler {
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
        case 'item':
            this.rollItemMacro(event, actor, actionId)
            break
        default:
            break
        }
    }

    rollItemMacro (event, actor, actionId) {
        actor.item.find((i) => i.id === actionId).use(event)
    }
}
