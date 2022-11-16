import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerAlienrpg extends ActionHandler {
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

        if (actor?.type === 'character' || actor?.type === 'synthetic') {
            return this._buildCharacterActions(actionList, character, subcategoryIds)
        }
        if (actor?.type === 'creature') {
            return this._buildCreatureActions(actionList, character, subcategoryIds)
        }
        if (!actor) {
            return this._buildMultiTokenActions(actionList, subcategoryIds)
        }

        return actionList
    }

    /**
     * Build Character Actions
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async _buildCharacterActions (actionList, character, subcategoryIds) {
        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'weapons' ||
            subcategoryId === 'armor' ||
            subcategoryId === 'equipment'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'agenda')) {
            this._buildAgenda(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
            this._buildAttributes(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
            this._buildConditions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'consumables')) {
            this._buildConsumables(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character, inventorySubcategoryIds)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'power')) {
            this._buildPowers(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'talents')) {
            this._buildTalents(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'utility')) {
            this._buildUtility(actionList, character)
        }

        return actionList
    }

    /**
     * Build Creature Actions
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async _buildCreatureActions (actionList, character, subcategoryIds) {
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attack')) {
            this._buildAttacks(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
            this._buildCreatureAttributes(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'utility')) {
            this._buildUtility(actionList, character)
        }

        return actionList
    }

    /**
     * Build Agenda
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAgenda (actionList, character) {
        const actor = character.actor
        const agenda = (actor.items ?? [])
            .filter((item) => item.type === 'agenda')
            .sort(this.foundrySort)
        this._buildItems(actionList, character, agenda, 'agenda')
    }

    /**
     * Build Attacks
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAttacks (actionList, character) {
        const actor = character?.actor
        if (actor.type !== 'creature') return
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const subcategoryId = 'attacks'

        const attacks = ['creatureAttack', 'acidSplash']
        const actions = attacks.map((attack) => {
            const actionType = attack
            const id = attack
            const name = this.i18n(`tokenActionHud.alienRpg.${attack}`)
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
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
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAttributes (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'attribute'
        const subcategoryId = 'attributes'

        const attributes = Object.entries(actor.system.attributes)
        const actions = attributes.map((attribute) => {
            const id = attribute[0]
            const name = this.i18n('tokenActionHud.alienRpg.' + attribute[0])
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
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
     * Build Conditions
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildConditions (actionList, character) {
        const actor = character?.actor
        if (actor.type !== 'character') return
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'conditions'
        const subcategoryId = 'conditions'

        const conditions = [
            {
                id: 'toggleStarving',
                name: this.i18n('tokenActionHud.alienRpg.starving'),
                active: actor.system.general.starving.value
                    ? ' active'
                    : ''
            },
            {
                id: 'toggleDehydrated',
                name: this.i18n('tokenActionHud.alienRpg.dehydrated'),
                active: actor.system.general.dehydrated.value
                    ? ' active'
                    : ''
            },
            {
                id: 'toggleExhausted',
                name: this.i18n('tokenActionHud.alienRpg.exhausted'),
                active: actor.system.general.exhausted.value
                    ? ' active'
                    : ''
            },
            {
                id: 'toggleFreezing',
                name: this.i18n('tokenActionHud.alienRpg.freezing'),
                active: actor.system.general.freezing.value
                    ? ' active'
                    : ''
            },
            {
                id: 'togglePanic',
                name: this.i18n('tokenActionHud.alienRpg.panic'),
                active: actor.system.general.panic.value
                    ? ' active'
                    : ''
            }
        ]

        const actions = conditions.map((condition) => {
            const id = condition.id
            const name = condition.name
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            const cssClass = `toggle${condition.active}`
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
     * Build Consumables
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildConsumables (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'consumables'
        const subcategoryId = 'consumables'

        const consumables = Object.entries(actor.system.consumables)
        // Remove Power from the list
        consumables.splice(1, 1)
        const actions = consumables.map((consumable) => {
            const id = consumable[0]
            const name = this.i18n('tokenActionHud.alienRpg.' + consumable[0])
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const img = this.getImage(consumable)
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
     * Build Creature Attributes
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildCreatureAttributes (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'creatureattribute'
        const subcategoryId = 'attributes'
        const actions = []

        // Attributes
        const attributes = Object.entries(actor.system.attributes)
        attributes.forEach((attribute) => {
            const id = attribute[0]
            const name = this.i18n('tokenActionHud.alienRpg.' + attribute[0])
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const action = {
                id,
                name,
                encodedValue,
                selected: true
            }
            actions.push(action)
        })

        // General
        const general = Object.entries(actor.system.general)
        general.splice(2, 3)
        general.forEach((general) => {
            const id = general[0]
            const name = this.i18n('tokenActionHud.alienRpg.' + general[0])
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const action = {
                id,
                name,
                encodedValue,
                selected: true
            }
            actions.push(action)
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
        const actor = character?.actor

        const itemTypes = ['weapon', 'armor', 'item']
        let items = (actor.items ?? []).filter((item) => itemTypes.includes(item.type))
        items = this.sortItems(items)

        // Build Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = items.filter((item) => item.type === 'weapon')
            this._buildItems(actionList, character, weapons, 'weapons')
        }

        // Build Armor
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'armor')) {
            const armor = items.filter((item) => item.type === 'armor')
            this._buildItems(actionList, character, armor, 'armor')
        }

        // Build Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'item')) {
            const equipment = items.filter((item) => item.type === 'item')
            this._buildItems(actionList, character, equipment, 'equipment')
        }
    }

    /**
     * Build Powers
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildPowers (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'power'
        const subcategoryId = 'powers'

        const powers = (actor.items ?? [])
            .filter((item) => item.type === 'item' && item.system.totalPower > 0)
            .sort(this.foundrySort)

        const actions = powers.map((power) => {
            const id = power.id
            const name = power.name
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const img = this.getImage(power)
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
     * Build Skills
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSkills (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const subcategoryId = 'skills'

        const skills = Object.entries(actor.system.skills)
        const actions = skills.map((skill) => {
            const id = skill[0]
            const name = this.i18n('tokenActionHud.alienRpg.' + skill[0])
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
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
     * Build Talents
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildTalents (actionList, character) {
        const actor = character.actor
        const talents = (actor.items ?? [])
            .filter((item) => item.type === 'talent')
            .sort(this.foundrySort)
        this._buildItems(actionList, character, talents, 'talents')
    }

    /**
     * Build Utility
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildUtility (actionList, character) {
        const actor = character?.actor
        const actorId = character.actor?.id
        const tokenId = character?.token?.id
        const subcategoryId = 'utility'
        const actions = []

        // Health
        if (
            actor.type === 'character' ||
            actor.type === 'creature' ||
            actor.type === 'synthetic'
        ) {
            let health = 0
            health = actor.system.header?.health
            if (health) {
                const action = this._getHeaderActions(
                    'health',
                    actorId,
                    tokenId,
                    this.i18n('tokenActionHud.alienRpg.health'),
                    health.value,
                    '10'
                )
                actions.push(action)
            }
        }

        // Stress
        if (actor.type === 'character') {
            const stress = actor.system.header?.stress
            if (stress) {
                const action = this._getHeaderActions(
                    'stress',
                    actorId,
                    tokenId,
                    this.i18n('tokenActionHud.alienRpg.stressPoints'),
                    stress.value,
                    '10'
                )
                actions.push(action)
            }
        }

        if (actor.type === 'character' || actor.type === 'synthetic') {
            // Roll Stress
            const rollStressActionType = 'rollStress'
            const rollStressId = 'rollStress'
            const rollStressName = this.i18n('tokenActionHud.alienRpg.rollStress')
            const rollStressEncodedValue = [
                rollStressActionType,
                actorId,
                tokenId,
                rollStressId,
                ''
            ].join(this.delimiter)
            const rollStressAction = {
                id: rollStressId,
                name: rollStressName,
                encodedValue: rollStressEncodedValue,
                selected: true
            }
            actions.push(rollStressAction)

            // Roll Crit
            const rollCritActionType = 'rollCrit'
            const rollCritId = 'rollCrit'
            const rollCritName = this.i18n('tokenActionHud.alienRpg.rollCrit')
            const rollCritEncodedValue = [
                rollCritActionType,
                actorId,
                tokenId,
                rollCritId,
                ''
            ].join(this.delimiter)
            const rollCritAction = {
                id: rollCritId,
                name: rollCritName,
                encodedValue: rollCritEncodedValue,
                selected: true
            }
            actions.push(rollCritAction)
        }
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Items
     * @private
     */
    _buildItems (actionList, character, items, actionType, subcategoryId) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actions = items.map((item) =>
            this._getAction(actionType, actorId, tokenId, item)
        )
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Get Action
     * @private
     * @param {string} actionType
     * @param {string} actorId
     * @param {string} tokenId
     * @param {object} entity
     * @returns {object}
     */
    _getAction (actionType, actorId, tokenId, entity) {
        const id = entity.id
        const name = entity.name
        const encodedValue = [actionType, actorId, tokenId, id].join(
            this.delimiter
        )
        const img = this.getImage(entity)
        const info1 = this._getQuantityData(entity)
        const info2 = (entity.type === 'talent') ? this._getUsesData(entity) : null
        const action = {
            id,
            name,
            encodedValue,
            img,
            info1,
            info2,
            selected: true
        }
        return action
    }

    /**
    * Get Header Actions
    * @private
    * @param {string} actionType
    * @param {string} actorId
    * @param {string} tokenId
    * @param {string} attrName
    * @param {number} attrVal
    * @param {number} attrMax
    * @returns {object}
    */
    _getHeaderActions (actionType, actorId, tokenId, attrName, attrVal, attrMax) {
        const id = attrName.slugify({ replacement: '_', strict: true })
        const name = attrName
        const encodedValue = [actionType, actorId, tokenId, id, attrVal].join(
            this.delimiter
        )
        const info1 = `${attrVal}/${attrMax}`
        const action = {
            id,
            name,
            encodedValue,
            info1,
            selected: true
        }
        return action
    }

    /**
     * Get Uses
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getUsesData (item) {
        const uses = item.system.uses
        let result = ''
        if (!uses) { return result }
        if (!(uses.max || uses.value)) { return result }
        result = uses.value ?? 0
        if (uses.max > 0) { result += `/${uses.max}` }
        return result
    }

    /**
     * Get Quantity
     * @private
     * @param {object} item
     * @returns {number}
     */
    _getQuantityData (item) {
        const quantity = item.system.quantity?.value
        return (quantity > 1) ? quantity : ''
    }
}
