import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerCthack as ActionHandler } from './cthack-actions.js'
import { RollHandlerBaseCthack as Core } from './cthack-base.js'
import * as settings from './cthack-settings.js'

export class CthackSystemManager extends SystemManager {
    /** @override */
    doGetCategoryManager (user) {
        const categoryManager = new CategoryManager(user)
        return categoryManager
    }

    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core Cthack' }
        return choices
    }

    /** @override */
    doGetRollHandler (handlerId) {
        return new Core()
    }

    /** @override */
    doRegisterSettings (appName, updateFunc) {
        settings.register(appName, updateFunc)
    }

    /** @override */
    async doRegisterDefaultFlags () {
        const defaults = {
            default: {
                categories: {
                    saves: {
                        id: 'saves',
                        title: this.i18n('tokenActionHud.cthack.saves'),
                        subcategories: {
                            saves_saves: {
                                id: 'saves',
                                title: this.i18n('tokenActionHud.cthack.saves'),
                                type: 'system'
                            }
                        }
                    },
                    attributes: {
                        id: 'attributes',
                        title: this.i18n('tokenActionHud.cthack.attributes'),
                        subcategories: {
                            attributes_attributes: {
                                id: 'attributes',
                                title: this.i18n('tokenActionHud.cthack.attributes'),
                                type: 'system'
                            }
                        }
                    },
                    inventory: {
                        id: 'inventory',
                        title: this.i18n('tokenActionHud.cthack.inventory'),
                        subcategories: {
                            inventory_weapons: {
                                id: 'weapons',
                                title: this.i18n('tokenActionHud.cthack.weapons'),
                                type: 'system'
                            },
                            inventory_equipment: {
                                id: 'equipment',
                                title: this.i18n('tokenActionHud.cthack.equipment'),
                                type: 'system'
                            }
                        }
                    },
                    abilities: {
                        id: 'abilities',
                        title: this.i18n('tokenActionHud.cthack.abilities'),
                        subcategories: {
                            abilities_abilities: {
                                id: 'abilities',
                                title: this.i18n('tokenActionHud.cthack.abilities'),
                                type: 'system'
                            }
                        }
                    },
                    utility: {
                        id: 'utility',
                        title: this.i18n('tokenActionHud.utility'),
                        subcategories: {
                            utility_combat: {
                                id: 'combat',
                                title: this.i18n('tokenActionHud.combat'),
                                type: 'system'
                            },
                            utility_token: {
                                id: 'token',
                                title: this.i18n('tokenActionHud.token'),
                                type: 'system'
                            }
                        }
                    }
                },
                subcategories: [
                    {
                        id: 'saves',
                        title: this.i18n('tokenActionHud.cthack.saves'),
                        type: 'system'
                    },
                    {
                        id: 'attributes',
                        title: this.i18n('tokenActionHud.cthack.attributes'),
                        type: 'system'
                    },
                    {
                        id: 'inventory',
                        title: this.i18n('tokenActionHud.cthack.inventory'),
                        type: 'system'
                    },
                    {
                        id: 'abilities',
                        title: this.i18n('tokenActionHud.cthack.abilities'),
                        type: 'system'
                    },
                    {
                        id: 'combat',
                        title: this.i18n('tokenActionHud.combat'),
                        type: 'system'
                    },
                    {
                        id: 'token',
                        title: this.i18n('tokenActionHud.token'),
                        type: 'system'
                    }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
