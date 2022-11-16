import { ActionHandler } from '../../core/actions/actionHandler.js'
import * as settings from '../../core/settings.js'

export class ActionHandlerD35E extends ActionHandler {
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
     */
    _buildSingleTokenActions (actionList, character, subcategoryIds) {
        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'consumables' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'inconsumables' ||
            subcategoryId === 'other' ||
            subcategoryId === 'tools' ||
            subcategoryId === 'weapons'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attacks')) {
            this._buildAttacks(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'buffs')) {
            this._buildBuffs(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'checks')) {
            this._buildChecks(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'defenses')) {
            this._buildDefenses(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'features')) {
            this._buildFeatures(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'saves')) {
            this._buildSaves(actionList, character)
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
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'saves')) {
            this._buildSaves(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildMultipleTokenSkills(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'utility')) {
            this._buildUtility(actionList, character)
        }
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
        const actionType = 'attack'
        const subcategoryId = 'attacks'

        const actions = []

        // Grapple
        const cmbActionType = 'cmb'
        const cmbId = 'cmb'
        const cmbName = this.i18n('tokenActionHud.d35e.grapple')
        const cmbEncodedValue = [cmbActionType, actorId, tokenId, cmbId].join(
            this.delimiter
        )
        const cmbAction = {
            id: cmbId,
            name: cmbName,
            encodedValue: cmbEncodedValue,
            selected: true
        }
        actions.push(cmbAction)

        // Attacks
        let attacks = actor.items.filter((item) =>
            item.type === 'attack' || item.type === 'full-attack'
        )
        attacks = this.sortItems(attacks)
        const attackActions = attacks.map((attack) =>
            this._getAction(actionType, character, attack)
        )
        actions.push(attackActions)

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Buffs
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildBuffs (actionList, character) {
        const actor = character?.actor
        const actionType = 'buff'
        const subcategoryId = 'buffs'

        let buffs = actor.items.filter((item) => item.type === 'buff')
        buffs = this.sortItems(buffs)
        const actions = buffs.map((buff) => {
            const action = this._getAction(character, actionType, buff)
            const active = buff.system.active ? ' active' : ''
            action.cssClass = `toggle${active}`
            return action
        })
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Checks
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildChecks (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'abilityCheck'
        const subcategoryId = 'checks'
        const abbr = settings.get('abbreviateSkills')

        const actions = Object.entries(CONFIG.D35E.abilities)
            .filter((ability) => ability[ability[0]].value !== 0)
            .map((ability) => {
                const id = ability[0]
                const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
                const name = abbr ? abbreviatedName : ability[1]
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
     * Build Defenses
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildDefenses (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'defenses'
        const subcategoryId = 'defenses'

        const id = 'defenses'
        const name = this.i18n('tokenActionHud.defenses')
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
        const actions = [
            {
                id,
                name,
                encodedValue,
                selected: true
            }
        ]
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Features
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildFeatures (actionList, character) {
        const actor = character?.actor
        const actionType = 'feat'
        const parentSubcategoryId = 'features'
        const subcategoryList = []

        const featureTypes = {
            active: { id: 'active', name: this.i18n('tokenActionHud.active'), feats: [] },
            passive: { id: 'passive', name: this.i18n('tokenActionHud.passive'), feats: [] }
        }

        let feats = actor.items.filter((item) => item.type === 'feat')
        feats = this.sortItems(feats)
        feats.forEach((feat) => {
            const activationType = feat.system.activation.type
            if (
                !activationType ||
                activationType === '' ||
                activationType === 'passive'
            ) {
                featureTypes.passive.items.push(feat)
            } else {
                featureTypes.active.items.push(feat)
            }
        })
        if (settings.get('ignorePassiveFeats')) { delete featureTypes.passive }

        Object.values(featureTypes).forEach((featureType) => {
            const subcategoryId = featureType.id
            const subcategoryName = featureType.name
            const subcategory = this.initializeEmptySubcategory(
                subcategoryId,
                parentSubcategoryId,
                subcategoryName,
                'system'
            )
            const actions = featureTypes.feats.map((feat) =>
                this._getAction(actionType, character, feat)
            )
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

        let items = actor.items.filter((item) => item.system.quantity > 0)
        items = this.sortItems(items)
        const equippedItems = items.filter((item) =>
            item.type !== 'consumable' && item.system.equipped
        )

        // Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'equipment')) {
            const equipment = equippedItems.filter((item) =>
                item.type === 'equipment'
            )
            this._buildItems(actionList, character, equipment, 'equipment')
        }

        // Other
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'other')) {
            const other = equippedItems.filter((item) =>
                item.type !== 'weapon' &&
                item.type !== 'equipment'
            )
            this._buildItems(actionList, character, other, 'other')
        }

        // Consumables / Inconsumables
        if (inventorySubcategoryIds.some((subcategoryId) =>
            subcategoryId === 'consumables' ||
            subcategoryId === 'inconsumables'
        )) {
            const consumableItems = items.filter((item) => item.type === 'consumable')

            // Consumables
            if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'consumables')) {
                let consumables = this._filterExpendedItems(consumableItems)
                consumables = consumables.filter((consumable) =>
                    (consumable.system.uses?.value && consumable.system.uses?.value >= 0) ||
                    (consumable.system.uses?.max && consumable.system.uses?.max >= 0)
                )
                this._buildItems(actionList, character, consumables, 'consumables')
            }

            // Inconsumables
            if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'inconsumables')) {
                const inconsumables = consumableItems.filter((consumable) =>
                    !(consumable.system.uses?.max || consumable.system.uses?.value) &&
                    consumable.system.consumableType !== 'ammo'
                )
                this._buildItems(actionList, character, inconsumables, 'inconsumables')
            }
        }

        // TOOLS
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'tools')) {
            const tools = items.filter((item) => item.type === 'tool')
            this._buildItems(actionList, character, tools, 'tools')
        }

        // Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = equippedItems.filter((item) => item.type === 'weapon')
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
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'abilitySave'
        const subcategoryId = 'saves'
        const abbr = settings.get('abbreviateSkills')

        const actions = Object.entries(CONFIG.D35E.savingThrows)
            .map((savingThrow) => {
                const id = savingThrow[0]
                const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
                const name = abbr ? abbreviatedName : savingThrow[1]
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            })
            .filter((a) => !!a)
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
        const abbr = settings.get('abbreviateSkills')

        const skills = actor.system.skills
        const allSkills = Object.entries(skills)
            .filter((skill) => !skill[1].rt || skill[1].rank || skill[1].subSkills)
            .map((skill) => {
                const skillClone = structuredClone(skill)
                if (skill[0].startsWith('skill')) { skillClone[1].isCustomSkill = true }
                if (!skill[1].subSkills) return skillClone

                const subSkills = Object.entries(skillClone[1].subSkills)
                    .filter((subSkill) => !subSkill[1].rt || subSkill[1].rank)
                    .map((subSkill) => {
                        subSkill[1].isCustomSkill = true
                        subSkill[1].mainSkill = skillClone[0]
                        subSkill[1].name =
                        `${CONFIG.D35E.skills[skillClone[0]]} - ${subSkill[1].name}`
                        return subSkill
                    })
                return subSkills
            })
        const actions = Object.entries(allSkills)
            .map((skill) => {
                let id = skill[0]
                const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
                let name = abbr ? abbreviatedName : CONFIG.D35E.skills[id]
                const data = skill[1]

                if (data.isCustomSkill || !name) {
                    id = `${data.mainSkill}.subSkills.${id}`
                    name = data.name ?? '?'
                }
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                const info1 = this._getSkillRankInfo(data.rank)
                const info2 = [data.rt ? 'RT' : '', data.acp ? 'ACP' : '']
                    .filter((a) => a !== '')
                    .join(',')
                return {
                    id,
                    name,
                    encodedValue,
                    info1,
                    info2,
                    selected: true
                }
            })
            .sort((a, b) => {
                if (a.name > b.name) {
                    return 1
                }
                if (a.name < b.name) {
                    return -1
                }
                // a must be equal to b
                return 0
            })
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Get Skill Rank Info
     * @private
     * @param {*} rank
     * @returns {string}
     */
    _getSkillRankInfo (rank) {
        if (rank <= 0) return ''
        return `R${rank}`
    }

    /**
     * Build Spells
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSpells (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'spell'
        const parentSubcategoryId = 'spells'
        const subcategoryList = []

        let spells = actor.items.filter((item) => item.type === 'spell')
        spells = this._filterExpendedItems(spells)

        // Get Spellbooks
        const spellbooks = [
            ...new Set(spells.map((spell) => spell.system.spellbook))
        ].sort()

        // Create Concentration Subcategory
        const concentrationSubcategoryId = 'concentration'
        const concentrationSubcategoryName = this.i18n('tokenActionHud.d35e.concentration')
        const concentrationSubcategory = this.initializeEmptySubcategory(
            concentrationSubcategoryId,
            parentSubcategoryId,
            concentrationSubcategoryName,
            'system'
        )

        // Build Concentration Actions
        const concentrationActions = []
        const concentrationActionType = 'concentration'
        spellbooks.forEach((spellbook) => {
            const id = spellbook
            const name = spellbook.charAt(0).toUpperCase() + spellbook.slice(1)
            const encodedValue = [concentrationActionType, actorId, tokenId, id].join(this.delimiter)
            const concentrationAction = {
                id,
                name,
                encodedValue,
                selected: true
            }
            concentrationActions.push(concentrationAction)
        })

        this.addToSubcategoriesList(
            subcategoryList,
            concentrationSubcategoryId,
            concentrationSubcategory,
            concentrationActions
        )

        // Build Spells
        spellbooks.forEach((spellbook) => {
            const spellbookName = spellbook.charAt(0).toUpperCase() + spellbook.slice(1)
            const spellbookSpells = spells
                .filter((spell) => spell.system.spellbook === spellbook)
                .sort((a, b) => {
                    const aName = a.name.toUpperCase()
                    const bName = b.name.toUpperCase()
                    return aName.localeCompare(bName, undefined, { sensitivity: 'base' })
                }
                )
                .sort((a, b) => a.system.level - b.system.level)

            const spellsByLevel = spellbookSpells.reduce((arr, spellbookSpell) => {
                if (!Object.hasOwn(arr, spellbookSpell.system.level)) {
                    arr[spellbookSpell.system.level] = []
                }
                arr[spellbookSpell.system.level].push(spellbookSpell)

                return arr
            }, {})

            let firstLevelOfBook = true

            Object.entries(spellsByLevel).forEach((spellLevel) => {
                // Create Subcategory
                const subcategoryId = `spells_${spellLevel[0]}`
                let subcategoryName = (spellLevel[0] > 0)
                    ? `${this.i18n('tokenActionHud.level')} ${spellLevel[0]}`
                    : this.i18n('tokenActionHud.cantrips')

                // Add spellbook name to first level
                if (firstLevelOfBook) {
                    subcategoryName = `${spellbookName} - ${subcategoryName}`
                    firstLevelOfBook = false
                }

                const subcategory = this.initializeEmptySubcategory(
                    subcategoryId,
                    parentSubcategoryId,
                    subcategoryName,
                    'system'
                )
                subcategory.info1 = this._getSpellSlot(actor, spellbook, spellLevel)

                // Build Actions
                const actions = spellLevel[1]
                    .filter((spell) => this._isSpellCastable(actor, spell))
                    .map((spell) => {
                        const id = spell.id
                        const name = spell.name.charAt(0).toUpperCase() + spell.name.slice(1)
                        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                        const img = this.getImage(spell)
                        const spellInfo = this._getSpellInfo(spell)
                        const info1 = spellInfo.info1
                        const info2 = spellInfo.info2
                        const info3 = spellInfo.info3
                        return {
                            id,
                            name,
                            encodedValue,
                            img,
                            info1,
                            info2,
                            info3,
                            selected: true
                        }
                    })

                this.addToSubcategoriesList(
                    subcategoryList,
                    subcategoryId,
                    subcategory,
                    actions
                )
            })
        })
        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
    }

    /**
     * Get Spell Slot
     * @private
     * @param {object} actor
     * @param {object} spellbook
     * @param {object} spellLevel
     * @returns {string}
     */
    _getSpellSlot (actor, spellbook, spellLevel) {
        const spellInfo = actor.system.attributes?.spells?.spellbooks[spellbook].spells['spell' + spellLevel[0]]
        if (spellInfo && spellInfo.max > 0) {
            return `${spellInfo.value ? spellInfo.value + '/' : ''}${spellInfo.max}`
        }
    }

    /**
     * Get Spell Info
     * @private
     * @param {object} spell
     * @returns {object}
     */
    _getSpellInfo (actor, spellbook, spell) {
        const isSpontaneous = actor.system.attributes.spells.spellbooks[spellbook].spontaneous
        const components = spell.system.components
        const spellInfo = { info1: '', info2: '', info3: '' }
        if (!isSpontaneous && spell.system.preparation) {
            const prep = spell.system.preparation
            if (prep.maxAmount || prep.preparedAmount) {
                spellInfo.info1 = `${prep.preparedAmount}/${prep.maxAmount}`
            }
        }
        if (components?.verbal) {
            spellInfo.info2 += this.i18n('D35E.SpellComponentVerbal').charAt(0).toUpperCase()
        }
        if (components?.somatic) {
            spellInfo.info2 += this.i18n('D35E.SpellComponentSomatic').charAt(0).toUpperCase()
        }
        if (components?.material) {
            spellInfo.info2 += this.i18n('D35E.SpellComponentMaterial').charAt(0).toUpperCase()
        }
        if (components?.focus) {
            spellInfo.info3 = this.i18n('D35E.SpellComponentFocus').charAt(0).toUpperCase()
        }
        return spellInfo
    }

    /**
     * Is Spell Castable
     * @param {object} actor
     * @param {object} spell
     * @returns {boolean}
     */
    _isSpellCastable (actor, spell) {
        const spellbook = spell.system.spellbook
        const isSpontaneous = actor.system.attributes.spells.spellbooks[spellbook].spontaneous
        if (spell.system.atWill) return true
        if (isSpontaneous) return true
        if (spell.system.preparation.preparedAmount === 0) return false
        return true
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
        let isEachControlledTokenCharacter = false
        if (actorId === 'multi') {
            isEachControlledTokenCharacter = canvas.tokens.controlled
                .map((token) => token.actor)
                .every((actor) => actor.type === 'character')
        }
        if (actor.type !== 'character' && !isEachControlledTokenCharacter) return
        const actionType = 'utility'
        const subcategoryId = 'rests'
        const id = 'rest'
        const name = this.i18n('tokenActionHud.rest')
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
        const actions = {
            id,
            name,
            encodedValue,
            selected: true
        }
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Multiple Token Skills
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildMultipleTokenSkills (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const subcategoryId = 'skills'
        const abbr = settings.get('abbreviateSkills')

        const skills = Object.entries(CONFIG.D35E.skills)
        const actions = skills.map((skill) => {
            const id = skill[0]
            const abbreviatedName = id.charAt(0).toUpperCase() + id.slice(1)
            const name = abbr ? abbreviatedName : skill[1]
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
        const actions = items.map((item) => this._getAction(actionType, character, item))
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
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const id = entity.id
        const recharge = (entity?.system?.recharge &&
            !entity?.system?.recharge?.charged &&
            entity?.system?.recharge?.value)
            ? ` (${this.i18n('tokenActionHud.recharge')})`
            : ''
        const name = `${this._getItemName(entity)}${recharge}`
        const encodedValue = [actionType, actorId, tokenId, id].join(
            this.delimiter
        )
        const img = this.getImage(entity)
        const icon = this._getActionIcon(entity?.data?.activation?.type)
        const info1 = this._getQuantityData(entity)
        const info2 = this._getUsesData(entity)
        const info3 = this._getConsumeData(entity, actor)
        const action = {
            id,
            name,
            encodedValue,
            icon,
            img,
            info1,
            info2,
            info3,
            selected: true
        }

        return action
    }

    /**
     * Get Item Name
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getItemName (item) {
        let name
        if (item.system.identified || game.user.isGM) {
            name = item.system.identifiedName
        } else {
            name = item.system.unidentified?.name
        }
        if (!name) name = item.cmbName
        return name
    }

    /**
     * Get Quantity
     * @param {object} item
     * @returns {number}
     */
    _getQuantityData (item) {
        return (item.system.quantity > 1) ? item.system.quantity : ''
    }

    /**
     * Get Uses
     * @param {object} item
     * @returns {number}
     */
    _getUsesData (item) {
        let result = ''

        const uses = item.system.uses
        if (!uses) return result

        if (!(uses.max || uses.value)) return result

        result = uses.value ?? 0

        if (uses.max > 0) {
            result += `/${uses.max}`
        }

        return result
    }

    /**
     * Get Consume
     * @param {object} item
     * @param {object} actor
     * @returns {number}
     */
    _getConsumeData (item, actor) {
        let result = ''

        const consumeType = item.system.consume?.type
        if (consumeType && consumeType !== '') {
            const consumeId = item.system.consume.target
            const parentId = consumeId.substr(0, consumeId.lastIndexOf('.'))
            if (consumeType === 'attribute') {
                const target = getProperty(actor, `system.${consumeId}`)

                if (target) {
                    const parent = getProperty(actor, `system.${parentId}`)
                    result = target
                    if (parent.max) result += `/${parent.max}`
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
     * Filter Expended Items
     * @private
     * @param {object} items
     * @returns {object}
     */
    _filterExpendedItems (items) {
        if (settings.get('showEmptyItems')) return items

        return items.filter((item) => {
            const uses = item.system.uses
            // Assume something with no uses is unlimited in its use.
            if (!uses) return true

            // if it has a max but value is 0, don't return.
            if (uses.max > 0 && !uses.value) return false

            return true
        })
    }

    /**
     * Get Proficiency Icon
     * @param {number} level
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
     * Get Action Icon
     * @param {string} action
     * @returns {string}
     */
    _getActionIcon (action) {
        const img = {
            // standard: `<i class="fas fa-fist-raised"></i>`,
            immediate: '<i class="fas fa-bolt"></i>',
            swift: '<i class="fas fa-plus"></i>',
            full: '<i class="far fa-circle"></i>',
            round: '<i class="fas fa-hourglass-start"></i>',
            minute: '<i class="fas fa-hourglass-half"></i>',
            hour: '<i class="fas fa-hourglass-end"></i>'
        }
        return img[action]
    }
}
