import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBase5e extends RollHandler {
    /**
     * Handle Action Event
     * @override
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
     * @private
     * @param {object} event
     * @param {string} actionType
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _handleMacros (event, actionType, actorId, tokenId, actionId) {
        switch (actionType) {
        case 'ability':
            this._rollAbility(event, actorId, tokenId, actionId)
            break
        case 'abilityCheck':
            this._rollAbilityTest(event, actorId, tokenId, actionId)
            break
        case 'abilitySave':
            this._rollAbilitySave(event, actorId, tokenId, actionId)
            break
        case 'condition':
            if (!tokenId) return
            await this._toggleCondition(event, tokenId, actionId)
            break
        case 'effect':
            await this._toggleEffect(event, actorId, tokenId, actionId)
            break
        case 'feat':
        case 'item':
        case 'spell':
        case 'weapon':
            if (this.isRenderItem()) this.doRenderItem(actorId, actionId)
            else this._useItem(event, actorId, tokenId, actionId)
            break
        case 'skill':
            this._rollSkill(event, actorId, tokenId, actionId)
            break
        case 'utility':
            await this._performUtilityMacro(event, actorId, tokenId, actionId)
            break
        default:
            break
        }
    }

    /**
     * Roll Ability
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollAbility (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollAbility(actionId, { event })
    }

    /**
     * Roll Ability Save
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollAbilitySave (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollAbilitySave(actionId, { event })
    }

    /**
     * Roll Ability Test
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollAbilityTest (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollAbilityTest(actionId, { event })
    }

    /**
     * Roll Skill
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollSkill (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollSkill(actionId, { event })
    }

    /**
     * Use Item
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     * @returns {object}
     */
    _useItem (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = super.getItem(actor, actionId)

        if (this._needsRecharge(item)) {
            item.rollRecharge()
            return
        }

        return item.use({ event })
    }

    /**
     * Needs Recharge
     * @private
     * @param {object} item
     * @returns {boolean}
     */
    _needsRecharge (item) {
        return (
            item.system.recharge &&
            !item.system.recharge.charged &&
            item.system.recharge.value
        )
    }

    /**
     * Perform Utility Macro
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _performUtilityMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const token = super.getToken(tokenId)

        switch (actionId) {
        case 'deathSave':
            actor.rollDeathSave({ event })
            break
        case 'endTurn':
            if (!token) break
            if (game.combat?.current?.tokenId === tokenId) {
                await game.combat?.nextTurn()
            }
            break
        case 'initiative':
            await this._rollInitiative(actorId)
            break
        case 'inspiration': {
            const update = !actor.system.attributes.inspiration
            actor.update({ 'data.attributes.inspiration': update })
            break
        }
        case 'longRest':
            actor.longRest()
            break
        case 'shortRest':
            actor.shortRest()
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

    /**
     * Roll Initiative
     * @private
     * @param {string} actorId
     * @param {string} tokenId
     */
    async _rollInitiative (actorId, tokenId) {
        const actor = super.getActor(actorId, tokenId)

        await actor.rollInitiative({ createCombatants: true })

        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Toggle Condition
     * @private
     * @param {object} event
     * @param {string} tokenId
     * @param {string} actionId
     * @param {object} effect
     */
    async _toggleCondition (event, tokenId, actionId, effect = null) {
        const token = super.getToken(tokenId)
        const isRightClick = this.isRightClick(event)
        if (game.dfreds && effect?.flags?.isConvenient) {
            const effectLabel = effect.label
            game.dfreds.effectInterface._toggleEffect(effectLabel)
        } else {
            const condition = this._getCondition(actionId)
            if (!condition) return

            isRightClick
                ? await token.toggleEffect(condition, { overlay: true })
                : await token.toggleEffect(condition)
        }

        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Get Condition
     * @private
     * @param {string} actionId
     * @returns {object}
     */
    _getCondition (actionId) {
        return CONFIG.statusEffects.find((effect) => effect.id === actionId)
    }

    /**
     * Toggle Effect
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _toggleEffect (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const effects = 'find' in actor.effects.entries ? actor.effects.entries : actor.effects
        const effect = effects.find((e) => e.id === actionId)

        if (!effect) return

        const statusId = effect.flags.core?.statusId
        if (tokenId && statusId) {
            await this._toggleCondition(event, tokenId, statusId, effect)
            return
        }

        await effect.update({ disabled: !effect.disabled })

        Hooks.callAll('forceUpdateTokenActionHUD')
    }
}
