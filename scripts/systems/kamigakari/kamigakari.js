import { SystemManager } from '../../core/manager.js'
import { ActionHandlerKg as ActionHandler } from './kamigakari-actions.js'
import { RollHandlerBaseKg as Core } from './kamigakari-base.js'
import * as settings from './kamigakari-settings.js'

export class KamigakariSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core Kamigakari' }

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
}
