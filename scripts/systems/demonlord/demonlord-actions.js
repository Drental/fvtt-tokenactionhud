import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerDemonlord extends ActionHandler {
    /**
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
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    _buildSingleTokenActions(actionList, character, subcategoryIds) {
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'challenge')) {
            this._buildChallengeRoll(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combat')) {
            this._buildCombat(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'magic')) {
            this._buildMagic(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'rest')) {
            this._buildRest(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'talents')) {
            this._buildTalents(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            this._buildWeapons(actionList, character)
        }

        return actionList
    }

    _buildMultipleTokenActions (actionList, subcategoryIds) {
        const character = { actor: { id: 'multi' }, token: { id: 'multi' } }

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'challenge')) {
            this._buildChallengeRoll(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'rest')) {
            this._buildRest(actionList, character)
        }

        return actionList
    }

    /**
     * Build Challenge Roll
     * @privateobject
     * @param {object} actionList
     * @param {object} character
     */
    _buildChallengeRoll (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actors = (actorId === 'multi') ? this._getActors() : [actor]
        const actionType = 'challenge'
        const subcategoryId = 'challenge'

        const attributes = Object.entries(actor.system.attributes)
        const matchedAttributes = {}
        attributes.forEach((attribute) => {
            if (actors.every(actors.every(actor => actor.system.abilities[attribute[0]]))) {
                matchedAttributes[attribute[0]] = attribute[1]
            }
        })
        const actions = matchedAttributes.map((attribute) => {
            const id = attribute[0]
            const name = this.i18n('tokenActionHud.attribute.' + id)
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const icon = this.getImage(attribute)
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
        const actorId = character.actor?.id
        const tokenId = character.token?.id
        if (!tokenId) return
        const actionType = 'utility'
        const subcategoryId = 'combat'
        const actions = []

        // End Turn
        if (game.combat?.current?.tokenId === tokenId) {
            const id = 'endTurn'
            const name = this.i18n('tokenActionHud.endTurn')
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
        }

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Magic
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildMagic (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'spell'
        const subcategoryId = 'spells'
        const subcategoryList = []

        let spells = actor.items.filter((item) => item.type === actionType)
        spells = this._sortSpellsByRank(spells)

        const traditions = [
            ...new Set(spells.map((spell) => spell.system.tradition))
        ]
        traditions.sort().forEach((tradition) => {
            if (tradition !== undefined) {
                const traditionSubcategoryId = tradition
                const traditionName = tradition
                const subcategory = this.initializeEmptySubcategory(
                    traditionSubcategoryId,
                    subcategoryId,
                    traditionName,
                    'system'
                )
                const actions = spells
                    .filter((spell) => spell.system.tradition === tradition)
                    .map((spell) => {
                        const id = spell.id
                        const name = spell.name
                        const encodedValue = [actionType, actorId, tokenId, id].join(
                            this.delimiter
                        )
                        const img = this.getImage(spell)
                        const info2 = this._getCastingsData(spell)
                        return {
                            id,
                            name,
                            encodedValue,
                            img,
                            info2,
                            selected: true
                        }
                    })
                this.addToSubcategoriesList(
                    subcategoryList,
                    traditionSubcategoryId,
                    subcategory,
                    actions
                )
            }
        })
        this.addSubcategoriesToActionList(actionList, subcategoryList, subcategoryId)
    }

    /**
     * Sort Spells by Rank
     * @private
     * @param {object} spells
     * @returns {object}
     */
    _sortSpellsByRank (spells) {
        const result = Object.values(spells)
        result.sort((a, b) => {
            if (a.system.rank === b.system.rank) {
                return a.name
                    .toUpperCase()
                    .localeCompare(b.name.toUpperCase(), undefined, {
                        sensitivity: 'base'
                    })
            }
            return a.system.rank - b.system.rank
        })
        return result
    }

    /**
     * Build Rest
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildRest (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actors = (actorId === 'multi') ? this._getActors() : [actor]
        const actionType = 'utility'
        const subcategoryId = 'rest'
        const actions = []

        if (actors.every((actor) => actor.type === 'character')) {
            const id = 'rest'
            const name = this.i18n('tokenActionHud.demonLord.rest')
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
        }

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Talents
     * @param {object} actionList
     * @param {object} character
     */
    _buildTalents (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'talent'
        const categoryId = 'talents'

        const talents = actor.items.filter((item) => item.type === actionType)

        const groups = [
            ...new Set(talents.map((talent) => talent.system.groupname))
        ]

        const subcategoryList = []

        groups.sort().forEach((group) => {
            if (group !== undefined) {
                const subcategoryId = `talents_${group.toLowerCase()}`
                const subcategoryName = group
                const subcategory = this.initializeEmptySubcategory(
                    subcategoryId,
                    categoryId,
                    subcategoryName,
                    'system'
                )
                const actions = talents
                    .filter((talent) => talent.system.groupname === group)
                    .map((talent) => {
                        const id = talent.id
                        const name = talent.name
                        const encodedValue = [actionType, actorId, tokenId, id].join(
                            this.delimiter
                        )
                        const img = this.getImage(talent)
                        const info2 = this._getUsesData(talent)
                        return {
                            id,
                            name,
                            encodedValue,
                            img,
                            info2,
                            selected: true
                        }
                    })
                this.addToSubcategoriesList(
                    subcategoryList,
                    subcategoryId,
                    subcategory,
                    actions
                )
            }
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, categoryId)
    }

    /**
     * Build Weapons
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildWeapons (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'weapon'
        const subcategoryId = 'weapons'

        const actions = actor.items
            .filter((item) => item.type === actionType)
            .map((item) => {
                const id = item.id
                const name = item.name
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
     * Get Actors
     * @returns {object}
     */
    _getActors () {
        const allowedTypes = ['creature', 'character']
        const actors = canvas.tokens.controlled.map((token) => token.actor)
        if (actors.every((actor) => allowedTypes.includes(actor.type))) {
            return actors
        }
    }

    /**
     * Get Uses
     * @param {object} item
     * @returns {string}
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
     * Get Castings
     * @param {object} item
     * @returns {string}
     */
    _getCastingsData (item) {
        let result = ''

        const uses = item.system.castings
        if (!uses) return result

        if (!(uses.max || uses.value)) return result

        result = uses.value ?? 0

        if (uses.max > 0) {
            result += `/${uses.max}`
        }

        return result
    }
}
