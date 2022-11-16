import { RollHandler } from '../../core/rollHandler/rollHandler.js'
import * as settings from '../../core/settings.js'

export class RollHandlerBaseCleenmain extends RollHandler {
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
        case 'weapon':
            this._handleWeapon(actor, actionId)
            break
        case 'skill':
            this._handleSkill(actor, actionId)
            break
        }
    }

    _handleWeapon (actor, actionId) {
        return actor.check(actionId, 'weapon-attack')
    }

    _handleSkill (actor, actionId) {
        return actor.check(actionId, 'skill')
    }
}
