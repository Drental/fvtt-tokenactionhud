import { ActionHandler } from '../../core/actions/actionHandler.js'
import * as settings from '../../core/settings.js'

export class ActionHandlerDnD4e extends ActionHandler {
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
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async _buildSingleTokenActions (actionList, character, subcategoryIds) {
        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'consumables' ||
            subcategoryId === 'containers' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'loot' ||
            subcategoryId === 'tools' ||
            subcategoryId === 'weapons'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
            this._buildAbilities(actionList, character, 'ability', 'abilities')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
            this._buildConditions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combat')) {
            this._buildCombat(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'effects')) {
            this._buildEffects(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'features')) {
            this._buildFeatures(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'powers')) {
            this._buildPowers(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'utility')) {
            this._buildUtility(actionList, character)
        }

        return actionList
    }

    /**
     * Build Multiple Token Actions
     * @private
     * @param {object} actionList
     * @param {array} subcategoryIds
     * @returns {object}
     */
    _buildMultipleTokenActions (actionList, subcategoryIds) {
        const character = { actor: { id: 'multi' }, token: { id: 'multi' } }

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
            this._buildAbilities(actionList, character, 'ability', 'abilities')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combat')) {
            this._buildCombat(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
            this._buildConditions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }

        return actionList
    }

    /**
     * Build Abilities
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {string} actionType
     * @param {string} subcategoryId
     */
    _buildAbilities (actionList, character, actionType, subcategoryId) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const abbr = settings.get('abbreviateSkills')

        const abilities = (actorId === 'multi') ? game.dnd4eBeta.config.abilities : actor.system.abilities
        const actions = Object.entries(abilities)
            .filter((ability) => abilities[ability[0]].value !== 0)
            .map((ability) => {
                const id = ability[0]
                const abbreviatedName = ability[0].charAt(0).toUpperCase() + ability[0].slice(1)
                const name = abbr ? abbreviatedName : ability[1].label
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                let icon
                if (subcategoryId !== 'checks') {
                    icon = this._getProficiencyIcon(abilities[ability[0]].proficient)
                } else {
                    icon = ''
                }
                return {
                    id,
                    name,
                    encodedValue,
                    icon,
                    selected: true
                }
            })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Combat
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildCombat (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'utility'
        const subcategoryId = 'combat'

        const combatTypes = {
            initiative: { name: this.i18n('tokenActionHud.rollInitiative') },
            endTurn: { name: this.i18n('tokenActionHud.endTurn') }
        }

        // Delete endTurn for multiple tokens
        if (game.combat?.current?.tokenId !== tokenId) delete combatTypes.endTurn

        // Get actions
        const actions = Object.entries(combatTypes).map((combatType) => {
            const id = combatType[0]
            const name = combatType[1].name
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            let info1 = ''
            let cssClass = ''
            if (combatType[0] === 'initiative' && game.combat) {
                const tokenIds = canvas.tokens.controlled.map((token) => token.id)
                const combatants = tokenIds.map((id) =>
                    game.combat.combatants.find((combatant) => combatant.tokenId === id)
                )
                // Get initiative for single token
                if (combatants.length === 1) {
                    const currentInitiative = combatants[0].initiative
                    info1 = currentInitiative
                }
                const active = (combatants.every((combatant) => !!combatant?.initiative)) ? ' active' : ''
                cssClass = `toggle${active}`
            }
            return {
                id,
                name,
                encodedValue,
                info1,
                cssClass,
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
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actors = (actorId === 'multi') ? this._getActors() : [actor]
        const actionType = 'condition'
        const subcategoryId = 'conditions'

        // Filter out empty conditions
        const conditions = CONFIG.statusEffects.filter(
            (condition) => condition.id !== ''
        )
        if (!conditions) return

        // Get actions
        const actions = conditions.map((condition) => {
            const id = condition.id
            const name = this.i18n(condition.label)
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            const img = condition.icon
            const active = actors.every((actor) => {
                const effects = actor.effects
                return effects
                    .map((effect) => effect.flags?.core?.statusId)
                    .some((statusId) => statusId === id)
            })
                ? 'active'
                : ''
            const cssClass = `toggle${active}`
            return {
                id,
                name,
                encodedValue,
                img,
                cssClass,
                selected: true
            }
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Effects
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildEffects (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'effect'
        const parentSubcategoryId = 'effects'
        const subcategoryList = []

        const effectTypes = {
            temporary: { subcategoryId: 'temporary', subcategoryName: this.i18n('tokenActionHud.temporary'), effects: [] },
            passive: { subcategoryId: 'passive', subcategoryName: this.i18n('tokenActionHud.passive'), effects: [] }
        }

        // Group effects in types
        const effects = actor.effects
        effects.forEach((effect) => {
            if (effect.isTemporary) {
                effectTypes.temporary.effects.push(effect)
            } else {
                effectTypes.passive.effects.push(effect)
            }
        })

        Object.entries(effectTypes).forEach((effectType) => {
            const subcategoryId = `${parentSubcategoryId}_${effectType[1].subcategoryId}`
            const subcategoryName = effectType[1].subcategoryName
            const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName, 'system')
            const actions = effectType[1].effects.map((effect) => {
                const id = effect.id
                const name = effect.label
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                const active = (!effect.disabled) ? ' active' : ''
                const cssClass = `toggle${active}`
                const img = effect.icon
                return {
                    id,
                    name,
                    encodedValue,
                    cssClass,
                    img,
                    selected: true
                }
            })

            this.addToSubcategoriesList(subcategoryId, subcategory, actions)
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
    }

    /**
     * Build Features
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildFeatures (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'feature'
        const parentSubcategoryId = 'features'
        const subcategoryList = []

        const featureTypes = {
            raceFeats: { label: this.i18n('DND4EBETA.FeatRace'), items: [] },
            classFeats: { label: this.i18n('DND4EBETA.FeatClass'), items: [] },
            pathFeats: { label: this.i18n('DND4EBETA.FeatPath'), items: [] },
            destinyFeats: { label: this.i18n('DND4EBETA.FeatDestiny'), items: [] },
            feat: { label: this.i18n('DND4EBETA.FeatLevel'), items: [] },
            ritual: { label: this.i18n('DND4EBETA.FeatRitual'), items: [] }
        }

        // Group features into types
        const items = actor.items
        items.forEach((item) => {
            if (Object.keys(featureTypes).includes(item.type)) {
                featureTypes[item.type].items.push(item)
            }
        })

        Object.entries(featureTypes).forEach((featureType) => {
            const subcategoryId = `features_${featureType[0]}`
            const subcategoryName = featureType[1].label
            const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName, 'system')
            const items = featureType[1].items
            const actions = items.map((item) => {
                const id = item.id
                const name = item.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                const img = this.getImage(item)
                return {
                    id,
                    name,
                    encodedValue,
                    img,
                    selected: true
                }
            })

            this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
    }

    /**
     * Build Inventory
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildInventory (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'item'
        const parentSubcategoryId = 'inventory'
        const subcategoryList = []

        const inventoryTypes = {
            backpack: { subcategoryId: 'containers', subcategoryName: this.i18n('tokenActionHud.dnd4e.containers'), items: [] },
            consumable: { subcategoryId: 'consumables', subcategoryName: this.i18n('tokenActionHud.dnd4e.consumables'), items: [] },
            equipment: { subcategoryId: 'equipment', subcategoryName: this.i18n('tokenActionHud.dnd4e.equipment'), items: [] },
            loot: { subcategoryId: 'loot', subcategoryName: this.i18n('tokenActionHud.dnd4e.loot'), items: [] },
            tool: { subcategoryId: 'tools', subcategoryName: this.i18n('tokenActionHud.dnd4e.tools'), items: [] },
            weapon: { subcategoryId: 'weapons', subcategoryName: this.i18n('tokenActionHud.dnd4e.weapons'), items: [] }
        }

        // Group items into types
        const items = actor.items
        items.forEach((item) => {
            if (Object.keys(inventoryTypes).includes(item.type)) {
                if (settings.get('hideUnequippedInventory') && !item.system.equipped) return
                if (settings.get('hideQuantityZero') && item.system.quantity < 1) return
                inventoryTypes[item.type].items.push(item)
            }
        })

        Object.entries(inventoryTypes).forEach((inventoryType) => {
            const subcategoryId = inventoryType[1].subcategoryId
            const subcategoryName = inventoryType[1].subcategoryName
            const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName, 'system')
            const items = inventoryType[1].items
            const actions = items
                .map((item) => {
                    const id = item.id
                    const name = item.name
                    const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                    const img = this.getImage(item)
                    return {
                        id,
                        name,
                        encodedValue,
                        img,
                        selected: true
                    }
                })

            this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
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
        const parentSubcategoryId = 'powers'
        const subcategoryList = []

        const powers = actor.items.filter((item) => item.type === 'power')
        // powerGroupType is not initalised by default
        let groupType = actor.system.powerGroupTypes
        if (!groupType) {
            actor.system.powerGroupTypes = 'usage'
            groupType = 'usage'
        }
        let groupField = 'useType'
        switch (groupType) {
        case 'action':
            groupField = 'actionType'
            break
        case 'type':
            groupField = 'powerType'
            break
        default: break
        }

        const powerTypes = game.dnd4eBeta.tokenBarHooks.generatePowerGroups(actor)
        // Add 'other' to types
        if (!powerTypes.other) {
            powerTypes.other = { label: 'DND4EBETA.Other', items: [], dataset: { type: 'other' } }
        }

        // Group powers into types
        powers.forEach((power) => {
            const key = power.system[groupField]
            if (
                settings.get('hideUsedPowers') &&
                !power.system.useType === 'recharge' &&
                !game.dnd4eBeta.tokenBarHooks.isPowerAvailable(actor, power)) return
            if (powerTypes[key]) {
                powerTypes[key].items.push(power)
            } else {
                powerTypes.other.items.push(power)
            }
        })

        Object.entries(powerTypes).forEach((powerType) => {
            const subcategoryId = powerType[0]
            const subcategoryName = this.i18n(powerType[1].label)
            const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName, 'system')
            const items = powerType[1].items
            const actions = items
                .map((item) => {
                    const id = item.id
                    const name = item.name
                    const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                    const img = this.getImage(item)
                    const cssClass = (settings.get('forcePowerColours')) ? `force-ability-usage--${item.system.useType}` : ''
                    return {
                        id,
                        name,
                        encodedValue,
                        img,
                        cssClass,
                        selected: true
                    }
                })

            this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
    }

    /**
     * Build Skills
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSkills (actionList, character) {
        const actor = character?.actor
        if (actor.type === 'vehicle') return
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const subcategoryId = 'skills'
        const abbr = settings.get('abbreviateSkills')

        const skills = (actorId === 'multi') ? game.dnd4eBeta.config.skills : actor.system.skills
        const actions = Object.entries(skills)
            .map((skill) => {
                const id = skill[0]
                const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
                const name = abbr ? abbreviatedName : game.dnd4eBeta.config.skills[id]
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                const icon = this._getProficiencyIcon(skills[id].value)
                return {
                    id,
                    name,
                    encodedValue,
                    icon,
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
    _buildUtility (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'utility'
        const subcategoryId = 'utility'

        const utilityTypes = {
            heal: { name: this.i18n('DND4EBETA.Healing') },
            quickSave: { name: this.i18n('DND4EBETA.SavingThrow') },
            save: { name: this.i18n('Show Save Dialog') },
            actionPoint: { name: this.i18n('DND4EBETA.ActionPointUse') },
            secondWind: { name: this.i18n('DND4EBETA.SecondWind') },
            deathSave: { name: this.i18n('DND4EBETA.DeathSavingThrow') }
        }

        // Delete used powers
        if (settings.get('hideUsedPowers')) {
            if (!actor.system.actionpoints?.value > 0) delete utilityTypes.actionPoint
            if (actor.system.details?.secondwind) delete utilityTypes.secondWind
        }

        const actions = Object.entries(utilityTypes).map((utilityType) => {
            const id = utilityType[0]
            const name = utilityType[1].name
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
     * Get Actors
     * @returns {object}
     */
    _getActors () {
        const allowedTypes = ['Player Character', 'NPC']
        const actors = canvas.tokens.controlled.map((token) => token.actor)
        if (actors.every((actor) => allowedTypes.includes(actor.type))) {
            return actors
        }
    }

    /**
     * Get Proficiency Icon
     * @param {string} level
     * @returns {string}
     */
    _getProficiencyIcon (level) {
        const icons = {
            0: '',
            0.5: '<i class="fas fa-adjust"></i>',
            5: '<i class="fas fa-check"></i>',
            8: '<i class="fas fa-check-double"></i>'
        }
        return icons[level]
    }
}
