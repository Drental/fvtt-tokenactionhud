import { SystemManager } from '../../core/manager.js'
import { ActionHandlerSwade as ActionHandler } from './swade-actions.js'
import { RollHandlerBaseSwade as Core } from './swade-base.js'
import { RollHandlerBR2SWSwade as BR2SW } from './swade-br2sw.js'
import * as settings from './swade-settings.js'

export class SwadeSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        return new ActionHandler(character, categoryManager)
    }

    /** @override */
    getAvailableRollHandlers () {
        const choices = { core: 'Core SWADE' }
        SystemManager.addHandler(choices, 'betterrolls-swade2')

        return choices
    }

    /** @override */
    doGetRollHandler (handlerId) {
        switch (handlerId) {
        case 'betterrolls-swade2':
            return new BR2SW()
        default:
            return new Core()
        }
    }

    /** @override */
    doRegisterSettings (appName, updateFunc) {
        settings.register(appName, updateFunc)
    }
}
