import { SystemManager } from '../../core/manager.js'
import { ActionHandlerPf2e as ActionHandler } from './pf2e-actions.js'
import { RollHandlerBasePf2e as Core } from './pf2e-base.js'
import * as settings from './pf2e-settings.js'

export class Pf2eSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core PF2E' }

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
