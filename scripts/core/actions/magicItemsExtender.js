import { ActionListExtender } from './actionListExtender.js'
import * as settings from '../settings.js'

export class MagicItemActionListExtender extends ActionListExtender {
    /** @override */
    extendActionList (actionList, character) {
        if (!character) return

        const tokenId = actionList.tokenId
        const actorId = actionList.actorId

        if (!actorId) return

        const itemCategories = actionList.categories.find(
            (c) => c.id === 'inventory'
        )
        const actor = MagicItems.actor(actorId)

        if (!(actor && itemCategories)) return

        const magicItems = actor.items ?? []

        if (magicItems.length === 0) return

        const magicItemsCategory = this.initializeEmptyCategory('magicItemsModule')
        magicItemsCategory.name = this.i18n('tokenActionHud.magicItems')

        const magicItemsIds = magicItems.map((item) => item.id)

        itemCategories.subcategories.forEach((s) => {
            s.actions.forEach((action) => {
                if (!magicItemsIds.includes(action.id)) return

                const magicItem = magicItems.find((item) => item.id === action.id)

                if (magicItem.attuned && !this._isItemAttuned(magicItem)) return

                if (magicItem.equipped && !this._isItemEquipped(magicItem)) return

                const subcategory = this.initializeEmptySubcategory()
                subcategory.info1 = `${magicItem.uses}/${magicItem.charges}`

                magicItem.ownedEntries.forEach((entry) => {
                    const effect = entry.item
                    const encodedValue = [
                        'magicItem',
                        tokenId,
                        `${action.id}>${effect.id}`
                    ].join('|')
                    const img = this.getImage(effect)
                    const magicItemAction = {
                        name: effect.name,
                        id: effect.id,
                        encodedValue,
                        img
                    }
                    magicItemAction.info1 = effect.consumption
                    if (effect.baseLevel) {
                        magicItemAction.info2 = `${this.i18n(
                            'tokenActionHud.levelAbbreviation'
                        )} ${effect.baseLevel}`
                    }
                    subcategory.actions.push(magicItemAction)
                })

                subcategory.actions.unshift(action)

                this._combineSubcategoryWithCategory(
                    magicItemsCategory,
                    action.name,
                    subcategory
                )
            })
        })

        this._combineCategoryWithList(
            actionList,
            magicItemsCategory.name,
            magicItemsCategory,
            false
        )
    }

    _isItemEquipped (magicItem) {
        return magicItem.item.system.equipped
    }

    _isItemAttuned (magicItem) {
        const itemData = magicItem.item.system

        if (itemData.attunement) {
            const attuned = CONFIG.DND5E.attunementTypes?.ATTUNED ?? 2
            return itemData.attunement === attuned
        }

        if (itemData.attuned) return itemData.attuned

        return false
    }
}
