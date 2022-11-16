import { SystemManager } from '../../core/manager.js'
import { ActionHandlerPf1 as ActionHandler } from './pf1-actions.js'
import { RollHandlerBasePf1 as Core } from './pf1-base.js'
import * as settings from './pf1-settings.js'

export class Pf1SystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core PF1' }

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
