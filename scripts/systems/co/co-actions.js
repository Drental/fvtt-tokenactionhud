import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerCo extends ActionHandler {
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
        if (actor.type !== 'character' && actor.type !== 'npc') return

        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'weapons' ||
            subcategoryId === 'protections' ||
            subcategoryId === 'consumables' ||
            subcategoryId === 'spells' ||
            subcategoryId === 'other'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attacks')) {
            this._buildAttacks(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'capacities')) {
            this._buildCapacities(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character, inventorySubcategoryIds)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'readySpells')) {
            this._buildSpells(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'readyWeapons')) {
            this._buildWeapons(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'stats')) {
            this._buildStats(actionList, character)
        }

        return actionList
    }

    /**
     * Build Attacks
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAttacks (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const subcategoryId = 'attacks'

        const attacks = Object.entries(actor.system.attacks)
        const actions = attacks.map((attack) => {
            const id = attack[0]
            const name = game.system.id === 'cof'
                ? game.cof.config.skills[id]
                : game.coc.config.skills[id]
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
     * Build Capacities
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildCapacities (actionList, character) {
        const actor = character?.actor
        const actionType = 'capacity'
        const subcategoryId = 'capacities'

        const capacities = actor.items.filter((item) => item.type === actionType)
        const actions = capacities.map((capacity) =>
            this._getAction(actionType, character, capacity)
        )
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
        const actor = character?.actor

        // Consumables
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'consumables')) {
            const consumables = actor.items.filter((item) =>
                item.type === 'item' &&
                item.system.subtype !== 'spell' &&
                item.system.properties.consumable &&
                item.system.qty > 0
            )
            this._buildItems(actionList, character, consumables, 'consumables')
        }

        // Other Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'other')) {
            const others = actor.items.filter((item) =>
                item.type === 'item' &&
                item.system.subtype !== 'armor' &&
                item.system.subtype !== 'shield' &&
                item.system.subtype !== 'melee' &&
                item.system.subtype !== 'ranged' &&
                item.system.subtype !== 'spell' &&
                !item.system.properties.consumable
            )
            this._buildItems(actionList, character, others, 'other')
        }

        // Protections
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'protections')) {
            const protections = actor.items.filter((item) =>
                item.type === 'item' &&
                (item.system.subtype === 'armor' || item.system.subtype === 'shield')
            )
            this._buildItems(actionList, character, protections, 'protections')
        }

        // Spells
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'spells')) {
            const spells = actor.items.filter((item) =>
                item.type === 'item' &&
                item.system.subtype === 'spell'
            )
            this._buildItems(actionList, character, spells, 'spells')
        }

        // Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = actor.items.filter((item) =>
                item.type === 'item' &&
                (item.system.subtype === 'melee' || item.system.subtype === 'ranged')
            )
            this._buildItems(actionList, character, weapons, 'weapons')
        }
    }

    /**
     * Build Spells
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSpells (actionList, character) {
        const actor = character?.actor
        const actionType = 'spell'
        const subcategoryId = 'readySpells'

        const spells = actor.items.filter((item) =>
            item.type === 'item' &&
            item.system.subtype === 'spell' &&
            (item.system.properties.weapon || item.system.properties.activable)
        )
        const actions = spells.map((spell) =>
            this._getAction(actionType, character, spell)
        )
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Stats
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildStats (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'stat'
        const subcategoryId = 'stats'

        const stats = Object.entries(actor.system.stats)
        const actions = stats.map((stat) => {
            const id = stat[0]
            const name = game.system.id === 'cof'
                ? game.cof.config.stats[id]
                : game.coc.config.stats[id]
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
     * Build Weapons
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildWeapons (actionList, character) {
        const actor = character?.actor
        const actionType = 'weapon'
        const subcategoryId = 'readyWeapons'

        const weapons = actor.items.filter((item) =>
            item.type === 'item' &&
            (item.system.subtype === 'melee' || item.system.subtype === 'ranged') &&
            item.system.worn
        )
        const actions = weapons.map((weapon) =>
            this._getAction(actionType, character, weapon)
        )
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
        const info1 = this._getQuantityData(entity)
        return {
            id,
            name,
            encodedValue,
            img,
            icon,
            info1,
            selected: true
        }
    }

    /**
     * Get Icon
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getIcon (item) {
        // Item worn
        if (item.type === 'item' && item.system.worn) {
            return '<i class="fas fa-shield-alt"></i>'
        }
        // Capacity activable
        if (item.type === 'capacity' && item.system.activable) {
            // Buff
            if (item.system.buff) {
                if (item.system.properties.buff.activated) {
                    return '<i class="fas fa-times"></i>'
                } else {
                    return '<i class="fas fa-check"></i>'
                }
            }
            // Limited Usage
            if (item.system.limitedUsage) {
                return item.system.properties.limitedUsage.use > 0
                    ? '<i class="fas fa-check"></i>'
                    : ''
            }
            // Others
            return '<i class="fas fa-check"></i>'
        }
        return ''
    }

    /**
     * Get Quantity
     * @param {object} item
     * @returns  {number}
     */
    _getQuantityData (item) {
        let result = ''

        // Consumable item
        if (item.type === 'item') {
            const consumable = item.system.properties.consumable
            const quantity = item.system.qty
            if (consumable) {
                if (quantity > 0) {
                    result = quantity
                }
            } else {
                if (quantity > 1) {
                    result = quantity
                }
            }
        }

        // Capacity with limited use
        if (item.type === 'capacity' && item.system.activable) {
            if (item.system.limitedUsage) {
                result += item.system.properties.limitedUsage.use +
                '/' + item.system.properties.limitedUsage.maxUse
            }
        }

        return result
    }
}
