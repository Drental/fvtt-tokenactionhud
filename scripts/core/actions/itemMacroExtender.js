import { ActionListExtender } from './actionListExtender.js'
import * as settings from '../settings.js'

export class ItemMacroActionListExtender extends ActionListExtender {
    static isModuleActive (id) {
        const module = game.modules.get(id)
        return module && module.active
    }

    /** @override */
    extendActionList (actionList, character) {
        if (!character) return

        const tokenId = actionList.tokenId
        const actorId = actionList.actorId

        if (!actorId) return

        const actor = this.getActor(characterId)
        const items = actor.items.filter((item) => item.hasMacro())

        let itemIds
        if (ItemMacroActionListExtender.isModuleActive('midi-qol')) {
            itemIds = items
                .filter(this.isUnsupportedByMidiQoL)
                .map((item) => item.id)
        } else {
            itemIds = items.map((item) => item.id)
        }

        if (!itemIds) return

        if (itemIds.length === 0) return

        const itemMacroSetting = settings.get('itemMacroReplace')

        if (itemMacroSetting === 'showOriginal') return actionList

        const replace = itemMacroSetting === 'showItemMacro'

        actionList.categories.forEach((category) => {
            category.subcategories.forEach((subcategory) => {
                this.addSubcategoryActions(itemIds, subcategory, replace)
            })
        })

        return actionList
    }

    addSubcategoryActions (itemIds, subcategory, replace) {
        if (subcategory.subcategories && subcategory.subcategories.length > 0) {
            subcategory.subcategories.forEach((s) =>
                this.addSubcategoryActions(itemIds, s, replace)
            )
        }

        const macroActions = []
        subcategory.actions.forEach((action) => {
            if (!itemIds.includes(action.id)) return

            const macroAction = this.createItemMacroAction(action, replace)

            // if replacing, actions should have already been edited in place, no need to add.
            if (!replace) macroActions.push(macroAction)
        })

        this.addActionsToSubcategory(subcategory, macroActions)
    }

    createItemMacroAction (action, replace) {
        const actionType = 'itemMacro'
        const newAction = replace ? action : {}

        const keep = action.encodedValue.substr(
            action.encodedValue.indexOf(this.delimiter)
        )
        newAction.encodedValue = actionType + keep
        newAction.name = replace ? action.name : `(M) ${action.name}`
        newAction.id = action.id
        newAction.img = action.img
        newAction.icon = action.icon

        newAction.info1 = action.info1
        newAction.info2 = action.info2
        newAction.info3 = action.info3

        return newAction
    }

    addActionsToSubcategory (subcategory, macroActions) {
        macroActions.forEach((ma) => {
            const index = subcategory.actions.findIndex((a) => a.id === ma.id) + 1
            subcategory.actions.splice(index, 0, ma)
        })
    }

    isUnsupportedByMidiQoL (item) {
        const flag = item.getFlag('midi-qol', 'onUseMacroName')
        return !flag
    }

    getActor (characterId) {
        let actor = canvas.tokens.placeables.find(token => token.id === characterId)?.actor
        if (!actor) actor = game.actors.get(characterId)
        return actor
    }
}
