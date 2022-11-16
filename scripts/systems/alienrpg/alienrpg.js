import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerAlienrpg as ActionHandler } from './alienrpg-actions.js'
import { RollHandlerBaseAlienrpg as Core } from './alienrpg-base.js'
import * as settings from './alienrpg-settings.js'

export class AlienRpgSystemManager extends SystemManager {
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
        const choices = { core: 'Core AlienRPG' }
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
                        title: this.i18n('tokenActionHud.alienRpg.attributes'),
                        subcategories: {
                            attributes_attributes: {
                                id: 'attributes',
                                title: this.i18n('tokenActionHud.alienRpg.attributes'),
                                type: 'system'
                            }
                        }
                    },
                    skills: {
                        id: 'skills',
                        title: this.i18n('tokenActionHud.alienRpg.skills'),
                        subcategories: {
                            skills_skills: {
                                id: 'skills',
                                title: this.i18n('tokenActionHud.alienRpg.skills'),
                                type: 'system'
                            }
                        }
                    },
                    inventory: {
                        id: 'inventory',
                        title: this.i18n('tokenActionHud.alienRpg.inventory'),
                        subcategories: {
                            inventory_weapons: {
                                id: 'weapons',
                                title: this.i18n('tokenActionHud.alienRpg.weapons'),
                                type: 'system'
                            },
                            inventory_armor: {
                                id: 'armor',
                                title: this.i18n('tokenActionHud.alienRpg.armor'),
                                type: 'system'
                            },
                            inventory_equipment: {
                                id: 'equipment',
                                title: this.i18n('tokenActionHud.alienRpg.equipment'),
                                type: 'system'
                            }
                        }
                    },
                    talents: {
                        id: 'talents',
                        title: this.i18n('tokenActionHud.alienRpg.talents'),
                        subcategories: {
                            talents_talents: {
                                id: 'talents',
                                title: this.i18n('tokenActionHud.alienRpg.talents'),
                                type: 'system'
                            }
                        }
                    },
                    agenda: {
                        id: 'agenda',
                        title: this.i18n('tokenActionHud.alienRpg.agenda'),
                        subcategories: {
                            agenda_agenda: {
                                id: 'agenda',
                                title: this.i18n('tokenActionHud.alienRpg.agenda'),
                                type: 'system'
                            }
                        }
                    },
                    consumables: {
                        id: 'consumables',
                        title: this.i18n('tokenActionHud.alienRpg.consumables'),
                        subcategories: {
                            consumables_consumables: {
                                id: 'consumables',
                                title: this.i18n('tokenActionHud.alienRpg.consumables'),
                                type: 'system'
                            }
                        }
                    },
                    power: {
                        id: 'power',
                        title: this.i18n('tokenActionHud.alienRpg.power'),
                        subcategories: {
                            power_power: {
                                id: 'power',
                                title: this.i18n('tokenActionHud.alienRpg.power'),
                                type: 'system'
                            }
                        }
                    },
                    conditions: {
                        id: 'conditions',
                        title: this.i18n('tokenActionHud.alienRpg.conditions'),
                        subcategories: {
                            conditions_conditions: {
                                id: 'conditions',
                                title: this.i18n('tokenActionHud.alienRpg.conditions'),
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
                    { id: 'challenge', title: this.i18n('tokenActionHud.demonLord.challengeRoll'), type: 'system' },
                    { id: 'weapons', title: this.i18n('tokenActionHud.demonLord.weapons'), type: 'system' },
                    { id: 'magic', title: this.i18n('tokenActionHud.demonLord.magic'), type: 'system' },
                    { id: 'talents', title: this.i18n('tokenActionHud.demonLord.talents'), type: 'system' },
                    { id: 'combat', title: this.i18n('tokenActionHud.combat'), type: 'system' },
                    { id: 'token', title: this.i18n('tokenActionHud.token'), type: 'system' },
                    { id: 'utility', title: this.i18n('tokenActionHud.utility'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
