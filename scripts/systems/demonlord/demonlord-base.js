import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseDemonlord extends RollHandler {
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

    async _handleMacros (event, actionType, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        switch (actionType) {
        case 'challenge':
            {
                const attribute = actor ? actor.system.attributes[actionId] : null
                actor.rollChallenge(attribute, actionId)
            }
            break
        case 'talent':
        case 'special':
            actor.rollTalent(actionId, null)
            break
        case 'spell':
            actor.rollSpell(actionId, null)
            break
        case 'utility':
            this.performUtilityMacro(actorId, tokenId, actionId)
            break
        case 'weapon':
            actor.rollWeaponAttack(actionId, null)
            break
        default:
            break
        }
    }

    async performUtilityMacro (actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const token = super.getToken(tokenId)

        switch (actionId) {
        case 'endTurn':
            if (!token) break
            if (game.combat?.current?.tokenId === tokenId) {
                await game.combat?.nextTurn()
            }
            break
        case 'rest':
            actor.restActor(token)
            break
        case 'toggleCombat':
            if (canvas.tokens.controlled.length === 0) break
            await canvas.tokens.controlled[0].toggleCombat()
            Hooks.callAll('forceUpdateTokenActionHUD')
            break
        case 'toggleVisibility':
            if (!token) break
            token.toggleVisibility()
            Hooks.callAll('forceUpdateTokenActionHUD')
            break
        }
    }
}
