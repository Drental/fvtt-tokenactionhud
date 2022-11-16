import { SystemManager } from '../../core/manager.js'
import { ActionHandlerSW5e as ActionHandler } from './sw5e-actions.js'
import { ActionHandlerSW5eGroupByType } from './sw5e-actions-by-type.js'
import { MagicItemsPreRollHandler } from './pre-magicItems.js'
import { MagicItemActionListExtender } from '../../core/actions/magicItemsExtender.js'
import { RollHandlerBaseSW5e as Core } from './sw5e-base.js'
import { RollHandlerMidiQolSW5e as MidiQolSW5e } from './sw5e-midiqol.js'
import { RollHandlerObsidianSW5e as ObsidianSW5e } from './sw5e-obsidian.js'
import * as settings from '../../core/settings.js'
import * as systemSettings from './sw5e-settings.js'

export class SW5eSystemManager extends SystemManager {
    /** @override */
    doGetActionHandler (character, categoryManager) {
        let actionHandler
        if (
            SystemManager.isModuleActive('character-actions-list-5e') &&
      settings.get('useActionList')
        ) {
            actionHandler = new ActionHandlerSW5eGroupByType(character, categoryManager)
        } else {
            actionHandler = new ActionHandler(character, categoryManager)
        }

        if (SystemManager.isModuleActive('magicitems')) { actionHandler.addFurtherActionHandler(new MagicItemActionListExtender()) }

        return actionHandler
    }

    /** @override */
    getAvailableRollHandlers () {
        let coreTitle = 'Core SW5e'

        if (SystemManager.isModuleActive('midi-qol')) { coreTitle += ` [supports ${SystemManager.getModuleTitle('midi-qol')}]` }

        const choices = { core: coreTitle }
        SystemManager.addHandler(choices, 'midi-qol')
        SystemManager.addHandler(choices, 'obsidian')

        return choices
    }

    /** @override */
    doGetRollHandler (handlerId) {
        let rollHandler
        switch (handlerId) {
        case 'midi-qol':
            rollHandler = new MidiQolSW5e()
            break
        case 'obsidian':
            rollHandler = new ObsidianSW5e()
            break
        case 'core':
        default:
            rollHandler = new Core()
            break
        }

        if (SystemManager.isModuleActive('magicitems')) { rollHandler.addPreRollHandler(new MagicItemsPreRollHandler()) }

        return rollHandler
    }

    /** @override */
    doRegisterSettings (appName, updateFunc) {
        systemSettings.register(appName, updateFunc)
    }
}
