import { SystemManager } from '../../core/manager.js'
import { ActionHandlerSymbaroum as ActionHandler } from './symbaroum-actions.js'
import { RollHandlerBaseSymbaroum as Core } from './symbaroum-base.js'
import * as settings from './symbaroum-settings.js'

export class SymbaroumSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        console.log('startup')
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core Symbaroum' }

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
