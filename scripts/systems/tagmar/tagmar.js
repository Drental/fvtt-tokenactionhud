import { SystemManager } from '../../core/manager.js'
import { TagmarActionHandler as ActionHandler } from './tagmar-actions.js'
import { TagmarHandler as Core } from './tagmar-base.js'

export class TagmarSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)

        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const coreTitle = 'Tagmar RPG'

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
