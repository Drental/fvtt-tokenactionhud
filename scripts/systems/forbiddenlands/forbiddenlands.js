import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerForbiddenlands as ActionHandler } from './forbiddenlands-actions.js'
import { RollHandlerBaseForbiddenlands as Core } from './forbiddenlands-base.js'
import * as settings from './forbiddenlands-settings.js'

export class ForbiddenLandsSystemManager extends SystemManager {
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
        const choices = { core: 'Core Forbidden Lands' }

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
                        title: this.i18n('FLCG.ATTRIBUTES'),
                        subcategories: {
                            attributes_attributes: {
                                id: 'attributes',
                                title: this.i18n('FLCG.ATTRIBUTES'),
                                type: 'system'
                            }
                        }
                    },
                    skills: {
                        id: 'skills',
                        title: this.i18n('FLCG.SKILLS'),
                        subcategories: {
                            skills_skills: {
                                id: 'skills',
                                title: this.i18n('FLCG.SKILLS'),
                                type: 'system'
                            }
                        }
                    },
                    attacks: {
                        id: 'attacks',
                        title: this.i18n('tokenActionHud.forbiddenLands.attacks'),
                        subcategories: {
                            attacks_attacks: {
                                id: 'attacks',
                                title: this.i18n('tokenActionHud.forbiddenLands.attacks'),
                                type: 'system'
                            }
                        }
                    },
                    inventory: {
                        id: 'inventory',
                        title: this.i18n('tokenActionHud.forbiddenLands.inventory'),
                        subcategories: {
                            inventory_weapons: {
                                id: 'weapons',
                                title: this.i18n('tokenActionHud.forbiddenLands.weapons'),
                                type: 'system'
                            },
                            inventory_armors: {
                                id: 'armors',
                                title: this.i18n('tokenActionHud.forbiddenLands.armors'),
                                type: 'system'
                            },
                            inventory_equipment: {
                                id: 'equipment',
                                title: this.i18n('tokenActionHud.forbiddenLands.equipment'),
                                type: 'system'
                            }
                        }
                    },
                    talents: {
                        id: 'talents',
                        title: this.i18n('tokenActionHud.forbiddenLands.talents'),
                        subcategories: {
                            talents_talents: {
                                id: 'talents',
                                title: this.i18n('tokenActionHud.forbiddenLands.talents'),
                                type: 'system'
                            }
                        }
                    },
                    spells: {
                        id: 'spells',
                        title: this.i18n('MAGIC.SPELLS'),
                        subcategories: {
                            spells_spells: {
                                id: 'spells',
                                title: this.i18n('MAGIC.SPELLS'),
                                type: 'system'
                            }
                        }
                    },
                    consumables: {
                        id: 'consumables',
                        title: this.i18n('tokenActionHud.forbiddenLands.consumables'),
                        subcategories: {
                            consumables_consumables: {
                                id: 'consumables',
                                title: this.i18n('tokenActionHud.forbiddenLands.consumables'),
                                type: 'system'
                            }
                        }
                    },
                    conditions: {
                        id: 'conditions',
                        title: this.i18n('tokenActionHud.forbiddenLands.conditions'),
                        subcategories: {
                            conditions_conditions: {
                                id: 'conditions',
                                title: this.i18n('tokenActionHud.forbiddenLands.conditions'),
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
                    { id: 'armors', title: this.i18n('tokenActionHud.forbiddenLands.armors'), type: 'system' },
                    { id: 'attacks', title: this.i18n('tokenActionHud.forbiddenLands.attacks'), type: 'system' },
                    { id: 'attributes', title: this.i18n('FLCG.ATTRIBUTES'), type: 'system' },
                    { id: 'combat', title: this.i18n('tokenActionHud.combat'), type: 'system' },
                    { id: 'conditions', title: this.i18n('tokenActionHud.forbiddenLands.conditions'), type: 'system' },
                    { id: 'consumables', title: this.i18n('tokenActionHud.forbiddenLands.consumables'), type: 'system' },
                    { id: 'equipment', title: this.i18n('tokenActionHud.forbiddenLands.equipment'), type: 'system' },
                    { id: 'skills', title: this.i18n('FLCG.SKILLS'), type: 'system' },
                    { id: 'spells', title: this.i18n('MAGIC.SPELLS'), type: 'system' },
                    { id: 'talents', title: this.i18n('tokenActionHud.forbiddenLands.talents'), type: 'system' },
                    { id: 'token', title: this.i18n('tokenActionHud.token'), type: 'system' },
                    { id: 'weapons', title: this.i18n('tokenActionHud.forbiddenLands.weapons'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
