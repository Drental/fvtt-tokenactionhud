import { ActionHandler } from '../../core/actions/actionHandler.js'
import * as settings from '../../core/settings.js'

export class ActionHandlerForbiddenlands extends ActionHandler {
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

        if (actor) {
            this._buildSingleTokenActions(actionList, character, subcategoryIds)
        } else {
            this._buildMultipleTokenActions(actionList, subcategoryIds)
        }

        return actionList
    }

    /**
     * Build Single Token Actions
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async _buildSingleTokenActions (actionList, character, subcategoryIds) {
        const actor = character?.actor
        const actorType = actor.type

        if (!['character', 'monster'].includes(actorType)) return

        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'armors' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'weapons'
        )

        if (actorType === 'character') {
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
                this._buildAttributes(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
                this._buildSkills(actionList, character)
            }
            if (inventorySubcategoryIds) {
                this._buildInventory(actionList, character, inventorySubcategoryIds)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'talents')) {
                this._buildTalents(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'spells')) {
                this._buildSpells(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'consumables')) {
                this._buildConsumables(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
                this._buildConditions(actionList, character)
            }
        }
        if (actorType === 'monster') {
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
                this._buildAttributes(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
                this._buildSkills(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'talents')) {
                this._buildMonsterTalents(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attacks')) {
                this._buildMonsterAttacks(actionList, character)
            }
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'utility')) {
            this._buildUtility(actionList, character)
        }
    }

    _buildMultipleTokenActions (actionList, subcategoryIds) {
        const character = { actor: { id: 'multi' }, token: { id: 'multi' } }
        const allowedTypes = ['monster', 'character']
        const actors = canvas.tokens.controlled
            .map(token => token.actor)
            .filter((actor) => allowedTypes.includes(actor.type))

        return actionList
    }

    _buildInventory (actionList, character, inventorySubcategoryIds) {
        const actor = character?.actor

        let items = actor.items.filter(item => ['weapon', 'armor', 'item'].includes(item.type))
        items = this.sortItems(items)

        // Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = items.filter(item => (item.type === 'weapon'))
            this._buildItems(actionList, character, weapons, 'weapon', 'weapons')
        }

        // Armors
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'armors')) {
            const armors = items.filter(item => (item.type === 'armor'))
            this._buildItems(actionList, character, armors, 'armor', 'armors')
        }

        // Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'equipment')) {
            const equipment = items.filter(item => (item.type === 'item'))
            this._buildItems(actionList, character, equipment, 'item', 'equipment')
        }
    }

    /**
     * Build Talents
     * @param {object} actionList
     * @param {object} character
     */
    _buildTalents (actionList, character) {
        const actor = character?.actor
        const actionType = 'item'
        const subcategoryId = 'talents'

        let items = actor.items.filter(item => item.type === 'talent')
        items = this.sortItems(items)

        this._buildItems(actionList, character, items, actionType, subcategoryId)
    }

    /**
     * Build Spells
     * @param {object} actionList
     * @param {object} character
     */
    _buildSpells (actionList, character) {
        const actor = character?.actor
        const actionType = 'item'
        const subcategoryId = 'spells'

        let items = actor.items.filter(item => item.type === 'spell')
        items = this.sortItems(items)

        this._buildItems(actionList, character, items, actionType, subcategoryId)
    }

    /**
     * Build Consumables
     * @param {object} actionList
     * @param {object} character
     */
    _buildConsumables (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'consumable'
        const subcategoryId = 'consumables'

        const consumables = Object.entries(actor.system.consumable)
        const actions = consumables.map(consumable => {
            const id = consumable[0]
            const name = this.i18n('CONSUMABLE.' + consumable[0].toUpperCase())
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
     * Build Skills
     * @param {object} actionList
     * @param {object} character
     */
    _buildSkills (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const subcategoryId = 'skills'

        const skills = Object.entries(actor.system.skill)
        const actions = skills.map(skill => {
            const id = skill[0]
            const name = this.i18n('SKILL.' + skill[0].toUpperCase().replaceAll('-', '_'))
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
     * Build Attributes
     * @param {object} actionList
     * @param {object} character
     */
    _buildAttributes (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'attribute'
        const subcategoryId = 'attributes'

        const attributes = Object.entries(actor.system.attribute)
        const actions = attributes.map(attribute => {
            const name = this.i18n('ATTRIBUTE.' + attribute[0].toUpperCase())
            const id = attribute[0]
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
     * Build Monster Talents
     * @param {object} actionList
     * @param {object} character
     */
    _buildMonsterTalents (actionList, character) {
        const actor = character?.actor
        const actionType = 'item'
        const subcategoryId = 'talents'

        let items = actor.items.filter(item => item.type === 'talent')
        items = this.sortItems(items)

        this._buildItems(actionList, character, items, actionType, subcategoryId)
    }

    /**
     * Build Attacks
     * @param {object} actionList
     * @param {object} character
     */
    _buildMonsterAttacks (actionList, character) {
        const actor = character?.actor
        const actionType = 'monsterAttack'
        const subcategoryId = 'attacks'

        let items = actor.items.filter(item => item.type === 'monsterAttack')
        items = this.sortItems(items)

        this._buildItems(actionList, character, items, actionType, subcategoryId)
    }

    /**
     * Build Conditions
     * @param {object} actionList
     * @param {object} character
     */
    _buildConditions (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'condition'
        const subcategoryId = 'conditions'

        const conditions = [
            { id: 'hungry', name: this.i18n('CONDITION.HUNGRY') },
            { id: 'thirsty', name: this.i18n('CONDITION.THIRSTY') },
            { id: 'cold', name: this.i18n('CONDITION.COLD') },
            { id: 'sleepy', name: this.i18n('CONDITION.SLEEPY') }
        ]

        const actions = conditions.map(condition => {
            const id = condition.id
            const name = condition.name
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            const active = (actor.system.condition[id].value) ? ' active' : ''
            const cssClass = `toggle${active}`
            return {
                id,
                name,
                encodedValue,
                cssClass,
                selected: true
            }
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Utility
     * @param {object} actionList
     * @param {object} character
     */
    _buildCombat (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'utility'
        const subcategoryId = 'combat'

        const combatTypes = {
            endTurn: { id: 'endTurn', name: this.i18n('tokenActionHud.endTurn') }
        }

        // Delete endTurn for multiple tokens
        if (game.combat?.current?.tokenId !== tokenId) delete combatTypes.endTurn

        // Get actions
        const actions = Object.entries(combatTypes).map((combatType) => {
            const id = combatType[1].id
            const name = combatType[1].name
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
    _buildItems (actionList, character, items, actionType, subcategoryId) {
        const actions = items.map((item) =>
            this._getItemAction(actionType, character, item)
        )

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Get Item Action
     * @private
     * @param {string} actionType
     * @param {object} character
     * @param {object} item
     * @returns {object}
     */
    _getItemAction (actionType, character, item) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const id = item.id
        const name = item.name
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
        const img = this.getImage(item)
        const info1 = this._getQuantityData(item)
        return {
            id,
            name,
            encodedValue,
            img,
            info1,
            selected: true
        }
    }

    /**
     * Get Quantity
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getQuantityData (item) {
        const quantity = item?.system?.quantity?.value
        return (quantity > 1) ? quantity : ''
    }
}
