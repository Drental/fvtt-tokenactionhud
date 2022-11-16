import { SystemManager } from '../../core/manager.js'
import { ActionHandlerSfrpg as ActionHandler } from './sfrpg-actions.js'
import { RollHandlerBaseSfrpg as Core } from './sfrpg-base.js'
import * as settings from './sfrpg-settings.js'

export class SfrpgSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core Starfinder' }

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
