import { ActionHandler } from '../../core/actions/actionHandler.js'
import * as settings from '../../core/settings.js'
import { Logger } from '../../core/logger.js'

export class ActionHandlerSW5e extends ActionHandler {
    /** @override */
    buildSystemActions (actionList, character, subcategoryIds) {
        if (token) {
            return this._buildSingleTokenActions(token)
        } else if (multipleTokens) {
            return this._buildMultipleTokenActions()
        }
        return this.initializeEmptyActionList()
    }

    async _buildSingleTokenActions (token) {
        const list = this.initializeEmptyActionList()
        list.tokenId = token?.id
        list.actorId = token?.actor?.id
        if (!list.tokenId || !list.actorId) {
            return list
        }

        if (settings.get('showHudTitle')) {
            list.hudTitle = token.name
        }

        const cats = await this._buildCategories(token)
        cats
            .flat()
            .filter((c) => c)
            .forEach((c) => {
                this._combineCategoryWithList(list, c.name, c)
            })

        return list
    }

    _buildCategories (token) {
        return [
            this._buildItemsCategory(token),
            this._buildPowersCategory(token),
            this._buildFeaturesCategory(token),
            this._buildSkillsCategory(token),
            this._buildAbilitiesCategory(token),
            this._buildEffectsCategory(token),
            this._buildConditionsCategory(token),
            this._buildUtilityCategory(token)
        ]
    }

    _buildAbilitiesCategory (token) {
        const actor = token.actor
        const abilities = actor.system.abilities

        if (settings.get('splitAbilities')) {
            const savesTitle = this.i18n('tokenActionHud.saves')
            const savesCat = this._getAbilityList(
                token.id,
                abilities,
                'saves',
                savesTitle,
                'abilitySave'
            )
            savesCat.name = savesTitle

            const checksTitle = this.i18n('tokenActionHud.checks')
            const checksCat = this._getAbilityList(
                token.id,
                abilities,
                'checks',
                this.i18n('tokenActionHud.checks'),
                'abilityCheck'
            )
            checksCat.name = checksTitle

            return [savesCat, checksCat]
        }

        return this._getAbilityList(
            token.id,
            abilities,
            'abilities',
            this.i18n('tokenActionHud.abilities'),
            'ability'
        )
    }

    _buildMultipleTokenActions () {
        const list = this.initializeEmptyActionList()
        list.tokenId = 'multi'
        list.actorId = 'multi'

        const allowedTypes = (canvas.tokens.controlled.every((a) => a.type === 'starship')) ? ['starship'] : ['npc', 'character']
        const multiStarships = (allowedTypes === ['starships'])

        const actors = canvas.tokens.controlled
            .map((t) => t.actor)
            .filter((a) => allowedTypes.includes(a.type))

        const tokenId = list.tokenId

        if (multiStarships) this._addMultiStarshipSkills(list, tokenId)
        else this._addMultiSkills(list, tokenId)

        if (settings.get('splitAbilities')) {
            const savesTitle = this.i18n('tokenActionHud.saves')
            const checksTitle = this.i18n('tokenActionHud.checks')
            this._addMultiAbilities(
                list,
                tokenId,
                'saves',
                savesTitle,
                'abilitySave'
            )
            this._addMultiAbilities(
                list,
                tokenId,
                'checks',
                checksTitle,
                'abilityCheck'
            )
        } else {
            const abilitiesTitle = this.i18n('tokenActionHud.abilities')
            this._addMultiAbilities(
                list,
                tokenId,
                'abilities',
                abilitiesTitle,
                'ability'
            )
        }

        if (settings.get('showConditionsCategory')) { this._addMultiConditions(list, tokenId) }

        this._addMultiTokenUtilities(list, tokenId, actors)

        return list
    }

    /** ITEMS **/

    /** @private */
    _buildItemsCategory (token) {
        const actor = token.actor
        const tokenId = token.id

        const validItems = this._filterLongerActions(
            actor.items.filter((i) => i.system.quantity > 0)
        )
        const sortedItems = this.sortItems(validItems)
        const actionType = 'item'

        let equipped
        if (actor.type === 'npc' && settings.get('showAllNpcItems')) {
            equipped = sortedItems.filter(
                (i) =>
                    i.type !== 'consumable' && i.type !== 'power' && i.type !== 'feat'
            )
        } else {
            equipped = sortedItems.filter(
                (i) => i.type !== 'consumable' && i.system.equipped
            )
        }
        const activeEquipped = this._getActiveEquipment(equipped)

        const weapons = activeEquipped.filter((i) => i.type == 'weapon')
        const weaponActions = weapons.map((w) =>
            this._buildEquipmentItem(tokenId, actor, actionType, w)
        )
        const weaponsCat = this.initializeEmptySubcategory()
        weaponsCat.actions = weaponActions

        const equipment = activeEquipped.filter((i) => i.type == 'equipment')
        const equipmentActions = equipment.map((e) =>
            this._buildEquipmentItem(tokenId, actor, actionType, e)
        )
        const equipmentCat = this.initializeEmptySubcategory()
        equipmentCat.actions = equipmentActions

        const other = activeEquipped.filter(
            (i) => i.type !== 'weapon' && i.type !== 'equipment'
        )
        const otherActions = other.map((o) =>
            this._buildEquipmentItem(tokenId, actor, actionType, o)
        )
        const otherCat = this.initializeEmptySubcategory()
        otherCat.actions = otherActions

        const allConsumables = this._getActiveEquipment(
            sortedItems.filter((i) => i.type == 'consumable')
        )

        const expendedFiltered = this._filterExpendedItems(allConsumables)
        const consumable = expendedFiltered
        const consumableActions = consumable.map((c) =>
            this._buildEquipmentItem(tokenId, actor, actionType, c)
        )
        const consumablesCat = this.initializeEmptySubcategory()
        consumablesCat.actions = consumableActions

        const tools = validItems.filter((t) => t.type === 'tool')
        const toolsActions = tools.map((i) =>
            this._buildEquipmentItem(tokenId, actor, actionType, i)
        )
        const toolsCat = this.initializeEmptySubcategory()
        toolsCat.actions = toolsActions

        const weaponsTitle = this.i18n('tokenActionHud.weapons')
        const equipmentTitle = this.i18n('tokenActionHud.equipment')
        const otherTitle = this.i18n('tokenActionHud.other')
        const consumablesTitle = this.i18n('tokenActionHud.consumables')
        const toolsTitle = this.i18n('tokenActionHud.tools')

        const result = this.initializeEmptyCategory('inventory')
        result.name = this.i18n('tokenActionHud.inventory')

        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat)
        this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat)
        this._combineSubcategoryWithCategory(result, otherTitle, otherCat)
        this._combineSubcategoryWithCategory(
            result,
            consumablesTitle,
            consumablesCat
        )
        this._combineSubcategoryWithCategory(result, toolsTitle, toolsCat)

        return result
    }

    /** @private */
    _getActiveEquipment (equipment) {
        let activeEquipment = []
        if (!settings.get('showItemsWithoutAction')) {
            const activationTypes = Object.keys(
                game.sw5e.config.abilityActivationTypes
            ).filter((at) => at !== 'none')

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

    /** SPELLS **/

    /** @private */
    _buildPowersCategory (token) {
        const actor = token.actor
        if (['vehicle', 'starship'].includes(actor.type)) return

        let validPowers = this._filterLongerActions(
            actor.items.filter((i) => i.type === 'power')
        )
        validPowers = this._filterExpendedItems(validPowers)

        if (actor.type === 'character' || !settings.get('showAllNpcItems')) { validPowers = this._filterNonpreparedPowers(validPowers) }

        const powersSorted = this._sortPowersByLevel(validPowers)
        return this._categorisePowers(actor, token.id, powersSorted)
    }

    /** @private */
    _sortPowersByLevel (powers) {
        const result = Object.values(powers)

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

    /** @private */
    _categorisePowers (actor, tokenId, powers) {
        const naturalPowers = this.initializeEmptySubcategory()
        const book = this.initializeEmptySubcategory()
        const actionType = 'power'

        // Reverse sort powers by level
        const powerSlotInfo = Object.entries(actor.system.powers).sort(
            (a, b) => {
                return b[0].toUpperCase().localeCompare(a[0].toUpperCase(), undefined, {
                    sensitivity: 'base'
                })
            }
        )

        // Go through powers and if higher available slots exist, mark power slots available at lower levels.
        let slotsAvailable = false
        powerSlotInfo.forEach((s) => {
            if (s[0].startsWith('power')) {
                if (!slotsAvailable && s[1].max > 0 && s[1].value > 0) { slotsAvailable = true }

                if (!slotsAvailable && s[0] === 'power') {
                    slotsAvailable = true
                }

                s[1].slotsAvailable = slotsAvailable
            } else {
                if (!s[1]) s[1] = {}

                s[1].slotsAvailable = !s[1].max || s[1].value > 0
            }
        })

        const dispose = powers.reduce(
            function (dispose, s) {
                const prep = s.system.preparation.mode
                const prepType = game.sw5e.config.powerPreparationModes[prep]

                const level = s.system.level
                const natPower = prep === 'atwill' || prep === 'innate'

                let max, slots, levelName, levelKey, levelInfo

                if (natPower) {
                    levelKey = prep
                } else {
                    levelKey = 'power' + level
                    levelName = level
                        ? `${this.i18n('tokenActionHud.level')} ${level}`
                        : this.i18n('tokenActionHud.at-will')
                }

                levelInfo = powerSlotInfo.find((lvl) => lvl[0] === levelKey)?.[1]
                slots = levelInfo?.value
                max = levelInfo?.max

                const ignoreSlotsAvailable = settings.get('showEmptyItems')
                if (max && !(levelInfo?.slotsAvailable || ignoreSlotsAvailable)) return

                const power = this._buildItem(tokenId, actor, actionType, s)

                if (settings.get('showPowerInfo')) this._addPowerInfo(s, power)

                // Initialise subcategory if non-existant.
                let subcategory
                if (natPower) {
                    subcategory = naturalPowers.subcategories.find(
                        (cat) => cat.name === prepType
                    )
                } else {
                    subcategory = book.subcategories.find(
                        (cat) => cat.name === levelName
                    )
                }

                if (!subcategory) {
                    subcategory = this.initializeEmptySubcategory()
                    if (max > 0) {
                        subcategory.info1 = `${slots}/${max}`
                    }
                }

                subcategory.actions.push(power)

                if (natPower && naturalPowers.subcategories.indexOf(subcategory) < 0) { this._combineSubcategoryWithCategory(naturalPowers, prepType, subcategory) } else if (!natPower && book.subcategories.indexOf(subcategory) < 0) { this._combineSubcategoryWithCategory(book, levelName, subcategory) }

                return dispose
            }.bind(this),
            {}
        )

        const result = this.initializeEmptyCategory('powers')
        result.name = this.i18n('tokenActionHud.powers')

        const naturalPowersTitle = this.i18n('tokenActionHud.naturalPowers')
        const booksTitle = this.i18n('tokenActionHud.books')

        this._combineSubcategoryWithCategory(result, naturalPowersTitle, naturalPowers)
        this._combineSubcategoryWithCategory(result, booksTitle, book)

        return result
    }

    /** @private */
    _addPowerInfo (s, power) {
        const c = s.components

        power.info1 = ''
        power.info2 = ''
        power.info3 = ''
        if (c?.vocal) { spell.info1 += this.i18n('SW5E.ComponentVerbal').charAt(0).toUpperCase() }

        if (c?.somatic) {
            spell.info1 += this.i18n('SW5E.ComponentSomatic')
                .charAt(0)
                .toUpperCase()
        }

        if (c?.material) {
            spell.info1 += this.i18n('SW5E.ComponentMaterial')
                .charAt(0)
                .toUpperCase()
        }

        if (c?.concentration) { power.info2 += this.i18n('SW5E.Concentration').charAt(0).toUpperCase() }

        if (c?.ritual) { power.info3 += this.i18n('SW5E.Ritual').charAt(0).toUpperCase() }
    }

    /** FEATS **/

    /** @private */
    _buildFeaturesCategory (token) {
        const validFeats = this._filterLongerActions(
            token.actor.items.filter((i) => ['feat', 'classfeature', 'deploymentfeature', 'maneuver', 'starshipfeature'].includes(i.type))
        )
        const sortedFeats = this.sortItems(validFeats)
        return this._categoriseFeatures(token.id, token.actor, sortedFeats)
    }

    /** @private */
    _categoriseFeatures (tokenId, actor, feats) {
        const active = this.initializeEmptySubcategory()
        const passive = this.initializeEmptySubcategory()
        const lair = this.initializeEmptySubcategory()
        const legendary = this.initializeEmptySubcategory()

        const dispose = feats.reduce(
            function (dispose, f) {
                const activationType = f.system.activation.type
                const actionType = 'feat'

                const feat = this._buildEquipmentItem(tokenId, actor, actionType, f)

                if (!activationType || activationType === '') {
                    passive.actions.push(feat)
                    return
                }

                if (activationType == 'lair') {
                    lair.actions.push(feat)
                    return
                }

                if (activationType == 'legendary') {
                    legendary.actions.push(feat)
                    return
                }

                active.actions.push(feat)
            }.bind(this),
            {}
        )

        const result = this.initializeEmptyCategory('feats')
        result.name = this.i18n('tokenActionHud.features')

        const activeTitle = this.i18n('tokenActionHud.active')
        const legendaryTitle = this.i18n('tokenActionHud.dnd5e.legendary')
        const lairTitle = this.i18n('tokenActionHud.dnd5e.lair')
        this._combineSubcategoryWithCategory(result, activeTitle, active)
        this._combineSubcategoryWithCategory(result, legendaryTitle, legendary)
        this._combineSubcategoryWithCategory(result, lairTitle, lair)

        if (!settings.get('ignorePassiveFeats')) {
            const passiveTitle = this.i18n('tokenActionHud.passive')
            this._combineSubcategoryWithCategory(result, passiveTitle, passive)
        }

        return result
    }

    /** @private */
    _buildSkillsCategory (token) {
        const actor = token.actor
        if (actor.type === 'vehicle') return

        const skills = actor.system.skills

        const result = this.initializeEmptyCategory('skills')
        result.name = this.i18n('tokenActionHud.skills')
        const actionType = 'skill'

        const abbr = settings.get('abbreviateSkills')

        const skillsActions = Object.entries(skills)
            .map((e) => {
                try {
                    const skillId = e[0]
                    const skillset = (actor.type !== 'starship') ? game.sw5e.config.skills : game.sw5e.config.starshipSkills
                    let name = abbr ? skillId : skillset[skillId]
                    name = name.charAt(0).toUpperCase() + name.slice(1)
                    const encodedValue = [actionType, token.id, e[0]].join(this.delimiter)
                    const icon = this._getProficiencyIcon(skills[skillId].value)
                    return {
                        name,
                        id: e[0],
                        encodedValue,
                        icon
                    }
                } catch (error) {
                    Logger.error(e)
                    return null
                }
            })
            .filter((s) => !!s)
        const skillsCategory = this.initializeEmptySubcategory()
        skillsCategory.actions = skillsActions

        const skillsTitle = this.i18n('tokenActionHud.skills')
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory)

        return result
    }

    _addMultiSkills (list, tokenId) {
        const result = this.initializeEmptyCategory('skills')
        const actionType = 'skill'

        const abbr = settings.get('abbreviateSkills')

        const skillsActions = Object.entries(game.sw5e.config.skills).map((e) => {
            let name = abbr ? e[0] : e[1]
            name = name.charAt(0).toUpperCase() + name.slice(1)
            const encodedValue = [actionType, tokenId, e[0]].join(this.delimiter)
            return { name, id: e[0], encodedValue }
        })
        const skillsCategory = this.initializeEmptySubcategory()
        skillsCategory.actions = skillsActions

        const skillsTitle = this.i18n('tokenActionHud.skills')
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory)
        this._combineCategoryWithList(list, skillsTitle, result, true)
    }

    _addMultiStarshipSkills (list, tokenId) {
        const result = this.initializeEmptyCategory('skills')
        const actionType = 'skill'

        const abbr = settings.get('abbreviateSkills')

        const skillsActions = Object.entries(game.sw5e.config.starshipSkills).map((e) => {
            let name = abbr ? e[0] : e[1]
            name = name.charAt(0).toUpperCase() + name.slice(1)
            const encodedValue = [actionType, tokenId, e[0]].join(this.delimiter)
            return { name, id: e[0], encodedValue }
        })
        const skillsCategory = this.initializeEmptySubcategory()
        skillsCategory.actions = skillsActions

        const skillsTitle = this.i18n('tokenActionHud.skills')
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory)
        this._combineCategoryWithList(list, skillsTitle, result, true)
    }

    /** @private */
    _getAbilityList (tokenId, abilities, categoryId, categoryName, actionType) {
        const result = this.initializeEmptyCategory(categoryId)
        result.name = categoryName

        const abbr = settings.get('abbreviateSkills')

        const actions = Object.entries(game.sw5e.config.abilities).map((e) => {
            if (abilities[e[0]].value === 0) return

            let name = abbr ? e[0] : e[1]
            name = name.charAt(0).toUpperCase() + name.slice(1)
            const encodedValue = [actionType, tokenId, e[0]].join(this.delimiter)
            let icon
            if (categoryId === 'checks') icon = ''
            else icon = this._getProficiencyIcon(abilities[e[0]].proficient)

            return { name, id: e[0], encodedValue, icon }
        })
        const abilityCategory = this.initializeEmptySubcategory()
        abilityCategory.actions = actions.filter((a) => !!a)

        this._combineSubcategoryWithCategory(result, categoryName, abilityCategory)

        return result
    }

    _addMultiAbilities (list, tokenId, categoryId, categoryName, actionType) {
        const cat = this.initializeEmptyCategory(categoryId)

        const abbr = settings.get('abbreviateSkills')

        const actions = Object.entries(game.sw5e.config.abilities).map((e) => {
            let name = abbr ? e[0] : e[1]
            name = name.charAt(0).toUpperCase() + name.slice(1)
            const encodedValue = [actionType, tokenId, e[0]].join(this.delimiter)

            return { name, id: e[0], encodedValue }
        })
        const abilityCategory = this.initializeEmptySubcategory()
        abilityCategory.actions = actions

        this._combineSubcategoryWithCategory(cat, categoryName, abilityCategory)
        this._combineCategoryWithList(list, categoryName, cat, true)
    }

    /** @private */
    _buildUtilityCategory (token) {
        const actor = token.actor

        const result = this.initializeEmptyCategory('utility')
        result.name = this.i18n('tokenActionHud.utility')
        const actionType = 'utility'

        const rests = this.initializeEmptySubcategory()
        const repairs = this.initializeEmptySubcategory()
        const utility = this.initializeEmptySubcategory()

        this._addCombatSubcategory(actionType, result, token.id)

        if (actor.type === 'character') {
            const shortRestValue = [actionType, token.id, 'shortRest'].join(
                this.delimiter
            )
            rests.actions.push({
                id: 'shortRest',
                encodedValue: shortRestValue,
                name: this.i18n('tokenActionHud.shortRest')
            })
            const longRestValue = [actionType, token.id, 'longRest'].join(
                this.delimiter
            )
            rests.actions.push({
                id: 'longRest',
                encodedValue: longRestValue,
                name: this.i18n('tokenActionHud.longRest')
            })

            if (actor.system.attributes.hp.value <= 0) {
                const deathSaveValue = [actionType, token.id, 'deathSave'].join(
                    this.delimiter
                )
                const deathSaveAction = {
                    id: 'deathSave',
                    encodedValue: deathSaveValue,
                    name: this.i18n('tokenActionHud.sw5e.deathSave')
                }
                utility.actions.push(deathSaveAction)
            }

            const inspirationValue = [actionType, token.id, 'inspiration'].join(
                this.delimiter
            )
            const inspirationAction = {
                id: 'inspiration',
                encodedValue: inspirationValue,
                name: this.i18n('tokenActionHud.inspiration')
            }
            inspirationAction.cssClass = actor.system.attributes?.inspiration
                ? 'active'
                : ''
            utility.actions.push(inspirationAction)
        }

        if (actor.type === 'starship') {
            const rechargeRepairValue = [actionType, token.id, 'rechargeRepair'].join(
                this.delimiter
            )
            repairs.actions.push({
                id: 'rechargeRepair',
                encodedValue: rechargeRepairValue,
                name: this.i18n('tokenActionHud.rechargeRepair')
            })
            const refittingRepairValue = [actionType, token.id, 'refittingRepair'].join(
                this.delimiter
            )
            repairs.actions.push({
                id: 'refittingRepair',
                encodedValue: refittingRepairValue,
                name: this.i18n('tokenActionHud.refittingRepair')
            })
            const regenRepairValue = [actionType, token.id, 'regenRepair'].join(
                this.delimiter
            )
            repairs.actions.push({
                id: 'regenRepair',
                encodedValue: regenRepairValue,
                name: this.i18n('tokenActionHud.regenRepair')
            })

            if (actor.system.attributes.hp.value <= 0) {
                const destructionSaveValue = [actionType, token.id, 'destructionSave'].join(
                    this.delimiter
                )
                const destructionSaveAction = {
                    id: 'destructionSave',
                    encodedValue: destructionSaveValue,
                    name: this.i18n('tokenActionHud.sw5e.destructionSave')
                }
                utility.actions.push(destructionSaveAction)
            }
        }

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.rests'),
            rests
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.repairs'),
            repairs
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.utility'),
            utility
        )

        return result
    }

    /** @private */
    _buildEffectsCategory (token) {
        const result = this.initializeEmptyCategory('effects')
        result.name = this.i18n('tokenActionHud.effects')
        this._addEffectsSubcategories(token.actor, token.id, result)
        return result
    }

    /** @private */
    _buildConditionsCategory (token) {
        if (!settings.get('showConditionsCategory')) return
        const result = this.initializeEmptyCategory('conditions')
        result.name = this.i18n('tokenActionHud.conditions')
        this._addConditionsSubcategory(token.actor, token.id, result)
        return result
    }

    /** @private */
    _addEffectsSubcategories (actor, tokenId, category) {
        const actionType = 'effect'

        const effects =
      'find' in actor.effects.entries ? actor.effects.entries : actor.effects

        const tempCategory = this.initializeEmptySubcategory()
        const passiveCategory = this.initializeEmptySubcategory()

        effects.forEach((e) => {
            const name = e.label
            const encodedValue = [actionType, tokenId, e.id].join(this.delimiter)
            const cssClass = e.disabled ? '' : 'active'
            const image = e.icon
            const action = {
                name,
                id: e.id,
                encodedValue,
                img: image,
                cssClass
            }

            e.isTemporary
                ? tempCategory.actions.push(action)
                : passiveCategory.actions.push(action)
        })

        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.temporary'),
            tempCategory
        )
        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.passive'),
            passiveCategory
        )
    }

    /** @private */
    _addMultiConditions (list, tokenId) {
        const category = this.initializeEmptyCategory('conditions')
        const actionType = 'condition'

        const availableConditions = CONFIG.statusEffects.filter(
            (condition) => condition.id !== ''
        )
        const actors = canvas.tokens.controlled
            .filter((t) => !!t.actor)
            .map((t) => t.actor)

        if (!availableConditions) return

        const conditions = this.initializeEmptySubcategory()

        availableConditions.forEach((c) => {
            const name = this.i18n(c.label)
            const encodedValue = [actionType, tokenId, c.id].join(this.delimiter)
            const cssClass = actors.every((actor) => {
                const effects =
          'some' in actor.effects.entries
              ? actor.effects.entries
              : actor.effects
                effects.some((e) => e.flags.core?.statusId === c.id)
            })
                ? 'active'
                : ''
            const image = c.icon
            const action = {
                name,
                id: c.id,
                encodedValue,
                img: image,
                cssClass
            }

            conditions.actions.push(action)
        })

        const conName = this.i18n('tokenActionHud.conditions')
        this._combineSubcategoryWithCategory(category, conName, conditions)
        this._combineCategoryWithList(list, conName, category)
    }

    /** @private */
    _addConditionsSubcategory (actor, tokenId, category) {
        const actionType = 'condition'

        const availableConditions = CONFIG.statusEffects.filter(
            (condition) => condition.id !== ''
        )

        if (!availableConditions) return

        const conditions = this.initializeEmptySubcategory()

        availableConditions.forEach((c) => {
            const name = this.i18n(c.label)
            const encodedValue = [actionType, tokenId, c.id].join(this.delimiter)
            const effects =
        'some' in actor.effects.entries ? actor.effects.entries : actor.effects
            const cssClass = effects.some((e) => e.flags.core?.statusId === c.id)
                ? 'active'
                : ''
            const image = c.icon
            const action = {
                name,
                id: c.id,
                encodedValue,
                img: image,
                cssClass
            }

            conditions.actions.push(action)
        })

        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.conditions'),
            conditions
        )
    }

    /** @private */
    _addCombatSubcategory (actionType, category, tokenId) {
        const combatSubcategory = this.initializeEmptySubcategory()

        // Roll Initiative
        const combat = game.combat
        let combatant, currentInitiative
        if (combat) {
            combatant = combat.combatants.find((c) => c.tokenId === tokenId)
            currentInitiative = combatant?.initiative
        }
        const initiativeValue = [actionType, tokenId, 'initiative'].join(this.delimiter)
        const initiativeAction = {
            id: 'rollInitiative',
            encodedValue: initiativeValue,
            name: this.i18n('tokenActionHud.rollInitiative')
        }

        if (currentInitiative) initiativeAction.info1 = currentInitiative
        initiativeAction.cssClass = currentInitiative ? 'active' : ''

        combatSubcategory.actions.push(initiativeAction)

        // End Turn
        if (game.combat?.current?.tokenId === tokenId) {
            const endTurnValue = [actionType, tokenId, 'endTurn'].join(this.delimiter)
            const endTurnAction = {
                id: 'endTurn',
                encodedValue: endTurnValue,
                name: this.i18n('tokenActionHud.endTurn')
            }

            combatSubcategory.actions.push(endTurnAction)
        }

        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.combat'),
            combatSubcategory
        )
    }

    /** @private */
    _addMultiCombatSubcategory (actionType, tokenId, category) {
        const combatSubcategory = this.initializeEmptySubcategory()

        // Roll Initiative
        const combat = game.combat
        const initiativeValue = [actionType, tokenId, 'initiative'].join(this.delimiter)
        const initiativeAction = {
            id: 'rollInitiative',
            encodedValue: initiativeValue,
            name: this.i18n('tokenActionHud.rollInitiative')
        }
        let isActive
        if (combat) {
            const tokenIds = canvas.tokens.controlled.map((t) => t.id)
            const tokenCombatants = tokenIds.map((id) =>
                combat.combatants.find((c) => c.tokenId === id)
            )
            isActive = tokenCombatants.every((c) => !!c?.initiative)
        }
        initiativeAction.cssClass = isActive ? 'active' : ''
        combatSubcategory.actions.push(initiativeAction)

        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.combat'),
            combatSubcategory
        )
    }

    /** @private */
    _addMultiTokenUtilities (list, tokenId, actors) {
        const category = this.initializeEmptyCategory('utility')
        const actionType = 'utility'

        this._addMultiCombatSubcategory(actionType, tokenId, category)

        const rests = this.initializeEmptySubcategory()
        const repairs = this.initializeEmptySubcategory()
        const utility = this.initializeEmptySubcategory()

        if (actors.every((a) => a.type === 'character')) {
            const shortRestValue = [actionType, tokenId, 'shortRest'].join(
                this.delimiter
            )
            rests.actions.push({
                id: 'shortRest',
                encodedValue: shortRestValue,
                name: this.i18n('tokenActionHud.shortRest')
            })
            const longRestValue = [actionType, tokenId, 'longRest'].join(this.delimiter)
            rests.actions.push({
                id: 'longRest',
                encodedValue: longRestValue,
                name: this.i18n('tokenActionHud.longRest')
            })

            const inspirationValue = [actionType, tokenId, 'inspiration'].join(
                this.delimiter
            )
            const inspirationAction = {
                id: 'inspiration',
                encodedValue: inspirationValue,
                name: this.i18n('tokenActionHud.inspiration')
            }
            inspirationAction.cssClass = actors.every(
                (a) => a.system.attributes?.inspiration
            )
                ? 'active'
                : ''
            utility.actions.push(inspirationAction)
        }

        if (actors.every((a) => a.type === 'starship')) {
            const rechargeRepairValue = [actionType, tokenId, 'rechargeRepair'].join(
                this.delimiter
            )
            repairs.actions.push({
                id: 'rechargeRepair',
                encodedValue: rechargeRepairValue,
                name: this.i18n('tokenActionHud.rechargeRepair')
            })
            const refittingRepairValue = [actionType, tokenId, 'refittingRepair'].join(this.delimiter)
            repairs.actions.push({
                id: 'refittingRepair',
                encodedValue: refittingRepairValue,
                name: this.i18n('tokenActionHud.refittingRepair')
            })
            const regenRepairValue = [actionType, tokenId, 'regenRepair'].join(this.delimiter)
            repairs.actions.push({
                id: 'regenRepair',
                encodedValue: regenRepairValue,
                name: this.i18n('tokenActionHud.regenRepair')
            })
        }

        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.rests'),
            rests
        )
        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.repairs'),
            repairs
        )
        this._combineSubcategoryWithCategory(
            category,
            this.i18n('tokenActionHud.utility'),
            utility
        )
        this._combineCategoryWithList(
            list,
            this.i18n('tokenActionHud.utility'),
            category
        )
    }

    /** @private */
    _buildEquipmentItem (tokenId, actor, actionType, item) {
        const action = this._buildItem(tokenId, actor, actionType, item)
        this._addItemInfo(actor, item, action)
        return action
    }

    /** @private */
    _buildItem (tokenId, actor, actionType, item) {
        const itemId = item.id
        const encodedValue = [actionType, tokenId, actionId].join(this.delimiter)
        const img = this.getImage(item)
        const icon = this._getActionIcon(item.system.activation?.type)
        const result = {
            name: item.name,
            id: itemId,
            encodedValue,
            img,
            icon
        }

        if (
            item.system.recharge &&
      !item.system.recharge.charged &&
      item.system.recharge.value
        ) {
            result.name += ` (${this.i18n('tokenActionHud.recharge')})`
        }

        return result
    }

    /** @private */
    _addItemInfo (actor, item, action) {
        action.info1 = this._getQuantityData(item)

        action.info2 = this._getUsesData(item)

        action.info3 = this._getConsumeData(item, actor)
    }

    /** @private */
    _getQuantityData (item) {
        let result = ''
        const quantity = item.system.quantity
        if (quantity > 1) {
            result = quantity
        }

        return result
    }

    /** @private */
    _getUsesData (item) {
        let result = ''

        const uses = item.system.uses
        if (!uses) return result

        result = uses.value === 0 && uses.max ? '0' : uses.value

        if (uses.max > 0) {
            result += `/${uses.max}`
        }

        return result
    }

    /** @private */
    _getConsumeData (item, actor) {
        let result = ''

        const consumeType = item.system.consume?.type
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

    /** @private */
    _filterLongerActions (items) {
        let result

        if (settings.get('hideLongerActions')) {
            result = items.filter((i) => {
                return (
                    !i.system.activation ||
          !(
              i.system.activation.type === 'minute' ||
            i.system.activation.type === 'hour' ||
            i.system.activation.type === 'day'
          )
                )
            })
        }

        return result || items
    }

    /** @private */
    _filterNonpreparedPowers (powers) {
        const nonpreparablePowers = Object.keys(
            game.sw5e.config.powerPreparationModes
        ).filter((p) => p !== 'prepared')
        let result = powers

        if (settings.get('showAllNonpreparablePowers')) {
            result = powers.filter((i) => {
                return (
                    i.system.preparation.prepared ||
          nonpreparablePowers.includes(i.system.preparation.mode) ||
          i.system.level === 0
                )
            })
        } else {
            result = powers.filter(
                (i) => this.system.preparation.prepared
            )
        }

        return result
    }

    _filterExpendedItems (items) {
        if (settings.get('showEmptyItems')) return items

        return items.filter((i) => {
            const uses = i.system.uses
            // Assume something with no uses is unlimited in its use.
            if (!uses) return true

            // if it has a max but value is 0, don't return.
            if (uses.max > 0 && !uses.value) return false

            return true
        })
    }

    /** @private */
    _getProficiencyIcon (level) {
        const icons = {
            0: '',
            0.5: '<i class="fas fa-adjust"></i>',
            1: '<i class="fas fa-check"></i>',
            2: '<i class="fas fa-check-double"></i>'
        }
        return icons[level]
    }

    _getActionIcon (action) {
        const img = {
            // action: `<i class="fas fa-fist-raised"></i>`,
            bonus: '<i class="fas fa-plus"></i>',
            crew: '<i class="fas fa-users"></i>',
            legendary: '<i class="fas fa-dragon"></i>',
            reaction: '<i class="fas fa-bolt"></i>',
            // none: `<i class="far fa-circle"></i>`,
            special: '<i class="fas fa-star"></i>',
            lair: '<i class="fas fa-home"></i>',
            minute: '<i class="fas fa-hourglass-start"></i>',
            hour: '<i class="fas fa-hourglass-half"></i>',
            day: '<i class="fas fa-hourglass-end"></i>'
        }
        return img[action]
    }
}
