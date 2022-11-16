import { ActionHandler } from '../../core/actions/actionHandler.js'
import * as settings from '../../core/settings.js'

export class ActionHandlerDs4 extends ActionHandler {
    /**
     * Build System Actions
     * @override
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    buildSystemActions (actionList, character, subcategoryIds) {
        const actor = character?.actor

        if (actor) {
            this._buildSingleTokenActions(actionList, character, subcategoryIds)
        } else {
            this._buildMultipleTokenActions(actionList, subcategoryIds)
        }

        return actionList
    }

    /**
     * Build Single Token Actions
     * @override
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     */
    _buildSingleTokenActions (actionList, character, subcategoryIds) {
        const actor = character?.actor
        const items = actor.items
            .filter((item) => item.system.equipped)
            .sort((a, b) => a.sort - b.sort)

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'checks')) {
            this._buildChecks(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'spells')) {
            this._buildSpells(actionList, character, items)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            this._buildWeapons(actionList, character, items)
        }
    }

    /**
     * Build Multiple Token Actions
     * @private
     * @param {object} actionList
     * @param {array} subcategoryIds
     */
    _buildMultipleTokenActions (actionList, subcategoryIds) {
        const character = { actor: { id: 'multi' }, token: { id: 'multi' } }

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'checks')) {
            this._buildChecks(actionList, character)
        }
    }

    /**
     * Build Checks
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildChecks (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'check'
        const subcategoryId = 'checks'
        const displayCheckTargetNumbers = !!actor && settings.get('displayCheckTargetNumbers')

        // Get checks
        const checks = Object.entries(CONFIG.DS4.i18n.checks)

        // Get actions
        const actions = checks.map((check) => {
            const id = check.id
            const name = displayCheckTargetNumbers
                ? `${check.name} (${actor.system.checks[id]})`
                : check.name
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            const img = CONFIG.DS4.icons.checks[id]
            return {
                id,
                name,
                encodedValue,
                img,
                selected: true
            }
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Spells
     * @override
     * @param {object} actionList
     * @param {object} character
     * @param {object} items
     */
    _buildSpells (actionList, character, items) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'spell'
        const subcategoryId = 'spells'

        // Get actions
        const actions = items
            .filter((item) => item.type === actionType)
            .map((item) => {
                const id = item.id
                const name = item.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                const img = item.img
                return {
                    id,
                    name,
                    encodedValue,
                    img
                }
            })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Weapons
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {object} items
     */
    _buildWeapons (actionList, character, items) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'weapon'
        const subcategoryId = 'weapons'

        // Get actions
        const actions = items
            .filter((item) => item.type === actionType)
            .map((item) => {
                const id = item.id
                const name = item.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                const img = item.img
                return {
                    id,
                    name,
                    encodedValue,
                    img
                }
            })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }
}
