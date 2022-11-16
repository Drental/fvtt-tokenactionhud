import { PreRollHandler } from './preRollHandler.js'
import * as settings from '../settings.js'

export class ItemMacroPreRollHandler extends PreRollHandler {
    /** @override */
    prehandleActionEvent (event, encodedValue) {
        this.registerKeyPresses(event)

        const payload = encodedValue.split('|')

        if (payload.length !== 4) return false

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        if (actionType !== 'itemMacro') return false

        if (this.isRenderItem()) {
            this.doRenderItem(actorId, tokenId, actionId)
            return true
        }

        return this._tryExecuteItemMacro(event, actorId, tokenId, actionId)
    }

    _tryExecuteItemMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = super.getItem(actor, actionId)

        try {
            item.executeMacro()
        } catch (e) {
            settings.Logger.error('ItemMacro error: ', e)
            return false
        }

        return true
    }
}
