import { SystemManager } from '../../core/manager.js'
import { ActionHandlerOD6S as ActionHandler } from './od6s-actions.js'
import { RollHandlerCoreOD6S as Core } from './od6s-base.js'
import * as settings from './od6s-settings.js'

export class OD6SSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core OD6S' }

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
