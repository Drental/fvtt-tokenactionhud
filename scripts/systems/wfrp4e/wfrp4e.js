import { SystemManager } from '../../core/manager.js'
import { ActionHandlerWfrp as ActionHandler } from './wfrp4e-actions.js'
import { RollHandlerBaseWfrp4e as Core } from './wfrp-base.js'
import * as settings from './wfrp4e-settings.js'

export class Wfrp4eSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core WFRP4e' }

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
