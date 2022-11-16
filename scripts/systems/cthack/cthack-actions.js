import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerCthack extends ActionHandler {
    /**
     * Build System Actions
     * @override
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async buildSystemActions (actionList, character, subcategoryIds) {
        const actor = character?.actor
        if (actor.type !== 'character') return

        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'weapons' ||
            subcategoryId === 'equipment'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
            this._buildAbilities(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
            this._buildAttributes(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character, inventorySubcategoryIds)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'saves')) {
            this._buildSaves(actionList, character)
        }

        return actionList
    }

    /**
     * Build Abilities
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAbilities (actionList, character) {
        const actor = character?.actor
        const actionType = 'ability'
        const subcategoryId = 'abilities'

        const abilities = actor.items.filter((item) => item.type === 'ability')
        const actions = abilities.map((ability) =>
            this._getAction(actionType, character, ability)
        )
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Attributes
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAttributes (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const subcategoryId = 'attributes'

        const miscResource = game.settings.get('cthack', 'MiscellaneousResource')
        const attributes = actor.getAvailableAttributes()
        const actions = attributes.map((attribute) => {
            const id = attribute[0]
            const name = (
                id === 'miscellaneous' &&
                miscResource !== ''
            )
                ? miscResource
                : game.cthack.config.attributes[id]
            const actionType = (
                id === 'armedDamage' ||
                id === 'unarmedDamage'
            )
                ? 'damage'
                : 'resource'
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            return {
                id,
                name,
                encodedValue,
                selected: true
            }
        })
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Inventory
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} inventorySubcategoryIds
     */
    _buildInventory (actionList, character, inventorySubcategoryIds) {
        const actor = character.actor

        // Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'equipment')) {
            const equipment = actor.items.filter((item) => item.type === 'item')
            this._buildItems(actionList, character, equipment, 'items')
        }

        // Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = actor.items.filter((item) => item.type === 'weapon')
            this._buildItems(actionList, character, weapons, 'weapons')
        }
    }

    /**
     * Build Saves
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSaves (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'save'
        const subcategoryId = 'saves'

        const saves = Object.entries(actor.system.saves)
        const actions = saves.map((save) => {
            const id = save[0]
            const name = game.cthack.config.saves[id]
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            return {
                id,
                name,
                encodedValue,
                selected: true
            }
        })
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Items
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {object} items
     * @param {string} subcategoryId
     */
    _buildItems (actionList, character, items, subcategoryId) {
        const actionType = 'item'
        const actions = items.map((item) =>
            this._getAction(actionType, character, item)
        )
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Get Action
     * @private
     * @param {string} actionType
     * @param {object} character
     * @param {object} entity
     * @returns {object}
     */
    _getAction (actionType, character, entity) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const id = entity.id
        const name = entity.name
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
        const img = this.getImage(entity)
        const icon = this._getIcon(entity)
        const action = {
            id,
            name,
            encodedValue,
            img,
            icon,
            selected: true
        }
        return action
    }

    /**
     * Get Icon
     * @private
     * @param {object} entity
     * @returns {string}
     */
    _getIcon (entity) {
        // Capacity activable
        if (entity.type === 'ability' && entity.system.uses?.per !== 'Permanent') {
            if (entity.system.uses.value > 0) {
                return '<i class="fas fa-check"></i>'
            } else {
                return '<i class="fas fa-times"></i>'
            }
        }
        return ''
    }
}
