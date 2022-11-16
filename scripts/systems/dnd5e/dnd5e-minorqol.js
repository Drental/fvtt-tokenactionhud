import { RollHandlerBase5e } from './dnd5e-base.js'

export class RollHandlerMinorQol5e extends RollHandlerBase5e {
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
        const item = actor.items.get(actionId)

        if (this.needsRecharge(item)) {
            item.rollRecharge()
            return
        }

        if (this.rightClick && this.ctrl) {
            item.rollAttack()
            return
        }
        if (this.rightClick && this.alt) {
            item.rollDamage()
            return
        }

        let versatile
        if (item.system.properties?.ver) {
            versatile = this.rightClick
        }

        MinorQOL.doCombinedRoll({ actor, item, event, versatile })
    }
}
