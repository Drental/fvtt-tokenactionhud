import { SystemManager } from '../../core/manager.js'
import { ActionHandlerStarWarsFFG as ActionHandler } from './starwarsffg-actions.js'
import { RollHandlerBaseStarWarsFFG as Core } from './starwarsffg-base.js'
import * as settings from './starwarsffg-settings.js'

export class StarWarsFFGSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        const actionHandler = new ActionHandler(character, categoryManager)
        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core starwarsffg' }
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
