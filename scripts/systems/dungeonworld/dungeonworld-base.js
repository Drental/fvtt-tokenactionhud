import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseDw extends RollHandler {
    /** */
    doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')

        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        const actor = super.getActor(actorId, tokenId)
        const actorType = actor.type

        switch (actionType) {
        case 'ability':
            this._handleAbility(actor, actionId)
            break
        case 'damage':
            this._handleDamage(actor)
            break
        case 'equipment':
        case 'move':
        case 'spell':
            if (actorType === 'character') {
                this._handleMove(actorId, tokenId, actor, actionId)
            } else {
                this._handleMoveNpc(actionType, event, actor, actionId)
            }
            break
        case 'tag':
        case 'quality':
        case 'instinct':
            if (actorType === 'npc') {
                this._handleTextNpc(actionType, actor, actionId)
            }
            break
        }
    }

    _handleAbility (actor, actionId) {
        const ability = actor.system.abilities[actionId]

        const mod = ability.mod
        const formula = `2d6+${mod}`

        const title = `${ability.label} ${this.i18n('DW.Roll')}`
        const abilityText = ability.label.toLowerCase()

        const templateData = {
            title,
            flavor: `Made a move using ${abilityText}!`
        }
        actor.rollMove(formula, actor, {}, templateData)
    }

    _handleDamage (actor) {
        const damage = actor.system.attributes.damage
        const damageDie = `${damage.value}`
        const damageMod = damage.misc.value > 0 ? damage.misc.value : 0

        const flavour = damage.piercing

        const formula = damageMod > 0 ? `${damageDie}+${damageMod}` : damageDie
        const title = this.i18n('DW.Damage')

        const templateData = {
            title,
            flavor: `${flavour}`
        }
        actor.rollMove(formula, actor, {}, templateData)
    }

    _handleMove (actorId, tokenId, actor, actionId) {
        const move = actor.items.get(actionId)

        if (this.isRenderItem()) {
            this.doRenderItem(actorId, tokenId, actionId)
            return
        }

        move.roll()
    }

    _handleTextNpc (actionType, actor, actionId) {
        const action = decodeURIComponent(actionId)

        const title = actionType.charAt(0).toUpperCase() + actionType.slice(1)
        const templateData = {
            title,
            details: action
        }
        actor.rollMove(null, actor, {}, templateData)
    }
}
