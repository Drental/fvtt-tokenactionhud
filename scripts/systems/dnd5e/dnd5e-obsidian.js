import { RollHandlerBase5e } from './dnd5e-base.js'

export class RollHandlerObsidian extends RollHandlerBase5e {
    /**
     * Roll Ability Test
     * @override
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollAbilityTest (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        OBSIDIAN.Items.roll(actor, { roll: 'abl', abl: actionId })
    }

    /**
     * Roll Ability Save
     * @override
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollAbilitySave (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        OBSIDIAN.Items.roll(actor, { roll: 'save', save: actionId })
    }

    /**
     * Roll Skill
     * @override
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _rollSkill (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        OBSIDIAN.Items.roll(actor, { roll: 'skl', skl: actionId })
    }

    /**
     * Use Item
     * @override
     * @param {object} event
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    _useItem (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        OBSIDIAN.Items.roll(actor, { roll: 'item', id: actionId })
    }
}
