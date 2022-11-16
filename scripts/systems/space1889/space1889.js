import { SystemManager } from '../../core/manager.js'
import { ActionHandlerSpace1889 } from './space1889-actions.js'
import { RollHandlerBaseSpace1889 as Core } from './space1889-base.js'
import * as systemSettings from './space1889-settings.js'

export class Space1889SystemManager extends SystemManager {
    doGetActionHandler (character, categoryManager) {
        return new ActionHandlerSpace1889(character, categoryManager)
    }

    doGetRollHandler (handlerId) {
        return new Core()
    }

    doRegisterSettings (appName, updateFunc) {
        systemSettings.register(appName, updateFunc)
    }

    getAvailableRollHandlers () {
        return { core: 'Core Space1889' }
    }
}
