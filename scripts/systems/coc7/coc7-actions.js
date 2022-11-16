import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerCoC7 extends ActionHandler {
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

        const actorTypes = ['character', 'npc', 'creature']
        if (!actorTypes.includes(actor.type)) return

        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'attributes')) {
            this._buildAttributes(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'characteristics')) {
            this._buildCharacteristics(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            this._buildWeapons(actionList, character)
        }

        return actionList
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
        const tokenId = character?.actor?.id
        const actionType = 'attribute'
        const subcategoryId = 'attributes'

        const attributes = [
            { id: 'lck', name: actor.system.attribs.lck.label },
            { id: 'san', name: actor.system.attribs.san.label }
        ]
        const actions = attributes.map((attribute) => {
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
     * Build Characteristics
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildCharacteristics (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.actor?.id
        const actionType = 'characteristic'
        const subcategoryId = 'characteristics'

        const characteristics = Object.entries(actor.system.characteristics)
        const actions = characteristics.map((characteristic) => {
            const id = characteristic
            const name = this.i18n(actor.system.characteristics[characteristic].label)
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
        const tokenId = character?.actor?.id
        const actionType = 'skill'
        const subcategoryId = 'skills'

        const actions = actor.items
            .filter((item) => item.type === actionType)
            .map((item) => {
                const id = item.id
                const name = item.name
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
        const actorId = character?.actor?.id
        const tokenId = character?.actor?.id
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
     * Sort Items
     * @param {object} items
     * @returns {object}
     */
    _sortItems (items) {
        const result = Object.values(items)
        result.sort((a, b) => {
            return a.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase()
                .localeCompare(
                    b.name
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLocaleLowerCase()
                )
        })
        return result
    }
}
