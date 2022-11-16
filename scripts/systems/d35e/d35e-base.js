import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseD35E extends RollHandler {
    /** @override */
    async doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')
        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }
        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        if (actorId === 'multi') {
            canvas.tokens.controlled.forEach((token) => {
                const tokenActorId = token.actor.id
                const tokenTokenId = token.id
                this._handleMacros(event, actionType, tokenActorId, tokenTokenId, actionId)
            })
        } else {
            await this._handleMacros(event, actionType, actorId, tokenId, actionId)
        }
    }

    async _handleMacros (event, actionType, actorId, tokenId, actionId) {
        switch (actionType) {
        case 'ability':
            this.rollAbilityMacro(event, actorId, tokenId, actionId)
            break
        case 'abilityCheck':
            this.rollAbilityCheckMacro(event, actorId, tokenId, actionId)
            break
        case 'abilitySave':
            this.rollAbilitySaveMacro(event, actorId, tokenId, actionId)
            break
        case 'buff':
            await this.adjustBuff(actorId, tokenId, actionId)
            break
        case 'cmb':
            this.rollCmbMacro(event, actorId, tokenId)
            break
        case 'concentration':
            this.rollConcentrationMacro(actorId, tokenId, actionId)
            break
        case 'defenses':
            this.rollDefenses(tokenId, actionId)
            break
        case 'attack':
        case 'feat':
        case 'item':
        case 'spell':
            if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId)
            else this.rollItemMacro(event, actorId, tokenId, actionId)
            break
        case 'skill':
            this.rollSkillMacro(event, actorId, tokenId, actionId)
            break
        case 'utility':
            this.performUtilityMacro(event, actorId, tokenId, actionId)
            break
        default:
            break
        }
    }

    rollAbilityMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollAbility(actionId, { event })
    }

    rollAbilityCheckMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollAbilityTest(actionId, { event })
    }

    rollAbilitySaveMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollSavingThrow(actionId, { event })
    }

    async adjustBuff (actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const buff = super.getItem(actor, actionId)
        const update = { 'data.active': !buff.system.active }
        await buff.update(update)
    }

    rollCmbMacro (event, actorId, tokenId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollCMB(event)
    }

    rollConcentrationMacro (actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollConcentration(actionId)
    }

    rollDefenses (actorId, tokenId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollDefenses()
    }

    rollItemMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = super.getItem(actor, actionId)
        item.use({ ev: event, skipDialog: false })
    }

    rollSkillMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollSkill(actionId, { event })
    }

    performUtilityMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        switch (actionId) {
        case 'rest':
            actor.sheet._onRest(event)
            break
        }
    }
}
