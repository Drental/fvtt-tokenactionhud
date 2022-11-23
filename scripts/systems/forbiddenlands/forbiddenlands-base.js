import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseForbiddenlands extends RollHandler {
    async doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')
        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]
        const attributename = payload[3]
        const actor = super.getActor(actorId, tokenId)
        let charType
        if (actor) charType = actor.type
        const item = actionId ? actor.items.get(actionId) : null

        const renderable = ['item', 'armor']
        if (renderable.includes(actionType) && this.isRenderItem()) {
            return this.doRenderItem(actorId, tokenId, actionId)
        }

        if (tokenId === 'multi') {
            if (actionType === 'utility' && actionId.includes('toggle')) {
                this.performMultiToggleUtilityMacro(actionId)
            } else {
                canvas.tokens.controlled.forEach((token) => {
                    const tokenActorId = token.actor.id
                    const tokenTokenId = token.id
                    this._handleMacros(event, actionType, tokenActorId, tokenTokenId, actionId, attributename)
                })
            }
        } else {
            const sharedActions = ['utility']

            if (!sharedActions.includes(actionType)) {
                switch (charType) {
                case 'character':
                case 'monster':
                    await this._handleUniqueActionsChar(actionType, event, actor, actionId)
                    break
                }
            }
            switch (actionType) {
            case 'attribute':
                if (event.type === 'click') {
                    actor.sheet.rollAttribute(actionId)
                }
                break
            case 'skill':
                if (event.type === 'click') {
                    actor.sheet.rollSkill(actionId)
                }
                break
            case 'weapon':
                if (event.type === 'click') {
                    actor.sheet.rollGear(actionId)
                }
                break
            case 'item':
                actor.items.get(actionId).sendToChat()
                break
            case 'armor':
                actor.sheet.rollSpecificArmor(actionId)
                break
            case 'power':
                actor.sheet.rollSpell(actionId)
                break
            case 'condition':
                this.performConditionMacro(event, actorId, tokenId, actionId)
                break
            case 'consumable':
                this.performConsumableMacro(actorId, tokenId, actionId)
                break
            case 'utility':
                this.performUtilityMacro(event, actorId, tokenId, actionId)
                break
            default:
                break
            }
        }
    }

    /** @private */
    async _handleUniqueActionsChar (actionType, event, actor, actionId) {
        switch (actionType) {
        case 'stress':
            await this._adjustAttribute(event, actor, 'stress', 'value', actionId)
            break
        case 'health':
            await this._adjustAttribute(event, actor, 'health', 'value', actionId)
            break
        case 'monsterAttack':
            actor.sheet.rollSpecificAttack(actionId)
            break
        }
    }

    async _adjustAttribute (event, actor, property, valueName, actionId) {
        let value = actor.system.header[property][valueName]
        const max = '10'

        if (this.rightClick) {
            if (value <= 0) return
            value--
        } else {
            if (value >= max) return
            value++
        }

        const update = { data: { header: { [property]: { [valueName]: value } } } }

        await actor.update(update)
    }

    async toggleConditionState (actor, property) {
        actor.toggleCondition(property)
    }

    async performUtilityMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const token = super.getToken(tokenId)

        switch (actionId) {
        case 'toggleVisibility':
            token.toggleVisibility()
            break
        case 'toggleCombat':
            token.toggleCombat()
            Hooks.callAll('forceUpdateTokenActionHUD')
            break
        case 'endTurn':
            if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn()
            break
        }
    }

    async performMultiToggleUtilityMacro (actionId) {
        if (actionId === 'toggleVisibility') {
            const allVisible = canvas.tokens.controlled.every((t) => !t.document.hidden)
            canvas.tokens.controlled.forEach((t) => {
                if (allVisible) t.toggleVisibility()
                else if (t.document.hidden) t.toggleVisibility()
            })
        }

        if (actionId === 'toggleCombat') {
            const allInCombat = canvas.tokens.controlled.every((t) => t.inCombat)
            for (const t of canvas.tokens.controlled) {
                if (allInCombat) await t.toggleCombat()
                else if (!t.inCombat) await t.toggleCombat()
            }
            Hooks.callAll('forceUpdateTokenActionHUD')
        }
    }

    performConditionMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)

        this.toggleConditionState(actor, actionId)
    }

    performConsumableMacro (actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        if (!actor) return
        actor.sheet.rollConsumable(actionId)
    }

    /** @private */
    _rollItem (actor, actorId, tokenId, actionId, actionType) {
        const item = actor.items.get(actionId)
        const renderable = ['item']
        if (renderable.includes(actionType)) {
            return this.doRenderItem(actorId, tokenId, actionId)
        } else {
            console.warn('armor roll')
        }
    }
}
