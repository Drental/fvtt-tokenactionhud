import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerED4e } from './ed4e-actions.js'
import { RollHandlerBaseED4e as Core } from './ed4e-base.js'
import * as systemSettings from './ed4e-settings.js'

export class ED4eSystemManager extends SystemManager {
    /** @override */
    doGetCategoryManager (user) {
        const categoryManager = new CategoryManager(user)
        return categoryManager
    }

    doGetActionHandler (character, categoryManager) {
        return new ActionHandlerED4e(character, categoryManager)
    }

    doGetRollHandler (handlerId) {
        return new Core()
    }

    doRegisterSettings (appName, updateFunc) {
        systemSettings.register(appName, updateFunc)
    }

    getAvailableRollHandlers () {
        return { core: 'Core Earthdawn 4e' }
    }

    /** @override */
    async doRegisterDefaultFlags () {
        const defaults = {
            default: {
                categories: {
                    damage: {
                        id: 'general',
                        title: this.i18n('tokenActionHud.general'),
                        subcategories: {
                            general_attributes: {
                                id: 'attributes',
                                title: this.i18n('earthdawn.a.attributes'),
                                type: 'system'
                            },
                            general_other: {
                                id: 'other',
                                title: this.i18n('earthdawn.o.other'),
                                type: 'system'
                            },
                            general_systems: {
                                id: 'systems',
                                title: this.i18n('tokenActionHud.ed4e.systems'),
                                type: 'system'
                            }
                        }
                    },
                    favorites: {
                        id: 'favorites',
                        title: this.i18n('earthdawn.h.hotlist'),
                        subcategories: {
                            favorites_favorites: {
                                id: 'favorites',
                                title: this.i18n('earthdawn.h.hotlist'),
                                type: 'system'
                            }
                        }
                    },
                    talents: {
                        id: 'talents',
                        title: this.i18n('earthdawn.t.talents'),
                        subcategories: {
                            talents_talents: {
                                id: 'talents',
                                title: this.i18n('earthdawn.t.talents'),
                                type: 'system'
                            }
                        }
                    },
                    matrixes: {
                        id: 'matrixes',
                        title: this.i18n('earthdawn.m.matrixes'),
                        subcategories: {
                            matrixes_matrixes: {
                                id: 'matrixes',
                                title: this.i18n('earthdawn.m.matrixes'),
                                type: 'system'
                            }
                        }
                    },
                    skills: {
                        id: 'skills',
                        title: this.i18n('earthdawn.s.skills'),
                        subcategories: {
                            skills_skills: {
                                id: 'skills',
                                title: this.i18n('earthdawn.s.skills'),
                                type: 'system'
                            }
                        }
                    },
                    inventory: {
                        id: 'inventory',
                        title: this.i18n('earthdawn.i.inventory'),
                        subcategories: {
                            inventory_weapons: {
                                id: 'weapons',
                                title: this.i18n('earthdawn.w.weapons'),
                                type: 'system'
                            },
                            inventory_armors: {
                                id: 'armors',
                                title: this.i18n('earthdawn.a.armors'),
                                type: 'system'
                            },
                            inventory_shields: {
                                id: 'shields',
                                title: this.i18n('earthdawn.s.shields'),
                                type: 'system'
                            },
                            inventory_equipment: {
                                id: 'equipment',
                                title: this.i18n('earthdawn.e.equipment'),
                                type: 'system'
                            }
                        }
                    },
                    combat: {
                        id: 'combat',
                        title: this.i18n('earthdawn.c.combat'),
                        subcategories: {
                            combat_weaponAttacks: {
                                id: 'weaponAttacks',
                                title: `${this.i18n('earthdawn.w.weapon')} ${this.i18n('earthdawn.a.attacks')}`,
                                type: 'system'
                            },
                            combat_combatOptions: {
                                id: 'combatOptions',
                                title: this.i18n('earthdawn.c.combatOptions'),
                                type: 'system'
                            },
                            combat_actions: {
                                id: 'actions',
                                title: this.i18n('earthdawn.a.actions'),
                                type: 'system'
                            }
                        }
                    },
                    creatureAttacks: {
                        id: 'creatureAttacks',
                        title: this.i18n('earthdawn.a.attacks'),
                        subcategories: {
                            creatureAttacks_creatureAttacks: {
                                id: 'creatureAttacks',
                                title: this.i18n('earthdawn.a.attacks'),
                                type: 'system'
                            }
                        }
                    },
                    creaturePowers: {
                        id: 'creaturePowers',
                        title: this.i18n('earthdawn.p.powers'),
                        subcategories: {
                            creaturePowers_creaturePowers: {
                                id: 'creaturePowers',
                                title: this.i18n('earthdawn.p.powers'),
                                type: 'system'
                            }
                        }
                    },
                    creatureManeuvers: {
                        id: 'creatureManeuvers',
                        title: this.i18n('earthdawn.m.maneuvers'),
                        subcategories: {
                            creatureManeuvers_creatureManeuvers: {
                                id: 'creatureManeuvers',
                                title: this.i18n('earthdawn.m.maneuvers'),
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
                    { id: 'actions', title: this.i18n('earthdawn.a.actions'), type: 'system' },
                    { id: 'armors', title: this.i18n('earthdawn.a.armors'), type: 'system' },
                    { id: 'attributes', title: this.i18n('earthdawn.a.attributes'), type: 'system' },
                    { id: 'combat', title: this.i18n('tokenActionHud.combat'), type: 'system' },
                    { id: 'combatOptions', title: this.i18n('earthdawn.c.combatOptions'), type: 'system' },
                    { id: 'creatureAttacks', title: this.i18n('earthdawn.a.attacks'), type: 'system' },
                    { id: 'creatureManeuvers', title: this.i18n('earthdawn.m.maneuvers'), type: 'system' },
                    { id: 'creaturePowers', title: this.i18n('earthdawn.p.powers'), type: 'system' },
                    { id: 'equipment', title: this.i18n('earthdawn.e.equipment'), type: 'system' },
                    { id: 'favorites', title: this.i18n('earthdawn.h.hotlist'), type: 'system' },
                    { id: 'matrixes', title: this.i18n('earthdawn.m.matrixes'), type: 'system' },
                    { id: 'other', title: this.i18n('earthdawn.o.other'), type: 'system' },
                    { id: 'shields', title: this.i18n('earthdawn.s.shields'), type: 'system' },
                    { id: 'skills', title: this.i18n('earthdawn.s.skills'), type: 'system' },
                    { id: 'systems', title: this.i18n('tokenActionHud.ed4e.systems'), type: 'system' },
                    { id: 'talents', title: this.i18n('earthdawn.t.talents'), type: 'system' },
                    { id: 'token', title: this.i18n('tokenActionHud.token'), type: 'system' },
                    { id: 'weaponAttacks', title: `${this.i18n('earthdawn.w.weapon')} ${this.i18n('earthdawn.a.attacks')}`, type: 'system' },
                    { id: 'weapons', title: this.i18n('earthdawn.w.weapons'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
