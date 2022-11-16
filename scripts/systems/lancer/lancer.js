import { SystemManager } from '../../core/manager.js'
import { ActionHandlerLancer as ActionHandler } from './lancer-actions.js'
import { RollHandlerBaseLancer as Core } from './lancer-base.js'
import * as settings from './lancer-settings.js'

export class LancerSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        console.log('startup')
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core Lancer' }

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
