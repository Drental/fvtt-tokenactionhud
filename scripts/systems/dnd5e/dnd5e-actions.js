import { ActionHandler } from '../../core/actions/actionHandler.js'
import * as settings from '../../core/settings.js'
import { Logger } from '../../core/logger.js'

export class ActionHandler5e extends ActionHandler {
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

        if (actor?.type === 'character' || actor?.type === 'npc') {
            return this._buildCharacterActions(actionList, character, subcategoryIds)
        }
        if (actor?.type === 'vehicle') {
            return this._buildVehicleActions(actionList, character, subcategoryIds)
        }
        if (!actor) {
            return this._buildMultipleTokenActions(actionList, subcategoryIds)
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
            subcategoryId === 'consumables' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'tools' ||
            subcategoryId === 'weapons'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
            this._buildAbilities(actionList, character, 'ability', 'abilities')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'checks')) {
            this._buildAbilities(actionList, character, 'abilityCheck', 'checks')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combat')) {
            this._buildCombat(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
            this._buildConditions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'features')) {
            this._buildFeatures(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'effects')) {
            this._buildEffects(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character, inventorySubcategoryIds)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'rests')) {
            this._buildRests(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'saves')) {
            this._buildAbilities(actionList, character, 'abilitySaves', 'saves')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'spells')) {
            this._buildSpells(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'utility')) {
            this._buildUtility(actionList, character)
        }

        return actionList
    }

    /**
     * Build Vehicle  Actions
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async _buildVehicleActions (actionList, character, subcategoryIds) {
        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'consumables' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'tools' ||
            subcategoryId === 'weapons'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
            this._buildAbilities(actionList, character, 'ability', 'abilities')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'checks')) {
            this._buildAbilities(actionList, character, 'abilityCheck', 'checks')
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combat')) {
            this._buildCombat(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
            this._buildConditions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'effects')) {
            this._buildEffects(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'features')) {
            this._buildFeatures(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character, inventorySubcategoryIds)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'saves')) {
            this._buildAbilities(actionList, character, 'abilitySave', 'saves')
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
    async _buildMultipleTokenActions (actionList, subcategoryIds) {
        const character = { actor: { id: 'multi' }, token: { id: 'multi' } }

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
            this._buildAbilities(
                actionList,
                character,
                'ability',
                'abilities'
            )
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combat')) {
            this._buildCombat(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'conditions')) {
            this._buildConditions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'checks')) {
            this._buildAbilities(
                actionList,
                character,
                'abilityCheck',
                'checks'
            )
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'rests')) {
            this._buildRests(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'saves')) {
            this._buildAbilities(
                actionList,
                character,
                'abilitySave',
                'saves'
            )
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
        const tokenId = character.token?.id
        const abbr = settings.get('abbreviateSkills')

        const abilities = (actorId === 'multi') ? game.dnd5e.config.abilities : actor.system.abilities

        // Get actions
        const actions = Object.entries(abilities)
            .filter((ability) => abilities[ability[0]].value !== 0)
            .map((ability) => {
                const id = ability[0]
                const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
                const name = abbr ? abbreviatedName : game.dnd5e.config.abilities[id]
                const encodedValue = [actionType, actorId, tokenId, id].join(
                    this.delimiter
                )
                let icon
                if (subcategoryId === 'checks') {
                    icon = ''
                } else {
                    icon = this._getProficiencyIcon(abilities[id].proficient)
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
            initiative: { label: this.i18n('tokenActionHud.rollInitiative') },
            endTurn: { label: this.i18n('tokenActionHud.endTurn') }
        }

        // Delete endTurn for multiple tokens
        if (game.combat?.current?.tokenId !== tokenId) delete combatTypes.endTurn

        // Get actions
        const actions = Object.entries(combatTypes).map((combatType) => {
            const id = combatType[0]
            const name = combatType[1].label
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
        const conditions = CONFIG.statusEffects.filter((condition) => condition.id !== '')
        if (!conditions) return
        const actions = conditions.map((condition) => {
            const id = condition.id
            const name = this.i18n(condition.label)
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const active = actors.every((actor) => {
                const effects = actor.effects
                return effects
                    .map((effect) => effect.flags?.core?.statusId)
                    .some((statusId) => statusId === id)
            })
                ? 'active'
                : ''
            const cssClass = `toggle${active}`
            const img = condition.icon
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
            temporary: { label: this.i18n('tokenActionHud.temporary'), effects: [] },
            passive: { label: this.i18n('tokenActionHud.passive'), effects: [] }
        }

        // Group effects by type
        const effects = actor.effects
        effects.forEach((effect) => {
            if (effect.isTemporary) {
                effectTypes.temporary.effects.push(effect)
            } else {
                effectTypes.passive.effects.push(effect)
            }
        })

        Object.entries(effectTypes).forEach((effectType) => {
            const subcategoryId = `effects_${effectType[0]}`
            const subcategoryName = effectType[1].label
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

            this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
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
        const actionType = 'feature'
        const parentSubcategoryId = 'features'
        const subcategoryList = []

        const featureTypes = {
            active: { label: this.i18n('tokenActionHud.active'), items: [] },
            passive: { label: this.i18n('tokenActionHud.passive'), items: [] },
            lair: { label: this.i18n('tokenActionHud.dnd5e.lair'), items: [] },
            legendary: { label: this.i18n('tokenActionHud.dnd5e.legendary'), items: [] },
            actions: { label: this.i18n('tokenActionHud.actions'), items: [] },
            features: { label: this.i18n('tokenActionHud.features'), items: [] },
            reactions: { label: this.i18n('tokenActionHud.reactions'), items: [] }
        }

        // Get feat items
        let feats = actor.items.filter((item) => item.type === 'feat')

        // Discard slow items
        feats = this._discardSlowItems(feats)

        // Sort items
        feats = this.sortItems(feats)

        // Group feats by type
        feats.forEach((item) => {
            const activationType = item.system.activation.type
            if (actor.type === 'vehicle') {
                if (
                    activationType &&
                    activationType !== 'none' &&
                    activationType !== 'reaction'
                ) {
                    featureTypes.actions.items.push(item)
                }
                if (!activationType || activationType === 'none') {
                    featureTypes.features.items.push(item)
                }
                if (activationType === 'reaction') {
                    featureTypes.reactions.items.push(item)
                }
            }
            if (actor.type === 'character' || actor.type === 'npc') {
                if (
                    activationType && activationType !== '' &&
                    activationType !== 'lair' &&
                    activationType !== 'legendary'
                ) {
                    featureTypes.active.items.push(item)
                }
                if (!activationType || activationType === '') {
                    featureTypes.passive.items.push(item)
                }
                if (activationType === 'lair') {
                    featureTypes.lair.items.push(item)
                }
                if (activationType === 'legendary') {
                    featureTypes.legendary.items.push(item)
                }
            }
        })

        // Delete unneeded feature types
        if (actor.type === 'vehicle') {
            delete featureTypes.active
            delete featureTypes.passive
            delete featureTypes.lair
            delete featureTypes.legendary
        }
        if (actor.type === 'character' || actor.type === 'npc') {
            if (settings.get('ignorePassiveFeats')) { delete featureTypes.passive }
            delete featureTypes.actions
            delete featureTypes.features
            delete featureTypes.reactions
        }

        // Loop feature types
        Object.entries(featureTypes).forEach((featureType) => {
            const subcategoryId = `features_${featureType[0]}`
            const subcategoryName = featureType[1].label
            const subcategory = this.initializeEmptySubcategory(
                subcategoryId,
                parentSubcategoryId,
                subcategoryName,
                'system'
            )

            // Get items
            const items = featureType[1].items

            // Get actions
            const actions = items.map((item) => this._getAction(character, actionType, item))

            this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
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

        const validItems = this._discardSlowItems(
            actor.items.filter((item) => item.system.quantity > 0)
        )
        const sortedItems = this.sortItems(validItems)

        // Equipped Inventory
        let equipped
        if (actor?.type === 'npc' && settings.get('showAllNpcItems')) {
            equipped = sortedItems.filter((item) =>
                item.type !== 'consumable' &&
                item.type !== 'spell' &&
                item.type !== 'feat'
            )
        } else {
            equipped = sortedItems.filter((item) => item.type !== 'consumable' && item.system.equipped)
        }
        const activeEquipped = this._getActiveEquipment(equipped)

        // Consumables
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'consumables')) {
            const allConsumables = this._getActiveEquipment(
                sortedItems.filter((item) => item.type === 'consumable')
            )
            const consumables = this._discardExpendedItems(allConsumables)
            this._buildItems(actionList, character, consumables, 'consumables')
        }

        // Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'equipment')) {
            const equipment = activeEquipped.filter((item) => item.type === 'equipment')
            this._buildItems(actionList, character, equipment, 'equipment')
        }

        // Tools
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'tools')) {
            const tools = validItems.filter((item) => item.type === 'tool')
            this._buildItems(actionList, character, tools, 'tools')
        }

        // Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = activeEquipped.filter((item) => item.type === 'weapon')
            this._buildItems(actionList, character, weapons, 'weapons')
        }
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
     * Get Active Equipment
     * @private
     * @param {object} equipment
     * @returns {object}
     */
    _getActiveEquipment (equipment) {
        let activeEquipment = []
        if (!settings.get('showItemsWithoutAction')) {
            const activationTypes = Object.keys(game.dnd5e.config.abilityActivationTypes)
                .filter((at) => at !== 'none')

            activeEquipment = equipment.filter((e) => {
                const activation = e.system.activation
                if (!activation) return false

                return activationTypes.includes(e.system.activation.type)
            })
        } else {
            activeEquipment = equipment
        }

        return activeEquipment
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
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const id = entity.id
        let name = entity.name
        if (
            entity?.system?.recharge &&
            !entity?.system?.recharge?.charged &&
            entity?.system?.recharge?.value
        ) {
            name += ` (${this.i18n('tokenActionHud.recharge')})`
        }
        const encodedValue = [actionType, actorId, tokenId, id].join(
            this.delimiter
        )
        const img = this.getImage(entity)
        const icon = this._getIcon(entity?.system?.activation?.type)
        const itemInfo = this._getItemInfo(actor, entity)
        const info1 = itemInfo.info1
        const info2 = itemInfo.info2
        const info3 = itemInfo.info3
        return {
            id,
            name,
            encodedValue,
            img,
            icon,
            info1,
            info2,
            info3,
            selected: true
        }
    }

    /**
     * Get Item Info
     * @private
     * @param {object} actor
     * @param {object} item
     * @returns {object}
     */
    _getItemInfo (actor, item) {
        return {
            info1: this._getQuantityData(item) ?? '',
            info2: this._getUsesData(item) ?? '',
            info3: this._getConsumeData(item, actor) ?? ''
        }
    }

    /**
     * Build Rests
     * @param {object} actionList
     * @param {object} character
     */
    _buildRests (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actors = (actorId === 'multi') ? this._getActors() : [actor]
        if (!actors.every((actor) => actor.type === 'character')) return
        const actionType = 'utility'
        const subcategoryId = 'rests'

        const restTypes = {
            shortRest: { name: this.i18n('tokenActionHud.shortRest') },
            longRest: { name: this.i18n('tokenActionHud.longRest') }
        }

        const actions = Object.entries(restTypes)
            .map((restType) => {
                const id = restType[0]
                const name = restType[1].name
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
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSkills (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const abbr = settings.get('abbreviateSkills')

        // Get skills
        const skills = (actorId === 'multi') ? game.dnd5e.config.skills : actor.system.skills

        // Get actions
        const actions = Object.entries(skills)
            .map((skill) => {
                try {
                    const id = skill[0]
                    const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
                    const name = abbr ? abbreviatedName : game.dnd5e.config.skills[id].label
                    const encodedValue = [actionType, actorId, tokenId, id].join(
                        this.delimiter
                    )
                    const icon = this._getProficiencyIcon(skills[id].value)
                    return {
                        id,
                        name,
                        encodedValue,
                        icon
                    }
                } catch (error) {
                    Logger.error(skill)
                    return null
                }
            })
            .filter((skill) => !!skill)

        this.addActionsToActionList(actionList, actions, 'skills')
    }

    /**
     * Build Spells
     * @param {object} actionList
     * @param {object} character
     */
    _buildSpells (actionList, character) {
        const actor = character?.actor
        const actionType = 'spell'
        const parentSubcategoryId = 'spells'

        // Get spell items
        let spells = actor.items.filter((item) => item.type === 'spell')

        // Discard slow spells
        spells = this._discardSlowItems(spells)

        // Discard expended spells
        spells = this._discardExpendedItems(spells)

        // Discard non-preprared spells
        spells = this._discardNonPreparedSpells(actor, spells)

        // Sport spells by level
        spells = this._sortSpellsByLevel(spells)

        // Reverse sort spells by level
        const spellSlotInfo = Object.entries(actor.system.spells).sort((a, b) => {
            return b[0].toUpperCase().localeCompare(a[0].toUpperCase(), undefined, {
                sensitivity: 'base'
            })
        })

        // Go through spells and if higher available slots exist, mark spell slots available at lower levels.
        const pactInfo = spellSlotInfo.find((spell) => spell[0] === 'pact')

        let slotsAvailable = false
        spellSlotInfo.forEach((spell) => {
            if (spell[0].startsWith('spell')) {
                if (!slotsAvailable && spell[1].max > 0 && spell[1].value > 0) {
                    slotsAvailable = true
                }

                if (!slotsAvailable && spell[0] === 'spell' + pactInfo[1]?.level) {
                    if (pactInfo[1].max > 0 && pactInfo[1].value > 0) { slotsAvailable = true }
                }

                spell[1].slotsAvailable = slotsAvailable
            } else {
                if (!spell[1]) spell[1] = {}

                spell[1].slotsAvailable = !spell[1].max || spell[1].value > 0
            }
        })

        const pactIndex = spellSlotInfo.findIndex((spell) => spell[0] === 'pact')

        if (!spellSlotInfo[pactIndex][1].slotsAvailable) {
            const pactSpellEquivalent = spellSlotInfo.findIndex(
                (spell) => spell[0] === 'spell' + pactInfo[1].level
            )
            spellSlotInfo[pactIndex][1].slotsAvailable =
                spellSlotInfo[pactSpellEquivalent][1].slotsAvailable
        }

        // Get preparation modes/levels
        const spellLevelIds = [
            ...new Set(
                spells.map((spell) => {
                    const prepId = spell.system.preparation.mode
                    const levelId = spell.system.level
                    const isPrep = !!(prepId === 'pact' || prepId === 'atwill' || prepId === 'innate')
                    if (isPrep) {
                        return prepId
                    } else {
                        return levelId
                    }
                })
            )
        ]

        // Get spell levels
        const spellLevels = spellLevelIds.map((spellLevel) => {
            const isPrep = !!(
                spellLevel === 'pact' ||
                spellLevel === 'atwill' ||
                spellLevel === 'innate'
            )
            const id = isPrep ? spellLevel : `spell${spellLevel}`
            const name = isPrep
                ? game.dnd5e.config.spellPreparationModes[spellLevel]
                : spellLevel === 0
                    ? this.i18n('tokenActionHud.cantrips')
                    : `${this.i18n('tokenActionHud.level')} ${spellLevel}`
            return [id, name]
        })

        const subcategoryList = []

        for (const spellLevel of spellLevels) {
            const spellLevelId = `spells_${spellLevel[0]}`
            const spellLevelName = spellLevel[1]
            const isPrep = !!(
                spellLevelId === 'pact' ||
                spellLevelId === 'atwill' ||
                spellLevelId === 'innate'
            )
            const levelInfo = spellSlotInfo.find((level) => level[0] === spellLevel[0])?.[1]
            const slots = levelInfo?.value
            const max = levelInfo?.max
            const slotsAvailable = levelInfo?.slotsAvailable
            const ignoreSlotsAvailable = settings.get('showEmptyItems')

            if (max && !(slotsAvailable || ignoreSlotsAvailable)) continue

            const subcategory = this.initializeEmptySubcategory(
                spellLevelId,
                parentSubcategoryId,
                spellLevelName,
                'system'
            )
            if (max > 0) subcategory.info1 = `${slots}/${max}`

            // Get actions
            const actions = []
            for (const spell of spells) {
                const spellSpellLevelId = isPrep
                    ? `spells_${spell.system.preparation.mode}`
                    : `spells_spell${spell.system.level}`

                if (spellSpellLevelId === spellLevelId) {
                    const action = this._getAction(character, actionType, spell)
                    if (settings.get('showSpellInfo')) {
                        this._addSpellInfo(spell, action)
                    }
                    actions.push(action)
                }
            }

            this.addToSubcategoriesList(
                subcategoryList,
                spellLevelId,
                subcategory,
                actions
            )
        }

        this.addSubcategoriesToActionList(actionList, subcategoryList, 'spells')
    }

    /**
     * Sort Spells by Level
     * @private
     * @param {object} spells
     * @returns {object}
     */
    _sortSpellsByLevel (spells) {
        const result = Object.values(spells)
        result.sort((a, b) => {
            if (a.system.level === b.system.level) {
                return a.name
                    .toUpperCase()
                    .localeCompare(b.name.toUpperCase(), undefined, {
                        sensitivity: 'base'
                    })
            }
            return a.system.level - b.system.level
        })

        return result
    }

    /**
     * Add Spell Info
     * @param {object} spell
     * @param {object} action
     */
    _addSpellInfo (spell, action) {
        const components = spell.system.components

        action.info1 = ''
        action.info2 = ''
        action.info3 = ''

        if (components?.vocal) {
            spell.info1 += this.i18n('DND5E.ComponentVerbal').charAt(0).toUpperCase()
        }

        if (components?.somatic) {
            spell.info1 += this.i18n('DND5E.ComponentSomatic').charAt(0).toUpperCase()
        }

        if (components?.material) {
            spell.info1 += this.i18n('DND5E.ComponentMaterial').charAt(0).toUpperCase()
        }

        if (components?.concentration) {
            spell.info2 += this.i18n('DND5E.Concentration').charAt(0).toUpperCase()
        }

        if (components?.ritual) {
            spell.info3 += this.i18n('DND5E.Ritual').charAt(0).toUpperCase()
        }
    }

    /**
     * Build Utility
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildUtility (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actors = (actorId === 'multi') ? this._getActors() : [actor]
        if (!actors.every((actor) => actor.type === 'character')) return
        const actionType = 'utility'
        const subcategoryId = 'utility'

        const utilityTypes = {
            deathSave: { name: this.i18n('tokenActionHud.dnd5e.deathSave') },
            inspiration: { name: this.i18n('tokenActionHud.inspiration') }
        }

        // Delete 'deathSave' for multiple tokens
        if (actorId === 'multi' || actor.system.attributes.hp.value > 0) delete utilityTypes.deathSave

        // Get actions
        const actions = Object.entries(utilityTypes)
            .map((utilityType) => {
                const id = utilityType[0]
                const name = utilityType[1].name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                let cssClass = ''
                if (utilityType[0] === 'inspiration') {
                    const active = actors.every((actor) => actor.system.attributes?.inspiration)
                        ? ' active'
                        : ''
                    cssClass = `toggle${active}`
                }
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
     * Get Actors
     * @private
     * @returns {object}
     */
    _getActors () {
        const allowedTypes = ['character', 'npc']
        const actors = canvas.tokens.controlled.map((token) => token.actor)
        if (actors.every((actor) => allowedTypes.includes(actor.type))) {
            return actors
        }
    }

    /**
     * Get Quantity
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getQuantityData (item) {
        const quantity = item?.system?.quantity
        return (quantity > 1) ? quantity : ''
    }

    /**
     * Get Uses
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getUsesData (item) {
        let result = ''

        const uses = item?.system?.uses
        if (!uses) return result

        result = uses.value === 0 && uses.max ? '0' : uses.value

        if (uses.max > 0) {
            result += `/${uses.max}`
        }

        return result
    }

    /**
     * Get Consume
     * @private
     * @param {object} item
     * @param {object} actor
     * @returns {string}
     */
    _getConsumeData (item, actor) {
        let result = ''

        const consumeType = item?.system?.consume?.type
        if (consumeType && consumeType !== '') {
            const consumeId = item.system.consume.target
            const parentId = consumeId.substr(0, consumeId.lastIndexOf('.'))
            if (consumeType === 'attribute') {
                const target = getProperty(actor, `system.${parentId}`)

                if (target) {
                    result = target.value ?? 0
                    if (target.max) result += `/${target.max}`
                }
            }

            if (consumeType === 'charges') {
                const consumeId = item.system.consume.target
                const target = actor.items.get(consumeId)
                const uses = target?.system.uses
                if (uses?.value) {
                    result = uses.value
                    if (uses.max) result += `/${uses.max}`
                }
            }

            if (!(consumeType === 'attribute' || consumeType === 'charges')) {
                const consumeId = item.system.consume.target
                const target = actor.items.get(consumeId)
                const quantity = target?.system.quantity
                if (quantity) {
                    result = quantity
                }
            }
        }

        return result
    }

    /**
     * Discard Slow Items
     * @private
     * @param {object} items
     * @returns {object}
     */
    _discardSlowItems (items) {
        let result

        if (settings.get('hideLongerActions')) {
            result = items.filter((item) => {
                return (
                    !item.system.activation ||
                    !(
                        item.system.activation.type === 'minute' ||
                        item.system.activation.type === 'hour' ||
                        item.system.activation.type === 'day'
                    )
                )
            })
        }

        return result || items
    }

    /**
     * Discard Non-Prepared Spells
     * @private
     * @param {object} spells
     * @returns {object}
     */
    _discardNonPreparedSpells (actor, spells) {
        if (actor.type !== 'character' && settings.get('showAllNpcItems')) return

        const nonpreparableSpells = Object.keys(game.dnd5e.config.spellPreparationModes)
            .filter((p) => p !== 'prepared')

        let result = spells
        if (settings.get('showAllNonPreparableSpells')) {
            result = spells.filter((spell) => {
                return (
                    spell.system.preparation.prepared ||
                    nonpreparableSpells.includes(spell.system.preparation.mode) ||
                    spell.system.level === 0
                )
            })
        } else {
            result = spells.filter((spell) => spell.system.preparation.prepared)
        }

        return result
    }

    /**
     * Discard Expended Items
     * @private
     * @param {object} items
     * @returns {object}
     */
    _discardExpendedItems (items) {
        if (settings.get('showEmptyItems')) return items

        return items.filter((item) => {
            const uses = item.system.uses
            // Assume something with no uses is unlimited in its use
            if (!uses) return true

            // If it has a max but value is 0, don't return
            if (uses.max > 0 && !uses.value) return false

            return true
        })
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
            1: '<i class="fas fa-check"></i>',
            2: '<i class="fas fa-check-double"></i>'
        }
        return icons[level]
    }

    /**
     * Get Icon
     * @param {object} action
     * @returns {string}
     */
    _getIcon (action) {
        const img = {
            bonus: '<i class="fas fa-plus"></i>',
            crew: '<i class="fas fa-users"></i>',
            day: '<i class="fas fa-hourglass-end"></i>',
            hour: '<i class="fas fa-hourglass-half"></i>',
            lair: '<i class="fas fa-home"></i>',
            minute: '<i class="fas fa-hourglass-start"></i>',
            legendary: '<i class="fas fa-dragon"></i>',
            reaction: '<i class="fas fa-bolt"></i>',
            special: '<i class="fas fa-star"></i>',
        }
        return img[action]
    }
}
