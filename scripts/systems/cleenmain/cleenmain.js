import { SystemManager } from '../../core/manager.js'
import { CategoryManager } from '../../core/categoryManager.js'
import { ActionHandlerCleenmain as ActionHandler } from './cleenmain-actions.js'
import { RollHandlerBaseCleenmain as Core } from './cleenmain-base.js'
import * as settings from './cleenmain-settings.js'

export class CleenmainSystemManager extends SystemManager {
    /** @override */
    doGetCategoryManager (user) {
        const categoryManager = new CategoryManager(user)
        return categoryManager
    }

    /** @override */
    doGetActionHandler (character, categoryManager) {
        console.log('startup')
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core Cle en main' }

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
                    weapons: {
                        id: 'weapons',
                        title: this.i18n('tokenActionHud.cleenmain.weapons'),
                        subcategories: {
                            weapons_weapons: {
                                id: 'weapons',
                                title: this.i18n('tokenActionHud.cleenmain.weapons'),
                                type: 'system'
                            }
                        }
                    },
                    skills: {
                        id: 'skills',
                        title: this.i18n('tokenActionHud.cleenmain.skills'),
                        subcategories: {
                            skills_skills: {
                                id: 'skills',
                                title: this.i18n('tokenActionHud.cleenmain.skills'),
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
                    { id: 'weapons', title: this.i18n('tokenActionHud.cleenmain.weapons'), type: 'system' },
                    { id: 'skills', title: this.i18n('tokenActionHud.cleenmain.skills'), type: 'system' },
                    { id: 'combat', title: this.i18n('tokenActionHud.combat'), type: 'system' },
                    { id: 'token', title: this.i18n('tokenActionHud.token'), type: 'system' }
                ]
            }
        }
        await game.user.update({ flags: { 'token-action-hud': defaults } })
    }
}
