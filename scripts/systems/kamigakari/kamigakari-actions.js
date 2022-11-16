import { ActionHandler } from '../../core/actions/actionHandler.js'

export class ActionHandlerKg extends ActionHandler {
    /** @override */
    async buildSystemActions (actionList, character, subcategoryIds) {
        const result = this.initializeEmptyActionList()

        if (!token) return result
        const tokenId = token.id
        result.tokenId = tokenId

        const actor = token.actor
        if (!actor) return result
        result.actorId = actor.id

        const actorType = actor.type
        if (actorType === 'enemy') {
            const attack = this._getEnemyTalents(actor, tokenId)

            this._combineCategoryWithList(
                result,
                this.i18n('tokenActionHud.attack'),
                attack
            )
        } else if (actorType === 'character') {
            const mainStat = this._getMainStat(actor, tokenId)
            const subStat = this._getSubStat(actor, tokenId)
            const spiritBurn = this._getSpiritBurn(actor, tokenId)
            const talents = this._getTalents(actor, tokenId)
            const items = this._getItems(actor, tokenId)

            this._combineCategoryWithList(
                result,
                this.i18n('tokenActionHud.kamigakari.mainStats'),
                mainStat
            )
            this._combineCategoryWithList(
                result,
                this.i18n('tokenActionHud.kamigakari.subStats'),
                subStat
            )
            this._combineCategoryWithList(
                result,
                this.i18n('tokenActionHud.kamigakari.spiritBurn'),
                spiritBurn
            )
            this._combineCategoryWithList(
                result,
                this.i18n('tokenActionHud.talents'),
                talents
            )
            this._combineCategoryWithList(
                result,
                this.i18n('tokenActionHud.kamigakari.items'),
                items
            )
        }

        return result
    }

    _getMainStat (actor, tokenId) {
        const result = this.initializeEmptyCategory('mainStat')

        const mainStat = Object.entries(actor.system.attributes).filter(
            (a) => a[1]?.add !== undefined && a[1]?.base === undefined
        )
        const mainStatMap = mainStat.map((a) => {
            return { id: a[0], name: a[1].label }
        })
        const actions = this._produceMap(tokenId, mainStatMap, 'stat')
        const mainStatCategory = this.initializeEmptySubcategory()
        mainStatCategory.actions = actions

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.mainStats'),
            mainStatCategory
        )

        return result
    }

    _getSubStat (actor, tokenId) {
        const result = this.initializeEmptyCategory('subStat')

        const subStat = Object.entries(actor.system.attributes).filter(
            (a) => a[1]?.add === undefined && a[1]?.label !== undefined
        )
        const subStatMap = subStat.map((a) => {
            return { id: a[0], name: a[1].label }
        })
        const actions = this._produceMap(tokenId, subStatMap, 'stat')
        const subStatCategory = this.initializeEmptySubcategory()
        subStatCategory.actions = actions

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.subStats'),
            subStatCategory
        )

        return result
    }

    _getSpiritBurn (actor, tokenId) {
        const result = this.initializeEmptyCategory('spiritBurn')

        const burns = [
            {
                id: 'transcend',
                name: this.i18n('tokenActionHud.kamigakari.transcend')
            },
            {
                id: 'vitalIgnition',
                name: this.i18n('tokenActionHud.kamigakari.vitalIgnition')
            },
            {
                id: 'conceptDestruction',
                name: this.i18n('tokenActionHud.kamigakari.conceptDestruction')
            }
        ]
        const actions = this._produceMap(tokenId, burns, 'burn')
        const burnCategory = this.initializeEmptySubcategory()
        burnCategory.actions = actions

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.spiritBurn'),
            burnCategory
        )

        return result
    }

    _getTalents (actor, tokenId) {
        const result = this.initializeEmptyCategory('talent')

        const start = this._getTalentsByTiming(actor, tokenId, 'Start')
        const prep = this._getTalentsByTiming(actor, tokenId, 'Prep')
        const attack = this._getTalentsByTiming(actor, tokenId, 'Attack')
        const defense = this._getTalentsByTiming(actor, tokenId, 'Defense')
        const end = this._getTalentsByTiming(actor, tokenId, 'End')
        const constant = this._getTalentsByTiming(actor, tokenId, 'Constant')
        const free = this._getTalentsByTiming(actor, tokenId, 'Free')

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.start'),
            start
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.prep'),
            prep
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.attack'),
            attack
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.free'),
            free
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.defense'),
            defense
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.end'),
            end
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.constant'),
            constant
        )

        return result
    }

    _getEnemyTalents (actor, tokenId) {
        const result = this.initializeEmptyCategory('talent')

        const start = this._getTalentsByTiming(actor, tokenId, 'Start')
        const prep = this._getTalentsByTiming(actor, tokenId, 'Prep')
        const attack = this._getTalentsByManyTiming(actor, tokenId, [
            'Attack',
            'Melee',
            'Physical',
            'Ranged',
            'Magical'
        ])
        const defense = this._getTalentsByTiming(actor, tokenId, 'Defense')
        const end = this._getTalentsByTiming(actor, tokenId, 'End')
        const constant = this._getTalentsByTiming(actor, tokenId, 'Constant')
        const free = this._getTalentsByTiming(actor, tokenId, 'Free')

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.start'),
            start
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.prep'),
            prep
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.attack'),
            attack
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.free'),
            free
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.defense'),
            defense
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.end'),
            end
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.constant'),
            constant
        )

        return result
    }

    _getTalentsByManyTiming (actor, tokenId, timings) {
        const talent = actor.items.filter((a) =>
            timings.includes(a.system.timing)
        )
        const talentAction = this._produceMap(tokenId, talent, 'item')

        const talentCategory = this.initializeEmptySubcategory()
        talentCategory.actions = talentAction

        return talentCategory
    }

    _getTalentsByTiming (actor, tokenId, timing) {
        const talent = actor.items.filter((a) => a.system.timing === timing)
        const talentAction = this._produceMap(tokenId, talent, 'item')

        const talentCategory = this.initializeEmptySubcategory()
        talentCategory.actions = talentAction

        return talentCategory
    }

    _getItems (actor, tokenId) {
        const result = this.initializeEmptyCategory('item')

        const equipment = this._getItemByType(actor, tokenId, 'equipment')
        const sacraments = this._getItemByType(actor, tokenId, 'sacraments')
        const consumables = this._getItemByType(actor, tokenId, 'consumables')

        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.equipment'),
            equipment
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.sacraments'),
            sacraments
        )
        this._combineSubcategoryWithCategory(
            result,
            this.i18n('tokenActionHud.kamigakari.consumables'),
            consumables
        )

        return result
    }

    _getItemByType (actor, tokenId, type) {
        const item = actor.items.filter(
            (a) => a.system.class === type || a.type == type
        )
        const itemAction = this._produceMap(tokenId, item, 'item')

        const itemCategory = this.initializeEmptySubcategory()
        itemCategory.actions = itemAction

        return itemCategory
    }

    /** @private */
    _produceMap (tokenId, itemSet, actionType) {
        return itemSet
            .filter((i) => !!i)
            .map((i) => {
                const encodedValue = [actionType, tokenId, i.id].join(this.delimiter)
                const item = { name: i.name, encodedValue, id: i.id }

                if (actionType == 'item' && i.system.quantity !== undefined) { item.name = i.name + ' X ' + i.system.quantity }

                return item
            })
    }
}
