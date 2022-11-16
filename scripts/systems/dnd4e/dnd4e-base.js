import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseDnD4e extends RollHandler {
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

        if (actorId === 'multi' && actionId !== 'toggleCombat') {
            for (const token of canvas.tokens.controlled) {
                const tokenActorId = token.actor.id
                const tokenTokenId = token.id
                await this._handleMacros(event, actionType, tokenActorId, tokenTokenId, actionId)
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
        case 'condition':
            await this._toggleCondition(event, tokenId, actionId)
            break
        case 'effect':
            await this._toggleEffect(event, tokenId, actionId)
            break
        case 'feature':
        case 'inventory':
            if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId)
            else this._rollItem(event, actorId, tokenId, actionId)
            break
        case 'power':
            if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId)
            else this._rollPower(event, actorId, tokenId, actionId)
            break
        case 'skill':
            this._rollSkill(event, actorId, tokenId, actionId)
            break
        case 'utility':
            await this.performUtilityMacro(event, actorId, tokenId, actionId)
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
     * @param {string} checkId
     * @returns {object}
     */
    _rollAbility (event, actorId, tokenId, checkId) {
        const actor = super.getActor(actorId, tokenId)
        return game.dnd4eBeta.tokenBarHooks.rollAbility(actor, checkId, event)
    }

    /**
     * Roll Initiative
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     */
    async _rollInitiative (event, actorId, tokenId) {
        const actor = super.getActor(actorId, tokenId)

        await actor.rollInitiative({ createCombatants: true, event })

        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Roll Item
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     * @returns {object}
     */
    _rollItem (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = super.getItem(actor, actionId)
        return game.dnd4eBeta.tokenBarHooks.rollItem(actor, item, event)
    }

    /**
     * Roll Power
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     * @returns {object}
     */
    _rollPower (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = super.getItem(actor, actionId)

        if (this.needsRecharge(actor, item)) {
            event.currentTarget = { closest: (str) => { return { dataset: { actionId } } } }
            return game.dnd4eBeta.tokenBarHooks.rechargePower(actor, item, event)
        }

        return game.dnd4eBeta.tokenBarHooks.rollPower(actor, item, event)
    }

    /**
     * Needs Recharge
     * @private
     * @param {object} actor
     * @param {object} item
     * @returns {boolean}
     */
    needsRecharge (actor, item) {
        return (
            item.system.useType === 'recharge' &&
            !game.dnd4eBeta.tokenBarHooks.isPowerAvailable(actor, item)
        )
    }

    /**
     * Roll Skill
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     * @returns {object}
     */
    _rollSkill (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        return game.dnd4eBeta.tokenBarHooks.rollSkill(actor, actionId, event)
    }

    /**
     * Perform Utility Macro
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async performUtilityMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const token = super.getToken(tokenId)

        switch (actionId) {
        case 'actionPoint':
            game.dnd4eBeta.tokenBarHooks.actionPoint(actor, event)
            break
        case 'deathSave':
            game.dnd4eBeta.tokenBarHooks.deathSave(actor, event)
            break
        case 'endTurn':
            if (!token) break
            if (game.combat?.current?.tokenId === tokenId) {
                await game.combat?.nextTurn()
            }
            break
        case 'heal':
            game.dnd4eBeta.tokenBarHooks.healDialog(actor, event)
            break
        case 'initiative':
            await this._rollInitiative(event, actorId, tokenId)
            break
        case 'quickSave':
            game.dnd4eBeta.tokenBarHooks.quickSave(actor, event)
            break
        case 'save':
            game.dnd4eBeta.tokenBarHooks.saveDialog(actor, event)
            break
        case 'secondWind':
            game.dnd4eBeta.tokenBarHooks.secondWind(actor, event)
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
        default:
            break
        }
    }

    /**
     * Toggle Condition
     * @private
     * @param {object} event
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _toggleCondition (event, tokenId, actionId) {
        const token = super.getToken(tokenId)
        const isRightClick = this.isRightClick(event)
        const condition = this._getCondition(actionId)
        if (!condition) return
        isRightClick
            ? await token.toggleEffect(condition, { overlay: true })
            : await token.toggleEffect(condition)

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
     * @private
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _toggleEffect (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const effects = 'find' in actor.effects.entries ? actor.effects.entries : actor.effects
        const effect = effects.find((effect) => effect.id === actionId)

        if (!effect) return

        const statusId = effect.flags.core?.statusId
        if (statusId) {
            await this._toggleCondition(event, tokenId, statusId)
            return
        }

        await effect.update({ disabled: !effect.disabled })
        Hooks.callAll('forceUpdateTokenActionHUD')
    }
}
