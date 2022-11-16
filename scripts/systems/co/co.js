import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerCo as ActionHandler } from './co-actions.js'
import { RollHandlerBaseCo as Core } from './co-base.js'
import * as settings from './co-settings.js'

export class CoSystemManager extends SystemManager {
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
        const choices = { core: 'Core CO' }

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
                    stats: {
                        id: 'stats',
                        title: this.i18n('tokenActionHud.co.stats'),
                        subcategories: {
                            stats_stats: {
                                id: 'stats',
                                title: this.i18n('tokenActionHud.co.stats'),
                                type: 'system'
                            }
                        }
                    },
                    attacks: {
                        id: 'attacks',
                        title: this.i18n('tokenActionHud.co.attacks'),
                        subcategories: {
                            attacks_attacks: {
                                id: 'attacks',
                                title: this.i18n('tokenActionHud.co.attacks'),
                                type: 'system'
                            }
                        }
                    },
                    readyWeapons: {
                        id: 'readyWeapons',
                        title: this.i18n('tokenActionHud.co.weapons'),
                        subcategories: {
                            readyWeapons_readyWeapons: {
                                id: 'readyWeapons',
                                title: this.i18n('tokenActionHud.co.weapons'),
                                type: 'system'
                            }
                        }
                    },
                    readySpells: {
                        id: 'readySpells',
                        title: this.i18n('tokenActionHud.co.spells'),
                        subcategories: {
                            readySpells_readySpells: {
                                id: 'readySpells',
                                title: this.i18n('tokenActionHud.co.spells'),
                                type: 'system'
                            }
                        }
                    },
                    inventory: {
                        id: 'inventory',
                        title: this.i18n('tokenActionHud.co.inventory'),
                        subcategories: {
                            inventory_weapons: {
                                id: 'weapons',
                                title: this.i18n('tokenActionHud.co.weapons'),
                                type: 'system'
                            },
                            inventory_protections: {
                                id: 'protections',
                                title: this.i18n('tokenActionHud.co.protections'),
                                type: 'system'
                            },
                            inventory_consumables: {
                                id: 'consumables',
                                title: this.i18n('tokenActionHud.co.consumables'),
                                type: 'system'
                            },
                            inventory_spells: {
                                id: 'spells',
                                title: this.i18n('tokenActionHud.co.spells'),
                                type: 'system'
                            },
                            inventory_other: {
                                id: 'other',
                                title: this.i18n('tokenActionHud.co.other'),
                                type: 'system'
                            }
                        }
                    },
                    capacities: {
                        id: 'capacities',
                        title: this.i18n('tokenActionHud.co.capacities'),
                        subcategories: {
                            capacities_capacities: {
                                id: 'capacities',
                                title: this.i18n('tokenActionHud.co.capacities'),
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
                    { id: 'stats', title: this.i18n('tokenActionHud.co.stats'), type: 'system' },
                    { id: 'attacks', title: this.i18n('tokenActionHud.co.attacks'), type: 'system' },
                    { id: 'readyWeapons', title: this.i18n('tokenActionHud.co.weapons'), type: 'system' },
                    { id: 'readySpells', title: this.i18n('tokenActionHud.co.spells'), type: 'system' },
                    { id: 'inventory', title: this.i18n('tokenActionHud.co.inventory'), type: 'system' },
                    { id: 'capacities', title: this.i18n('tokenActionHud.co.capacities'), type: 'system' },
                    { id: 'combat', title: this.i18n('tokenActionHud.combat'), type: 'system' },
                    { id: 'token', title: this.i18n('tokenActionHud.token'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
