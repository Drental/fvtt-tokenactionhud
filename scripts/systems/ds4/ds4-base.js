import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseDs4 extends RollHandler {
    /**
     * Handle Action Event
     * @param {object} event
     * @param {string} encodedValue
     */
    async doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')

        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        if (tokenId === 'multi' && actionId !== 'toggleCombat') {
            for (const token of canvas.tokens.controlled) {
                const tokenActorId = token.actor?.id
                const tokenTokenId = token.id
                await this._handleMacros(
                    event,
                    actionType,
                    tokenActorId,
                    tokenTokenId,
                    actionId
                )
            }
        } else {
            await this._handleMacros(event, actionType, actorId, tokenId, actionId)
        }
    }

    /**
     * Handle Macros
     * @param {object} event
     * @param {string} actionType
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _handleMacros (event, actionType, actorId, tokenId, actionId) {
        switch (actionType) {
        case 'check':
            await this._rollCheck(tokenId, actionId)
            break
        case 'spell':
        case 'weapon':
            if (this.isRenderItem()) {
                this.doRenderItem(actorId, tokenId, actionId)
            } else {
                this._useItem(actorId, tokenId, actionId)
            }
            break
        }
    }

    /**
     * Roll Check
     * @private
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _rollCheck (tokenId, actionId) {
        const token = super.getToken(tokenId)
        const actor = token?.actor
        await actor.rollCheck(actionId, token.document)
    }

    /**
     * Use Item
     * @private
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     * @returns {object}
     */
    async _useItem (actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = super.getItem(actor, actionId)
        return item.use()
    }
}
