import { ActionHandler } from '../../core/actions/actionHandler.js'

const systemDefaultImages = ['systems/cleenmain/assets/image/default.png']

export class ActionHandlerCleenmain extends ActionHandler {
    /**
     * Build System Actions
     * @override
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @returns {object}
     */
    async buildSystemActions (actionList, character, subcategoryIds) {
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'skills')) {
            this._buildSkills(actionList, character)
        }
        if (subcategoryIds.some((subcategoryId) => subcategoryId === 'weapons')) {
            this._buildWeapons(actionList, character)
        }

        return actionList
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
        const subcategoryId = 'actorSkills'

        const skills = actor.items
            .filter((item) => item.type === actionType)
            .sort(function (a, b) {
                return a.name.localeCompare(b.name)
            })
        const actions = skills.map((skill) => {
            const id = skill.id
            const name = skill.name
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const img = this.getImage(skill, systemDefaultImages)
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
        const subcategoryId = 'actorWeapons'

        const weapons = actor.items.filter((item) => item.type === actionType)
        const actions = weapons.map((weapon) => {
            const id = weapon.id
            const name = weapon.name
            const encodedValue = [actionType, actorId, tokenId, id].join(
                this.delimiter
            )
            const img = this.getImage(weapon, systemDefaultImages)
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
}
