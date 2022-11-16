import { RollHandler } from '../../core/rollHandler/rollHandler.js'
import { Logger } from '../../core/logger.js'

export class RollHandlerBaseED4e extends RollHandler {
    async doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')

        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        if (tokenId === 'multi') {
            for (const token of canvas.tokens.controlled) {
                const tokenActorId = token.actor.id
                const tokenTokenId = token.id
                await this._handleMacros(event, actionType, tokenActorId, tokenTokenId, actionId)
            }
        } else {
            await this._handleMacros(event, actionType, actorId, tokenId, actionId)
        }
    }

    async _handleMacros (event, actionType, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        switch (actionType) {
        case 'skill':
        case 'talent':
            this.rollTalentMacro(event, actorId, tokenId, actionId)
            break
        case 'attack':
        case 'maneuver':
        case 'power':
            this.handleCreatureActionMacro(event, actorId, tokenId, actionId)
            break
        case 'item':
            this.rollInventoryMacro(event, actorId, tokenId, actionId)
            break
        case 'toggle':
            this.toggleDataProperty(event, actorId, tokenId, actionId)
            break
        case 'attribute':
            this.rollAttributeMacro(event, actorId, tokenId, actionId)
            break
        case 'recovery':
            actor.recoveryTest()
            break
        case 'newDay':
            actor.newDay()
            break
        case 'halfMagic':
            actor.halfMagic()
            break
        case 'matrixAttune':
            actor.attuneMatrix(actor.items.get(actionId))
            break
        case 'matrixWeave':
            actor.weaveThread(actor.items.get(actionId))
            break
        case 'matrixCast':
            actor.castSpell(actor.items.get(actionId))
            break
        case 'matrixClear':
            actor.clearMatrix(actor.items.get(actionId))
            break
        case 'weaponAttack':
            actor.rollPrep({ weaponID: actionId, rolltype: 'attack' })
            break
        case 'takeDamage':
            this._takeDamage(actor)
            break
        case 'knockdownTest':
            actor.knockdownTest({})
            break
        case 'jumpUp':
            actor.jumpUpTest()
            break
        }
    }

    rollAttributeMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollPrep({ attribute: `${actionId.split('.').slice(-1)}Step`, name: actionId })
    }

    rollTalentMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        actor.rollPrep({ talentID: actionId })
    }

    rollInventoryMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = actor.items.get(actionId)
        if (item.type === 'equipment') {
            item.sheet.render(true)
        } else if (['weapon', 'armor', 'shield'].indexOf(item.type) >= 0) {
            this.toggleItemWornProperty(event, actorId, tokenId, actionId)
        } else {
            // problem
            Logger.error(item.type, ' is not a valid actionId for rolling an inventory item')
        }
    }

    toggleDataProperty (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        if (['aggressive', 'defensive', 'harried', 'knockeddown'].includes(actionId)) {
            actor.update({
                system: {
                    tactics: {
                        [actionId]: !actor.system.tactics[actionId]
                    }
                }
            })
        } else {
            const currentValue = actor.system[actionId]
            const valueType = typeof currentValue
            const newValue = valueType === 'string' ? this._toggleBooleanString(currentValue) : !currentValue
            actor.update({
                system: {
                    [actionId]: newValue
                }
            })
        }
    }

    toggleItemWornProperty (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = actor.items.get(actionId)
        const currentValue = item.system.worn
        const valueType = typeof currentValue
        const newValue = valueType === 'string' ? this._toggleBooleanString(currentValue) : !currentValue
        item.update({
            system: {
                worn: newValue
            }
        })
    }

    _toggleBooleanString (val) {
        if (val.toLowerCase().includes('true')) return 'false'
        if (val.toLowerCase().includes('false')) return 'true'
        return 'false'
    }

    handleCreatureActionMacro (event, actorId, tokenId, actionId) {
        const actor = super.getActor(actorId, tokenId)
        const item = actor.items.get(actionId)

        if (item.system.attackstep !== 0) {
            const modifier = 0
            const strain = item.system.strain ? item.system.strain : 0
            const karma = 0

            const type = (item.system.powerType === 'Attack') ? 'attack' : (item.system.attackstep > 0) ? 'test' : ''
            const parameters = {
                itemID: actionId,
                steps: item.system.attackstep,
                talent: item.name,
                strain,
                type,
                karma,
                modifier
            }
            actor.NPCtest(parameters)
        } else {
            actor.items.get(actionId).sheet.render(true)
        }
    }

    async _takeDamage (actor) {
        const inputs = await new Promise((resolve) => {
            new Dialog({
                title: this.i18n('earthdawn.t.takeDamage'),
                content: `
          <div style="float: left">
              <label>${this.i18n('earthdawn.d.damage')}: </label>
              <input id="damage_box" value=0 autofocus/>
          </div>
          <div>
              <label>${this.i18n('earthdawn.t.type')}: </label>
              <select id="type_box">
                <option value="physical">Physical</option>
                <option value="mystic">Mystic</option>
              </select>
          </div>
          <div>
            <label>${this.i18n('earthdawn.i.ignoreArmor')}?</label>
            <input type="checkbox" id="ignore_box"/>
          </div>`,
                buttons: {
                    ok: {
                        label: this.i18n('earthdawn.o.ok'),
                        callback: (html) => {
                            resolve({
                                damage: html.find('#damage_box').val(),
                                type: html.find('#type_box').val(),
                                ignore: html.find('#ignore_box:checked')
                            })
                        }
                    }
                },
                default: 'ok'
            }).render(true)
        })

        inputs.ignorearmor = inputs.ignore.length > 0
        await actor.takeDamage(inputs)
    }
}
