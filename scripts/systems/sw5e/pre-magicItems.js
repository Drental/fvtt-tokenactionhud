import { PreRollHandler } from '../../core/rollHandler/preRollHandler.js'

export class MagicItemsPreRollHandler extends PreRollHandler {
    /** @override */
    prehandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')

        if (payload.length !== 4) return false

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        if (actionType !== 'magicItem') return false

        this._magicItemMacro(event, actorId, tokenId, actionId)
        return true
    }

    _magicItemMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const actionParts = actionId.split('>')

        const itemId = actionParts[0]
        const magicEffectId = actionParts[1]

        const magicItemActor = MagicItems.actor(actor.id)

        magicItemActor.roll(itemId, magicEffectId)

        Hooks.callAll('forceUpdateTokenActionHUD')
    }
}
