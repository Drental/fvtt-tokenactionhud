import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerDw extends ActionHandler {
    /** @override */
    async buildSystemActions (actionList, character, subcategoryIds) {
    /** if (settings.get('showGmCompendiums')) {
      result.tokenId = 'gm'
      result.actorId = 'gm'
      await this.addGmCompendiumsToList(result)
    } */
        const actor = character?.actor
        if (actor.type === 'npc') {
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'damage')) {
                this._buildDamage(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'instincts')) {
                this._buildInstincts(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'monsterMoves')) {
                this._buildNpcMoves(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'specialQualities')) {
                this._buildSpecialQualities(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'tags')) {
                this._buildTags(actionList, character)
            }
        }
        if (actor.type === 'character') {
            const moveSubcategoryIds = subcategoryIds.filter((subcategoryId) =>
                subcategoryId === 'advancedMoves' ||
                subcategoryId === 'basicMoves' ||
                subcategoryId === 'specialMoves' ||
                subcategoryId === 'startingMoves'
            )

            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'abilities')) {
                this._buildAbilities(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'damage')) {
                this._buildDamage(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'equipment')) {
                this._buildEquipment(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'instincts')) {
                this._buildInstincts(actionList, character)
            }
            if (moveSubcategoryIds) {
                this._buildMoves(actionList, character, moveSubcategoryIds)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'spells')) {
                this._buildSpells(actionList, character)
            }
        }
        return actionList
    }

    /**
     * Build Abilities
     * @param {object} actionList
     * @param {object} character
     */
    _buildAbilities (actionList, character) {
        const actor = character?.actor
        const actionType = 'ability'
        const subcategoryId = 'abilities'

        const abilities = Object.entries(actor.system.abilities)
        const actions = abilities.map((ability) => {
            const data = { id: ability[0], name: ability[1].label }
            return this._getAction(actionType, character, data)
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Damage
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildDamage (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'damage'
        const subcategoryId = 'damage'
        const id = 'damage'
        const name = this.i18n('DW.Damage')
        const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
        const actions = [{
            id,
            name,
            encodedValue,
            selected: true
        }]

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Equipment
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildEquipment (actionList, character) {
        const actor = character?.actor
        const actionType = 'equipment'
        const subcategoryId = 'equipment'

        // Get equipment
        const equipment = Object.entries(actor.itemTypes.equipment)

        // Get actions
        const actions = equipment.map((equipment) => this._getAction(actionType, character, equipment[1]))

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Instincts
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildInstincts (actionList, character) {
        const actor = character?.actor
        const actionType = 'instinct'
        const subcategoryId = 'instincts'

        const biography = actor.system.details.biography

        const regex = /<p(|s+[^>]*)>(Instinct:.*?)<\/ps*>/g
        const actions = Array.from(biography.matchAll(regex)).map((instinct) => {
            const move = instinct[2]
            const id = encodeURIComponent(move)
            const name = move
            const entity = { id, name }
            return this._getAction(actionType, character, entity)
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Moves by Type
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildMoves (actionList, character, moveSubcategoryIds) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'move'

        const moveTypes = {
            advanced: {
                parentSubcategoryId: 'advancedMoves',
                rollType: {
                    book: { subcategoryId: 'advancedBook', subcategoryName: this.i18n('tokenActionHud.dungeonWorld.book'), moves: [] },
                    roll: { subcategoryId: 'advancedRoll', subcategoryName: this.i18n('DW.Roll'), moves: [] }
                }
            },
            basic: {
                parentSubcategoryId: 'basicMoves',
                rollType: {
                    book: { subcategoryId: 'basicBook', subcategoryName: this.i18n('tokenActionHud.dungeonWorld.book'), moves: [] },
                    roll: { subcategoryId: 'basicRoll', subcategoryName: this.i18n('DW.Roll'), moves: [] }
                }
            },
            special: {
                parentSubcategoryId: 'specialMoves',
                rollType: {
                    book: { subcategoryId: 'specialBook', subcategoryName: this.i18n('tokenActionHud.dungeonWorld.book'), moves: [] },
                    roll: { subcategoryId: 'specialRoll', subcategoryName: this.i18n('DW.Roll'), moves: [] }
                }
            },
            starting: {
                parentSubcategoryId: 'startingMoves',
                rollType: {
                    book: { subcategoryId: 'startingBook', subcategoryName: this.i18n('tokenActionHud.dungeonWorld.book'), moves: [] },
                    roll: { subcategoryId: 'startingRoll', subcategoryName: this.i18n('DW.Roll'), moves: [] }
                }
            }
        }

        // Delete unselected move types
        if (!moveSubcategoryIds.some((subcategoryId) => subcategoryId === 'advancedMoves')) {
            delete moveTypes.advanced
        }
        if (!moveSubcategoryIds.some((subcategoryId) => subcategoryId === 'basicMoves')) {
            delete moveTypes.basic
        }
        if (!moveSubcategoryIds.some((subcategoryId) => subcategoryId === 'specialMoves')) {
            delete moveTypes.special
        }
        if (!moveSubcategoryIds.some((subcategoryId) => subcategoryId === 'startingMoves')) {
            delete moveTypes.starting
        }
        if (moveTypes === {}) return

        // Group moves by type
        const moves = Object.entries(actor.itemTypes.move)
        moves.forEach((move) => {
            const moveType = move[1].system.moveType
            const rollType = (move[1].system.rollType === '') ? 'book' : 'roll'
            if (moveTypes[moveType].rollType[rollType]) {
                moveTypes[moveType].rollType[rollType].moves.push(move[1])
            }
        })

        Object.entries(moveTypes).forEach((moveType) => {
            const parentSubcategoryId = moveType[1].parentSubcategoryId
            const rollTypes = Object.entries(moveType[1].rollType)
            const subcategoryList = []
            rollTypes.forEach(rollType => {
                const subcategoryId = rollType[1].subcategoryId
                const subcategoryName = rollType[1].subcategoryName
                const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName)

                // Get actions
                const actions = rollType[1].moves.map((move) => {
                    const id = move.id
                    const name = move.name
                    const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                    const itemInfo = this._getItemInfo(move)
                    const info1 = itemInfo.info1
                    const info2 = itemInfo.info2
                    return {
                        id,
                        name,
                        encodedValue,
                        info1,
                        info2,
                        selected: true
                    }
                })

                this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
            })

            this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
        })
    }

    /**
     * Build NPC Moves
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildNpcMoves (actionList, character) {
        const actor = character?.actor
        const actionType = 'move'
        const subcategoryId = 'monsterMoves'

        const biography = actor.system.details.biography

        const regex = /<li(|s+[^>]*)>(.*?)<\/lis*>/g
        const actions = Array.from(biography.matchAll(regex)).map((monsterMove) => {
            const move = monsterMove[2]
            const id = encodeURIComponent(move)
            const name = move
            const entity = { id, name }
            return this._getAction(actionType, character, entity)
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Special Qualities
     * @param {object} actionList
     * @param {object} character
     */
    _buildSpecialQualities (actionList, character) {
        const actor = character?.actor
        const actionType = 'quality'
        const subcategoryId = 'specialQualities'

        const qualities = actor.system.attributes.specialQualities.value.split(',')

        const actions = qualities
            .filter((quality) => quality.length !== 0)
            .map((quality) => {
                quality = quality.trim()
                const id = encodeURIComponent(quality)
                const name = quality
                const entity = { id, name }
                return this._getAction(actionType, character, entity)
            })

        this.addActionsToActionList(actionList, actions, subcategoryId)
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
        const parentSubcategoryId = 'spells'
        const subcategoryList = []

        // Get prepared spells
        const spells = actor.itemTypes.spell
            .filter((spell) => spell.system.prepared)
            .sort((a, b) => parseInt(a.system.spellLevel) - parseInt(b.system.spellLevel))

        // Get spells by level
        const spellsByLevel = {}
        spells.forEach((spell) => {
            const spellLevel = spell.system.spellLevel
            const id = (spellLevel === 0) ? 'rotes' : `spell${spellLevel}`
            const name = (spellLevel === 0) ? 'Rotes' : `${this.i18n('tokenActionHud.level')} ${spellLevel}`
            if (!spellsByLevel[id]) {
                spellsByLevel[id] = { id, name, spells: [] }
            }
            spellsByLevel[id].spells.push(spell)
        })

        Object.entries(spellsByLevel).forEach((spellLevel) => {
            const subcategoryId = spellLevel[0]
            const subcategoryName = spellLevel[1].name
            const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName)

            const actions = spellLevel[1].spells.map((spell) => this._getAction(actionType, character, spell))

            this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
    }

    /**
     * Build Tags
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildTags (actionList, character) {
        const actor = character?.actor
        const actionType = 'tag'
        const subcategoryId = 'tags'

        const tags = actor.system.tagsString.split(',')
        const actions = tags
            .filter((tag) => tag.length !== 0)
            .map((tag) => {
                tag = tag.trim()
                const id = encodeURIComponent(tag)
                const name = tag
                const entity = { id, name }
                return this._getAction(actionType, character, entity)
            })

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
        const itemInfo = this._getItemInfo(entity)
        const info1 = itemInfo.info1
        const info2 = itemInfo.info2
        return {
            id,
            name,
            encodedValue,
            info1,
            info2,
            selected: true
        }
    }

    /**
     * Get Item info
     * @param {object} item
     * @returns {object}
     */
    _getItemInfo (item) {
        const itemInfo = { uses: '', quantity: '' }
        itemInfo.info1 = item.system?.uses ?? ''
        const quantity = item.system?.quantity
        itemInfo.info2 = quantity > 1 ? quantity : ''
        return itemInfo
    }
}
