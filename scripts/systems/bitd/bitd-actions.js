import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerBitD extends ActionHandler {
    /**
     * Build System Actions
     * @override
     * @param {object} actionList
     * @param {object} character
     * @param {object} subcategoryIds
     * @returns {object}
     */
    async buildSystemActions (actionList, character, subcategoryIds) {
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'actions')) {
            this._buildActions(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'resistances')) {
            this._buildResistances(actionList, character)
        }

        return actionList
    }

    /**
     * Build Actions
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildActions (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'action'
        const parentSubcategoryId = 'actions'
        const subcategoryList = []

        const attributes = actor.system.attributes
        attributes.forEach((attribute) => {
            const subcategoryId = attribute
            const subcategoryName = this.i18n(
                actor.system.attributes[attribute].label
            )
            const subcategory = this.initializeEmptySubcategory(
                subcategoryId,
                parentSubcategoryId,
                subcategoryName,
                'system'
            )
            const skills = actor.system.attributes[attribute].skills
            const actions = skills.map((skill) => {
                const id = skill
                const name = this.i18n(skill.label)
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
            this.addToSubcategoriesList(
                subcategoryList,
                subcategoryId,
                subcategory,
                actions
            )
        })
        this.addSubcategoriesToActionList(
            actionList,
            subcategoryList,
            parentSubcategoryId
        )
    }

    /**
     * Build Resistances
     * @private
     * @param {object} actionList
     * @param {object} character
     */
    _buildResistances (actionList, character) {
        const actor = character?.actor
        const actorId = character?.actor?.id
        const tokenId = character?.token?.id
        const actionType = 'resistance'
        const subcategoryId = 'resistances'

        const attributes = actor.system.attributes
        const actions = attributes.map((attribute) => {
            const id = attribute
            const name = this.i18n(actor.system.attributes[attribute].label)
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            return {
                id: name,
                name,
                encodedValue,
                selected: true
            }
        })
        this.addActionsToActionList(actionList, actions, subcategoryId)
    }
}
