import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerDw as ActionHandler } from './dungeonWorld-actions.js'
import { RollHandlerBaseDw as Core } from './dungeonWorld-base.js'
import * as settings from './dungeonWorld-settings.js'

export class DungeonWorldSystemManager extends SystemManager {
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
        const choices = { core: 'Core dungeonWorld' }

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
                    damage: {
                        id: 'damage',
                        title: this.i18n('DW.Damage'),
                        subcategories: {
                            damage_damage: {
                                id: 'damage',
                                title: this.i18n('DW.Damage'),
                                type: 'system'
                            }
                        }
                    },
                    tags: {
                        id: 'tags',
                        title: this.i18n('DW.Tags'),
                        subcategories: {
                            tags_tags: {
                                id: 'tags',
                                title: this.i18n('DW.Tags'),
                                type: 'system'
                            }
                        }
                    },
                    instincts: {
                        id: 'instincts',
                        title: this.i18n('tokenActionHud.dungeonWorld.instincts'),
                        subcategories: {
                            instincts_instincts: {
                                id: 'instincts',
                                title: this.i18n('tokenActionHud.dungeonWorld.instincts'),
                                type: 'system'
                            }
                        }
                    },
                    specialQualities: {
                        id: 'specialQualities',
                        title: this.i18n('DW.SpecialQualities'),
                        subcategories: {
                            specialQualities_specialQualities: {
                                id: 'specialQualities',
                                title: this.i18n('DW.SpecialQualities'),
                                type: 'system'
                            }
                        }
                    },
                    startingMoves: {
                        id: 'startingMoves',
                        title: this.i18n('DW.MovesStarting'),
                        subcategories: {
                            startingMoves_startingMoves: {
                                id: 'startingMoves',
                                title: this.i18n('DW.MovesStarting'),
                                type: 'system'
                            }
                        }
                    },
                    basicMoves: {
                        id: 'basicMoves',
                        title: this.i18n('DW.MovesBasic'),
                        subcategories: {
                            basicMoves_basicMoves: {
                                id: 'basicMoves',
                                title: this.i18n('DW.MovesBasic'),
                                type: 'system'
                            }
                        }
                    },
                    advancedMoves: {
                        id: 'advancedMoves',
                        title: this.i18n('DW.MovesAdvanced'),
                        subcategories: {
                            advancedMoves_advancedMoves: {
                                id: 'advancedMoves',
                                title: this.i18n('DW.MovesAdvanced'),
                                type: 'system'
                            }
                        }
                    },
                    specialMoves: {
                        id: 'specialMoves',
                        title: this.i18n('DW.MovesSpecial'),
                        subcategories: {
                            specialMoves_specialMoves: {
                                id: 'specialMoves',
                                title: this.i18n('DW.MovesSpecial'),
                                type: 'system'
                            }
                        }
                    },
                    monsterMoves: {
                        id: 'monsterMoves',
                        title: this.i18n('tokenActionHud.dungeonWorld.monsterMoves'),
                        subcategories: {
                            monsterMoves_monsterMoves: {
                                id: 'monsterMoves',
                                title: this.i18n('tokenActionHud.dungeonWorld.monsterMoves'),
                                type: 'system'
                            }
                        }
                    },
                    spells: {
                        id: 'spells',
                        title: this.i18n('DW.Spells'),
                        subcategories: {
                            spells_spells: {
                                id: 'spells',
                                title: this.i18n('DW.Spells'),
                                type: 'system'
                            }
                        }
                    },
                    equipment: {
                        id: 'equipment',
                        title: this.i18n('DW.Equipment'),
                        subcategories: {
                            equipment_equipment: {
                                id: 'equipment',
                                title: this.i18n('DW.Equipment'),
                                type: 'system'
                            }
                        }
                    },
                    abilities: {
                        id: 'abilities',
                        title: this.i18n('tokenActionHud.dungeonWorld.abilities'),
                        subcategories: {
                            abilities_abilities: {
                                id: 'abilities',
                                title: this.i18n('tokenActionHud.dungeonWorld.abilities'),
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
                    { id: 'abilities', title: this.i18n('tokenActionHud.dungeonWorld.abilities'), type: 'system' },
                    { id: 'advancedMoves', title: this.i18n('DW.MovesAdvanced'), type: 'system' },
                    { id: 'basicMoves', title: this.i18n('DW.MovesBasic'), type: 'system' },
                    { id: 'damage', title: this.i18n('DW.Damage'), type: 'system' },
                    { id: 'equipment', title: this.i18n('DW.Equipment'), type: 'system' },
                    { id: 'instincts', title: this.i18n('tokenActionHud.dungeonWorld.instincts'), type: 'system' },
                    { id: 'monsterMoves', title: this.i18n('tokenActionHud.dungeonWorld.monsterMoves'), type: 'system' },
                    { id: 'specialMoves', title: this.i18n('DW.MovesSpecial'), type: 'system' },
                    { id: 'specialQualities', title: this.i18n('DW.SpecialQualities'), type: 'system' },
                    { id: 'spells', title: this.i18n('DW.Spells'), type: 'system' },
                    { id: 'startingMoves', title: this.i18n('DW.MovesStarting'), type: 'system' },
                    { id: 'tags', title: this.i18n('DW.Tags'), type: 'system' },
                    { id: 'utility', title: this.i18n('tokenActionHud.utility'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
