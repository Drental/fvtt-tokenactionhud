import { ActionHandler } from '../../core/actions/actionHandler.js'
import { Logger } from '../../core/logger.js'

export class ActionHandlerED4e extends ActionHandler {
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
        const actor = character?.actor

        const inventorySubcategoryIds = subcategoryIds.filter((subcategoryId) =>
            subcategoryId === 'armors' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'shields' ||
            subcategoryId === 'weapons'
        )

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
            this._buildAttributes(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'other')) {
            this._buildOther(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'systems')) {
            this._buildSystems(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'favourites')) {
            this._buildFavorites(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'talents')) {
            this._buildTalents(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'matrixes')) {
            this._buildMatrix(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }
        if (inventorySubcategoryIds) {
            this._buildInventory(actionList, character, inventorySubcategoryIds)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'weaponAttacks')) {
            this._buildWeaponAttacks(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'combatOptions')) {
            this._buildCombatOptions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'actions')) {
            this._buildActions(actionList, character)
        }

        if (actor.type === 'creature') {
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'creatureAttacks')) {
                this._buildCreatureAttacks(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'creaturePowers')) {
                this._buildCreaturePowers(actionList, character)
            }
            if (subcategoryIds.some((subcategoryId) => subcategoryId === 'creatureManeuvers')) {
                this._buildCreatureManeuvers(actionList, character)
            }
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

        return actionList
    }

    /**
     * Build Attributes
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildAttributes (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'attribute'
        const subcategoryId = 'attributes'

        const attributes = [
            { id: 'dexterity', name: this.i18n('earthdawn.d.dexterity') },
            { id: 'strength', name: this.i18n('earthdawn.s.strength') },
            { id: 'toughness', name: this.i18n('earthdawn.t.toughness') },
            { id: 'perception', name: this.i18n('earthdawn.p.perception') },
            { id: 'willpower', name: this.i18n('earthdawn.w.willpower') },
            { id: 'charisma', name: this.i18n('earthdawn.c.charisma') }
        ]

        const actions = attributes.map(attribute => {
            const id = attribute.id
            const name = attribute.name
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
     * Build Other
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildOther (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const subcategoryId = 'other'
        const isCreature = actor.type === 'creature'

        const actions = []
        actions.push(
            {
                id: 'recovery',
                name: this.i18n('earthdawn.r.recovery'),
                encodedValue: ['recovery', actorId, tokenId, 'recovery'].join(this.delimiter),
                selected: true
            }
        )

        if (!isCreature) {
            actions.push(
                {
                    id: 'newDay',
                    name: this.i18n('earthdawn.n.newDay'),
                    encodedValue: ['newDay', actorId, tokenId, 'newDay'].join(this.delimiter),
                    selected: true
                },
                {
                    id: 'halfMagic',
                    name: this.i18n('earthdawn.h.halfMagic'),
                    encodedValue: ['halfMagic', actorId, tokenId, 'halfMagic'].join(this.delimiter),
                    selected: true
                }
            )
        }

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Systems
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildSystems (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'toggle'
        const subcategoryId = 'systems'

        const actions = []
        actions.push(
            {
                id: 'useKarma',
                name: this.i18n('earthdawn.u.useKarma'),
                encodedValue: [actionType, actorId, tokenId, 'usekarma'].join(this.delimiter),
                cssClass: actor.system.usekarma === 'true' ? 'toggle active' : 'toggle',
                selected: true
            }
        )

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Favorites
     * @param {object} actionList
     * @param {object} character
     */
    _buildFavorites (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const subcategoryId = 'favourites'

        if (!['pc', 'npc'].includes(actor.type)) return

        const items = actor.items.filter(item => item.system.favorite === 'true')

        const actions = items.map(item => {
            try {
                const actionType = item.type.toLowerCase()
                const id = item.id
                const name = (Object.hasOwn(item.system, 'ranks'))
                    ? `${item.name} (${item.system.ranks})`
                    : item.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            } catch (error) {
                Logger.error(item)
                return null
            }
        }).sort((a, b) => a.name.localeCompare(b.name))

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
        const subcategoryId = 'talents'

        const items = actor.items.filter(item => item.type === 'talent')

        const actions = items.map(item => {
            try {
                const id = item.id
                const name = item.name + ' (' + item.system.ranks + ')'
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            } catch (error) {
                Logger.error(item)
                return null
            }
        }).sort((a, b) => a.name.localeCompare(b.name))

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Matric
     * @param {object} actionList
     * @param {object} character,
     */
    _buildMatrix (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const parentSubcategoryId = 'matrixes'

        if (!['pc', 'npc'].includes(actor.type)) return
        if (!actor.items.some(item => item.type === 'spellmatrix')) return

        const items = actor.items.filter(item => item.type === 'spellmatrix')
        const subcategoryList = []

        items.forEach(item => {
            try {
                const subcategoryId = `${parentSubcategoryId}_${item.id}`
                const subcategoryName = item.system.currentspell
                    ? `${item.system.currentspell} (${item.system.totalthreads}/${item.system.threadsrequired})`
                    : item.name
                const subcategory = this.initializeEmptySubcategory(subcategoryId, parentSubcategoryId, subcategoryName, 'system')
                const id = item.id
                const actions = [
                    {
                        id,
                        name: this.i18n('earthdawn.a.attune'),
                        encodedValue: ['matrixAttune', actorId, tokenId, id].join(this.delimiter),
                        selected: true
                    },
                    {
                        id,
                        name: this.i18n('earthdawn.m.matrixWeaveRed'),
                        encodedValue: ['matrixWeave', actorId, tokenId, id].join(this.delimiter),
                        selected: true
                    },
                    {
                        id,
                        name: this.i18n('earthdawn.m.matrixCastRed'),
                        encodedValue: ['matrixCast', actorId, tokenId, id].join(this.delimiter),
                        selected: true
                    },
                    {
                        id,
                        name: this.i18n('earthdawn.m.matrixClearRed'),
                        encodedValue: ['matrixClear', actorId, tokenId, id].join(this.delimiter),
                        selected: true
                    }
                ]

                this.addToSubcategoriesList(subcategoryList, subcategoryId, subcategory, actions)
            } catch (error) {
                Logger.error(item)
                throw error
            }
        })

        this.addSubcategoriesToActionList(actionList, subcategoryList, parentSubcategoryId)
    }

    _buildSkills (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'skill'
        const subcategoryId = 'skills'

        if (!['pc', 'npc'].includes(actor.type)) return

        const items = actor.items
            .filter(item => item.type === 'skill')
            .sort((a, b) => a.name.localeCompare(b.name))

        const actions = items.map(item => {
            try {
                const id = item.id
                const name = item.name + ' (' + item.system.ranks + ')'
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            } catch (error) {
                Logger.error(item)
                return null
            }
        })

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Inventory
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildInventory (actionList, character, inventorySubcategoryIds) {
        const actor = character?.actor

        if (!['pc', 'npc'].includes(actor.type)) return

        let items = actor.items.filter(item => ['weapon', 'armor', 'shield', 'equipment'].includes(item.type))
        items = this.sortItems(items)

        // Weapons
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            const weapons = items.filter(item => (item.type === 'weapon'))
            this._buildItems(actionList, character, weapons, 'weapons')
        }

        // Armors
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'armors')) {
            const armors = items.filter(item => (item.type === 'armor'))
            this._buildItems(actionList, character, armors, 'armors')
        }

        // Shields
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'shields')) {
            const shields = items.filter(item => (item.type === 'shield'))
            this._buildItems(actionList, character, shields, 'shields')
        }

        // Equipment
        if (inventorySubcategoryIds.some((subcategoryId) => subcategoryId === 'equipment')) {
            const equipment = items.filter(item => (item.type === 'equipment'))
            this._buildItems(actionList, character, equipment, 'equipment')
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
        const isToggle = ['weapon', 'armor', 'shield'].includes(item.type)
        const toggle = (isToggle) ? 'toggle' : ''
        const active = (isToggle && item.system.worn) ? ' active' : ''
        const cssClass = `${toggle}${active}`
        return {
            id,
            name,
            encodedValue,
            img,
            cssClass,
            selected: true
        }
    }

    /**
     * Build Weapon Attacks
     * @param {object} actionList
     * @param {object} character
     */
    _buildWeaponAttacks (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'weaponAttack'
        const subcategoryId = 'weaponAttacks'

        const weapons = actor.items
            .filter(item => item.type === 'weapon' && item.system.worn)
            .sort((a, b) => a.name.localeCompare(b.name))
        const actions = weapons.map(weapon => {
            const id = weapon.id
            const name = weapon.name
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            const img = this.getImage(weapon)
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
     * Build Combat Options
     * @param {object} actionList
     * @param {object} character
     */
    _buildCombatOptions (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'toggle'
        const subcategoryId = 'combatOptions'

        const combatOptions = [
            { id: 'aggressive', name: this.i18n('earthdawn.c.combatOptionsAggressive') },
            { id: 'defensive', name: this.i18n('earthdawn.c.combatOptionsDefensive') },
            { id: 'harried', name: this.i18n('earthdawn.c.combatModifierHarried') },
            { id: 'knockeddown', name: this.i18n('earthdawn.c.combatModifierKnockedDown') }
        ]

        const actions = combatOptions.map(combatOption => {
            const id = combatOption.id
            const name = combatOption.name
            const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
            const active = actor.system.tactics[id] === true ? ' active' : ''
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
     * Build Actions
     * @param {object} actionList
     * @param {object} character
     */
    _buildActions (actionList, character) {
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const subcategoryId = 'actions'

        const actions = [
            {
                id: 'takeDamage',
                name: this.i18n('earthdawn.t.takeDamage'),
                encodedValue: ['takeDamage', actorId, tokenId, 'takeDamage'].join(this.delimiter),
                selected: true
            },
            {
                id: 'knockdownTest',
                name: this.i18n('earthdawn.c.combatOptionsKnockdownTest'),
                encodedValue: ['knockdownTest', actorId, tokenId, 'knockdownTest'].join(this.delimiter),
                selected: true
            },
            {
                id: 'jumpUp',
                name: this.i18n('earthdawn.c.combatOptionsJumpUp'),
                encodedValue: ['jumpUp', actorId, tokenId, 'jumpUp'].join(this.delimiter),
                selected: true
            }
        ]

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Creature Attacks
     * @param {object} actionList
     * @param {object} character
     * @returns
     */
    _buildCreatureAttacks (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'attack'
        const subcategoryId = 'creatureAttacks'

        if (actor.type !== 'creature') return

        const attacks = actor.items
            .filter(item => item.system.powerType === 'Attack')
            .sort((a, b) => a.name.localeCompare(b.name))

        const actions = attacks.map(attack => {
            try {
                const id = attack.id
                const name = attack.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            } catch (error) {
                Logger.error(attack)
                return null
            }
        }).filter(s => !!s) // filter out nulls

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Creature Powers
     * @param {object} actionList
     * @param {object} character
     * @returns
     */
    _buildCreaturePowers (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'power'
        const subcategoryId = 'creaturePowers'

        if (actor.type !== 'creature') return

        const powers = actor.items
            .filter(item => item.system.powerType === 'Power')
            .sort((a, b) => a.name.localeCompare(b.name))

        const actions = powers.map(power => {
            try {
                const id = power.id
                const name = power.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            } catch (error) {
                Logger.error(power)
                return null
            }
        }).filter(s => !!s) // filter out nulls

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }

    /**
     * Build Creature Maneuvers
     * @param {object} actionList
     * @param {object} character
     * @returns
     */
    _buildCreatureManeuvers (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'maneuver'
        const subcategoryId = 'creatureManeuvers'

        if (actor.type !== 'creature') return

        const maneuvers = actor.items
            .filter(item => item.system.powerType === 'Maneuver')
            .sort((a, b) => a.name.localeCompare(b.name))

        const actions = maneuvers.map(maneuver => {
            try {
                const id = maneuver.id
                const name = maneuver.name
                const encodedValue = [actionType, actorId, tokenId, id].join(this.delimiter)
                return {
                    id,
                    name,
                    encodedValue,
                    selected: true
                }
            } catch (error) {
                Logger.error(maneuver)
                return null
            }
        }).filter(s => !!s) // filter out nulls

        this.addActionsToActionList(actionList, actions, subcategoryId)
    }
}
