import { RollHandler } from '../../core/rollHandler/rollHandler.js'

export class RollHandlerBaseCthack extends RollHandler {
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

        switch (actionType) {
        case 'ability':
            if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId)
            else this._handleAbility(actor, actionId)
            break
        case 'damage':
            this._handleDamages(actor, actionId)
            break
        case 'item':
            if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId)
            else this._handleItem(actor, actionId)
            break
        case 'resource':
            this._handleResources(actor, actionId)
            break
        case 'save':
            this._handleSaves(actor, actionId)
            break
        case 'weapon':
            if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId)
            else this._handleWeapon(event, actor, actionId)
            break
        }
    }

    _handleAbility (actor, actionId) {
        const ability = actor.items.get(actionId)
        if (ability.system.uses.value > 0) actor.useAbility(ability)
        else actor.resetAbility(ability)
    }

    _handleDamages (actor, actionId) {
        actor.rollDamageRoll(actionId)
    }

    _handleItem (actor, actionId) {
        const item = actor.items.get(actionId)
        actor.rollMaterial(item)
    }

    _handleResources (actor, actionId) {
        actor.rollResource(actionId)
    }

    _handleSaves (actor, actionId) {
        actor.rollSave(actionId)
    }

    _handleWeapon (event, actor, actionId) {
        const item = actor.items.get(actionId)
        if (this.isShift(event)) {
            // Material roll
            actor.rollMaterial(item)
        } else {
            // Attack roll
            let mod = 0
            if (game.user.targets.size > 0) {
                const target = [...game.user.targets][0]
                if (target.actor.type === 'opponent') {
                    mod = target.actor.system.malus
                }
            }
            if (mod < 0) {
                item.system.range === '' ? actor.rollSave('str', { modifier: mod }) : actor.rollSave('dex', { modifier: mod })
            } else {
                item.system.range === '' ? actor.rollSave('str') : actor.rollSave('dex')
            }
        }
    }
}
