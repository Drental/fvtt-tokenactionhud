import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseAlienrpg extends RollHandler {
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
        const attribute = actor.system.attributes[actionId]
        let rData
        switch (actionType) {
        case 'attribute':
            rData = {
                roll: actor.system.attributes[actionId].value,
                label: actor.system.attributes[actionId].label
            }
            if (event.type === 'click') {
                actor.rollAbility(actor, rData)
            } else {
                actor.rollAbilityMod(actor, rData)
            }
            break
        case 'creatureattribute':
            switch (actionId) {
            case 'mobility':
            case 'observation':
                rData = {
                    roll: actor.system.general[actionId].value,
                    label: actor.system.general[actionId].label
                }
                break
            default:
                {
                    const attributeLabel = attribute.label
                    const clabel = attributeLabel.toUpperCase() + attributeLabel.substring(1)
                    rData = {
                        roll: actor.system.attributes[actionId].value,
                        label: [clabel]
                    } }
                break
            }
            if (event.type === 'click') {
                actor.rollAbility(actor, rData)
            } else {
                actor.rollAbilityMod(actor, rData)
            }
            break
        case 'skill':
            rData = {
                roll: actor.system.skills[actionId].mod,
                label: actor.system.skills[actionId].label
            }
            if (event.type === 'click') {
                actor.rollAbility(actor, rData)
            } else {
                actor.rollAbilityMod(actor, rData)
            }
            break
        case 'weapon':
            if (event.type === 'click') {
                actor.nowRollItem(item)
            } else {
                actor.rollItemMod(item)
            }
            break
        case 'item':
            this._rollItem(actor, tokenId, actionId, actionType)
            break
        case 'armor':
            rData = {
                roll: actor.system.general.armor.value,
                spbutt: 'armor'
            }
            actor.rollAbility(actor, rData)
            break
        case 'consumables':
            {
                const attributeLabel = attribute.label
                const lTemp = 'ALIENRPG.' + (attributeLabel.toUpperCase() + attributeLabel.substring(1))
                const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply')
                actor.consumablesCheck(actor, actionId, label)
            }
            break
        case 'power':
            {
                const pTemp = 'ALIENRPG.' + (actionType[0].toUpperCase() + actionType.substring(1))
                const plabel = game.i18n.localize(pTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply')
                actor.consumablesCheck(actor, actionType, plabel, actionId)
            }
            break
        case 'conditions':
            this.performConditionMacro(event, actorId, tokenId, actionId)
            break
        case 'utility':
            this.performUtilityMacro(event, actorId, tokenId, actionId)
            break
        case 'stress':
            await this._adjustAttribute(event, actor, 'stress', 'value', actionId)
            break
        case 'rollStress':
            if (actor.type === 'character') {
                rData = { panicroll: actor.system.header.stress }
            } else {
                rData = { panicroll: { value: 0, label: 'Stress' } }
            }
            if (event.type === 'click') {
                actor.rollAbility(actor, rData)
            } else {
                actor.rollAbilityMod(actor, rData)
            }
            break
        case 'health':
            await this._adjustAttribute(event, actor, 'health', 'value', actionId)
            break
        case 'creatureAttack':
            {
                const rAttData = { atttype: actor.system.rTables }
                actor.creatureAttackRoll(actor, rAttData)
            }
            break
        case 'acidSplash':
            {
                const aSplashData = {
                    roll: actor.system.general.acidSplash.value,
                    label: actor.system.general.acidSplash.label
                }
                actor.creatureAcidRoll(actor, aSplashData)
            }
            break
        case 'rollCrit':
            actor.rollCrit(actor.type)
            break
        default:
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

    async toggleConditionState (event, actor, property, valueName, actionId) {
        let value = actor.system.general[property][valueName]
        const max = '1'

        if (this.rightClick) {
            if (value <= 0) return
            value--
            if (property === 'panic') {
                actor.checkAndEndPanic(actor)
            }
        } else {
            if (value >= max) return
            value++
            if (property === 'panic') {
                actor.checkAndEndPanic(actor)
            }
        }

        const update = { data: { general: { [property]: { [valueName]: value } } } }
        await actor.update(update)
    }

    async performUtilityMacro (event, actorId, tokenId, actionId) {
        const token = super.getToken(tokenId)

        switch (actionId) {
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
        case 'endTurn':
            if (!token) break
            if (game.combat?.current?.tokenId === tokenId) { await game.combat?.nextTurn() }
            break
        }
    }

    performConditionMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)

        switch (actionId) {
        case 'toggleStarving':
            this.toggleConditionState(event, actor, 'starving', 'value')
            break
        case 'toggleDehydrated':
            this.toggleConditionState(event, actor, 'dehydrated', 'value')
            break
        case 'toggleExhausted':
            this.toggleConditionState(event, actor, 'exhausted', 'value')
            break
        case 'toggleFreezing':
            this.toggleConditionState(event, actor, 'freezing', 'value')
            break
        case 'togglePanic':
            this.toggleConditionState(event, actor, 'panic', 'value')
            break
        }
    }

    /** @private */
    _rollItem (actor, actorId, tokenId, actionId, actionType) {
        const renderable = ['item']
        if (renderable.includes(actionType)) {
            return this.doRenderItem(actorId, tokenId, actionId)
        } else {
            console.warn('armor roll')
        }
    }
}
