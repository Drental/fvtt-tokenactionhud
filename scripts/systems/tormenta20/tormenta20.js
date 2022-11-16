import { SystemManager } from '../../core/manager.js'
import { ActionHandlerT20 as ActionHandler } from './tormenta20-actions.js'
import { RollHandlerBaseT20 as Core } from './tormenta20-base.js'

export class Tormenta20SystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)

        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const coreTitle = 'Tormenta20'

        const choices = { core: coreTitle }

        return choices
    }

    /** @override */
    doGetRollHandler (handlerId) {
        let rollHandler
        switch (handlerId) {
        case 'core':
        default:
            rollHandler = new Core()
            break
        }

        return rollHandler
    }

    /** @override */
    doRegisterSettings (appName, updateFunc) {
    // settings.register(appName, updateFunc);
    }
}
