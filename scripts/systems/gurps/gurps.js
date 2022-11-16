import { SystemManager } from '../../core/manager.js'
import { ActionHandlerGURPS } from './gurps-actions.js'
import { RollHandlerBaseGURPS as Core } from './gurps-base.js'
import * as systemSettings from './gurps-settings.js'

export class GURPSSystemManager extends SystemManager {
    doGetActionHandler (character, categoryManager) {
        return new ActionHandlerGURPS(character, categoryManager)
    }

    doGetRollHandler (handlerId) {
        return new Core()
    }

    doRegisterSettings (appName, updateFunc) {
        systemSettings.register(appName, updateFunc)
    }

    getAvailableRollHandlers () {
        return { core: 'Core GURPS' }
    }
}
