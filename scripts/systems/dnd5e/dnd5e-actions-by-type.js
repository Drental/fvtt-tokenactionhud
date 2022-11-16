import { ActionHandler5e } from './dnd5e-actions.js'
import * as settings from '../../core/settings.js'

export class ActionHandler5eGroupByType extends ActionHandler5e {
    /** @override */
    async _buildCategories (token) {
        const api = game.modules.get('character-actions-list-5e').api
        const actionData = await api.getActorActionsData(token.actor)

        return [
            this._buildActionCategory(token, 'actions', actionData.action),
            this._buildActionCategory(token, 'bonusActions', actionData.bonus),
            this._buildActionCategory(token, 'reactions', actionData.reaction),
            this._buildActionCategory(token, 'crewActions', actionData.crew),
            this._buildActionCategory(
                token,
                'legendaryActions',
                actionData.legendary
            ),
            this._buildActionCategory(token, 'lairActions', actionData.lair),
            this._buildActionCategory(token, 'specialActions', actionData.other),
            this._buildSkillsCategory(token),
            this._buildAbilitiesCategory(token),
            this._buildEffectsCategory(token),
            this._buildConditionsCategory(token),
            this._buildUtilityCategory(token)
        ]
    }

    _buildActionCategory (token, title, actions) {
        const category = this.initializeEmptyCategory(title)
        category.name = this.i18n(`tokenActionHud.${title}`)

        let spells = []
        for (const a of actions) {
            if (a.type == 'spell') {
                spells.push(a)
                actions.delete(a)
            }
        }
        if (
            token.actor.type === 'character' ||
      !settings.get('showAllNpcItems')
        ) {
            spells = this._filterNonpreparedSpells(spells)
        }
        spells = this._sortSpellsByLevel(spells)
        spells = this._categoriseSpells(token.actor, token.id, spells)

        this._subCategorizeEquipment(
            token,
            category,
            actions,
            this.i18n('tokenActionHud.weapons'),
            (i) => i.type == 'weapon'
        )
        this._subCategorizeEquipment(
            token,
            category,
            actions,
            this.i18n('tokenActionHud.equipment'),
            (i) => i.type == 'equipment'
        )
        this._subCategorizeEquipment(
            token,
            category,
            actions,
            this.i18n('tokenActionHud.consumables'),
            (i) => i.type == 'consumable'
        )
        this._subCategorizeEquipment(
            token,
            category,
            actions,
            this.i18n('tokenActionHud.tools'),
            (i) => i.type == 'tool'
        )
        this._subCategorizeEquipment(
            token,
            category,
            actions,
            this.i18n('tokenActionHud.other'),
            (i) => true
        )

        for (const subCat of spells.subcategories) {
            this._combineSubcategoryWithCategory(category, subCat.name, subCat)
        }

        return category
    }

    // Adds actions matching predicate to a new subcategory, and returns it.
    // Deletes matches from the actions set as it does so.
    _subCategorizeEquipment (token, category, actions, title, predicate) {
        const subcat = this.initializeEmptySubcategory()
        const matches = new Set()
        for (const a of actions) {
            if (predicate(a)) {
                matches.add(a)
                actions.delete(a)
            }
        }
        if (matches.size > 0) {
            subcat.actions = [...matches].map((i) =>
                this._buildEquipmentItem(token.id, token.actor, 'item', i)
            )
            this._combineSubcategoryWithCategory(category, title, subcat)
        }
    }
}
