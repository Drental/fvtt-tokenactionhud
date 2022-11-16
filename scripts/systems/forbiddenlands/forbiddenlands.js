import { SystemManager } from '../../core/manager.js'
import { ActionHandlerForbiddenlands as ActionHandler } from './forbiddenlands-actions.js'
import { RollHandlerBaseForbiddenlands as Core } from './forbiddenlands-base.js'
import * as settings from './forbiddenlands-settings.js'

export class ForbiddenLandsSystemManager extends SystemManager {
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
}
