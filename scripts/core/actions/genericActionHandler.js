import * as settings from '../settings.js'

export class GenericActionHandler {
    baseHandler

    constructor (baseHandler) {
        this.baseHandler = baseHandler
    }

    buildGenericActions (actionList, character) {
        this._addConditions(actionList, character)
        this._addUtilities(actionList, character)
    }

    /** @private */
    _addConditions (actionList, character) {}

    /** @private */
    _addUtilities (actionList, character) {
        if (!character) {
            this._addMultiTokenUtilities(actionList)
        } else {
            this._getUtilityList(actionList, character)
        }
    }

    /** @private */
    _getUtilityList (actionList, character) {
        const actorId = character.actor?.id
        const tokenId = character.token?.id
        if (!tokenId) return
        const actionType = 'utility'
        const actions = []

        // Toggle Combat
        const toggleCombatId = 'toggleCombat'
        const inCombat = canvas.tokens.placeables.find(
            (token) => token.id === tokenId
        ).inCombat
        const toggleCombatName = inCombat
            ? this.baseHandler.i18n('tokenActionHud.removeFromCombat')
            : this.baseHandler.i18n('tokenActionHud.addToCombat')
        const toggleCombatEncodedValue = [
            actionType,
            actorId,
            tokenId,
            toggleCombatId
        ].join(this.baseHandler.delimiter)
        const toggleCombatAction = {
            id: toggleCombatId,
            name: toggleCombatName,
            encodedValue: toggleCombatEncodedValue
        }
        actions.push(toggleCombatAction)

        // Toggle Visibility
        if (game.user.isGM) {
            const toggleVisibilityId = 'toggleVisibility'
            const hidden = canvas.tokens.placeables.find(
                (token) => token.id === tokenId
            ).document.hidden
            const toggleVisibilityName = hidden
                ? this.baseHandler.i18n('tokenActionHud.makeVisible')
                : this.baseHandler.i18n('tokenActionHud.makeInvisible')
            const toggleVisbilityEncodedValue = [
                actionType,
                actorId,
                tokenId,
                toggleVisibilityId
            ].join(this.baseHandler.delimiter)
            const toggleVisibilityAction = {
                id: toggleVisibilityId,
                name: toggleVisibilityName,
                encodedValue: toggleVisbilityEncodedValue
            }
            actions.push(toggleVisibilityAction)
        }

        // Add to Action List
        this.baseHandler.addActionsToActionList(actionList, actions, 'token')
    }

    /** @private */
    _addMultiTokenUtilities (actionList) {
        const actionType = 'utility'
        const actorId = 'multi'
        const tokenId = 'multi'
        const tokens = canvas.tokens.controlled
        const actions = []

        // Toggle Combat
        const toggleCombatId = 'toggleCombat'
        const inCombat = tokens.every((token) => token.inCombat)
        const toggleCombatName = inCombat
            ? this.baseHandler.i18n('tokenActionHud.removeFromCombat')
            : this.baseHandler.i18n('tokenActionHud.addToCombat')
        const toggleCombatEncodedValue = [
            actionType,
            actorId,
            tokenId,
            toggleCombatId
        ].join(this.baseHandler.delimiter)
        const toggleCombatAction = {
            id: toggleCombatId,
            name: toggleCombatName,
            encodedValue: toggleCombatEncodedValue
        }
        actions.push(toggleCombatAction)

        // Toggle Visibility
        if (game.user.isGM) {
            const toggleVisibilityId = 'toggleVisibility'
            const hidden = tokens.every((token) => !token.document.hidden)
            const toggleVisibilityname = hidden
                ? this.baseHandler.i18n('tokenActionHud.makeVisible')
                : this.baseHandler.i18n('tokenActionHud.makeInvisible')
            const toggleVisbilityEncodedValue = [
                actionType,
                actorId,
                tokenId,
                toggleVisibilityId
            ].join(this.baseHandler.delimiter)
            const toggleVisibilityAction = {
                id: toggleVisibilityId,
                name: toggleVisibilityname,
                encodedValue: toggleVisbilityEncodedValue
            }
            actions.push(toggleVisibilityAction)
        }

        // Add to Action List
        this.baseHandler.addActionsToActionList(actionList, actions, 'token')
    }
}
