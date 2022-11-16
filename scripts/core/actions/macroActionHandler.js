import * as settings from '../settings.js'

export class MacroActionHandler {
    baseHandler

    constructor (baseHandler) {
        this.baseHandler = baseHandler
    }

    /** @override */
    async buildMacroActions (actionList) {
        const subcategoryIds = Object.values(actionList.categories)
            .filter((category) => category.subcategories)
            .flatMap((category) =>
                Object.values(category.subcategories)
                    .filter((subcategory) => subcategory.type === 'custom')
                    .flatMap((subcategory) => subcategory.id)
            )
        if (!subcategoryIds) return

        const actions = await this.getEntriesForActions()
        for (const subcategoryId of subcategoryIds) {
            this.baseHandler.addActionsToActionList(
                actionList,
                actions,
                subcategoryId
            )
        }
    }

    async getEntriesForActions () {
        const actionType = 'macro'
        const macros = game.macros.filter((macro) => {
            const permissions = macro.ownership
            if (permissions[game.userId]) return permissions[game.userId] > 0
            return permissions.default > 0
        })
        return macros.map((macro) => {
            const encodedValue = [actionType, macro.id].join(this.baseHandler.delimiter)
            const img = this.baseHandler.getImage(macro)
            return {
                name: macro.name,
                encodedValue,
                id: macro.id,
                img,
                selected: false
            }
        })
    }
}
