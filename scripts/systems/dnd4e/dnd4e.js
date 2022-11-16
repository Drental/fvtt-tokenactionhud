import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerDnD4e as ActionHandler } from './dnd4e-actions.js'
import { RollHandlerBaseDnD4e as Core } from './dnd4e-base.js'
import * as settings from './dnd4e-settings.js'

export class DnD4eSystemManager extends SystemManager {
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
        const choices = { core: 'Core dnd4e' }

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
                    attributes: {
                        id: 'attributes',
                        title: this.i18n('tokenActionHud.dnd4e.attributes'),
                        subcategories: {
                            attributes_abilities: {
                                id: 'abilities',
                                title: this.i18n('tokenActionHud.dnd4e.abilities'),
                                type: 'system'
                            },
                            attributes_skills: {
                                id: 'skills',
                                title: this.i18n('tokenActionHud.dnd4e.skills'),
                                type: 'system'
                            }
                        }
                    },
                    powers: {
                        id: 'powers',
                        title: this.i18n('tokenActionHud.dnd4e.powers'),
                        subcategories: {
                            powers_powers: {
                                id: 'powers',
                                title: this.i18n('tokenActionHud.dnd4e.powers'),
                                type: 'system'
                            }
                        }
                    },
                    features: {
                        id: 'features',
                        title: this.i18n('tokenActionHud.dnd4e.features'),
                        subcategories: {
                            features_features: {
                                id: 'features',
                                title: this.i18n('tokenActionHud.dnd4e.features'),
                                type: 'system'
                            }
                        }
                    },
                    inventory: {
                        id: 'inventory',
                        title: this.i18n('tokenActionHud.dnd4e.inventory'),
                        subcategories: {
                            inventory_weapons: {
                                id: 'weapons',
                                title: this.i18n('tokenActionHud.dnd4e.weapons'),
                                type: 'system'
                            },
                            inventory_equipment: {
                                id: 'equipment',
                                title: this.i18n('tokenActionHud.dnd4e.equipment'),
                                type: 'system'
                            },
                            inventory_consumables: {
                                id: 'consumables',
                                title: this.i18n('tokenActionHud.dnd4e.consumables'),
                                type: 'system'
                            },
                            inventory_tools: {
                                id: 'tools',
                                title: this.i18n('tokenActionHud.dnd4e.tools'),
                                type: 'system'
                            },
                            inventory_containers: {
                                id: 'containers',
                                title: this.i18n('tokenActionHud.dnd4e.containers'),
                                type: 'system'
                            },
                            inventory_loot: {
                                id: 'loot',
                                title: this.i18n('tokenActionHud.dnd4e.loot'),
                                type: 'system'
                            }
                        }
                    },
                    effects: {
                        id: 'effects',
                        title: this.i18n('tokenActionHud.effects'),
                        subcategories: {
                            effects_effects: {
                                id: 'effects',
                                title: this.i18n('tokenActionHud.effects'),
                                type: 'system'
                            }
                        }
                    },
                    conditions: {
                        id: 'conditions',
                        title: this.i18n('tokenActionHud.dnd4e.conditions'),
                        subcategories: {
                            conditions_conditions: {
                                id: 'conditions',
                                title: this.i18n('tokenActionHud.dnd4e.conditions'),
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
                            },
                            utility_utility: {
                                id: 'utility',
                                title: this.i18n('tokenActionHud.utility'),
                                type: 'system'
                            }
                        }
                    }
                },
                subcategories: [
                    { id: 'abilities', title: this.i18n('tokenActionHud.dnd4e.abilities'), type: 'system' },
                    { id: 'combat', title: this.i18n('tokenActionHud.combat'), type: 'system' },
                    { id: 'conditions', title: this.i18n('tokenActionHud.dnd4e.conditions'), type: 'system' },
                    { id: 'consumables', title: this.i18n('tokenActionHud.dnd4e.consumables'), type: 'system' },
                    { id: 'containers', title: this.i18n('tokenActionHud.dnd4e.containers'), type: 'system' },
                    { id: 'effects', title: this.i18n('tokenActionHud.effects'), vtype: 'system' },
                    { id: 'equipment', title: this.i18n('tokenActionHud.dnd4e.equipment'), type: 'system' },
                    { id: 'features', title: this.i18n('tokenActionHud.dnd4e.features'), type: 'system' },
                    { id: 'loot', title: this.i18n('tokenActionHud.dnd4e.loot'), type: 'system' },
                    { id: 'other', title: this.i18n('tokenActionHud.dnd4e.other'), type: 'system' },
                    { id: 'powers', title: this.i18n('tokenActionHud.dnd4e.powers'), type: 'system' },
                    { id: 'skills', title: this.i18n('tokenActionHud.dnd4e.skills'), type: 'system' },
                    { id: 'token', title: this.i18n('tokenActionHud.token'), type: 'system' },
                    { id: 'tools', title: this.i18n('tokenActionHud.dnd4e.tools'), type: 'system' },
                    { id: 'weapons', title: this.i18n('tokenActionHud.dnd4e.weapons'), type: 'system' },
                    { id: 'utility', title: this.i18n('tokenActionHud.utility'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
