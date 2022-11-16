import * as settings from './settings.js'
import { Logger } from './logger.js'
import { CategoryManager } from './categoryManager.js'
import { ItemMacroActionListExtender } from './actions/itemMacroExtender.js'
import { CompendiumMacroPreHandler } from './rollHandler/compendiumMacroPreHandler.js'
import { ItemMacroPreRollHandler } from './rollHandler/pre-itemMacro.js'
import { CompendiumActionHandler } from './actions/compendiumActionHandler.js'

export class SystemManager {
    i18n = (toTranslate) => game.i18n.localize(toTranslate)

    appName
    constructor (appName) {
        this.appName = appName
    }

    doGetCategoryManager () {}

    /** ACTION HANDLERS */
    /** OVERRIDDEN BY SYSTEM */

    doGetActionHandler () {}
    doGetRollHandler (handlerId) {}
    getAvailableRollHandlers () {}
    doRegisterSettings (appName, updateFunc) {}
    async doRegisterDefaultFlags () {}

    async registerDefaultFlags () {
        await this.doRegisterDefaultFlags()
    }

    async getActionHandler (user) {
        const actionHandler = this.doGetActionHandler(
            this.categoryManager
        )
        this.addActionExtenders(actionHandler)
        return actionHandler
    }

    async getCompendiumActionHandler (user) {
        const compendiumActionHandler = new CompendiumActionHandler(this.categoryManager)
        return compendiumActionHandler
    }

    addActionExtenders (actionHandler) {
        if (SystemManager.isModuleActive('itemacro')) { actionHandler.addFurtherActionHandler(new ItemMacroActionListExtender()) }
    }

    categoryManager
    async getCategoryManager (user) {
        const categoryManager = this.doGetCategoryManager(user)
        await categoryManager.init()
        return categoryManager
    }

    /** ROLL HANDLERS */

    getRollHandler () {
        let rollHandlerId = settings.get('rollHandler')

        if (
            !(rollHandlerId === 'core' || SystemManager.isModuleActive(rollHandlerId))
        ) {
            Logger.error(rollHandlerId, this.i18n('tokenActionHud.handlerNotFound'))
            rollHandlerId = 'core'
            settings.set('rollHandler', rollHandlerId)
        }

        const rollHandler = this.doGetRollHandler(rollHandlerId)
        this.addPreHandlers(rollHandler)
        return rollHandler
    }

    addPreHandlers (rollHandler) {
        rollHandler.addPreRollHandler(new CompendiumMacroPreHandler())

        if (SystemManager.isModuleActive('itemacro')) { rollHandler.addPreRollHandler(new ItemMacroPreRollHandler()) }
    }

    /** SETTINGS */

    registerSettings () {
        const rollHandlers = this.getAvailableRollHandlers()
        settings.registerSettings(this.appName, this, rollHandlers)
    }

    /** UTILITY */

    static addHandler (choices, id) {
        if (SystemManager.isModuleActive(id)) {
            const title = SystemManager.getModuleTitle(id)
            mergeObject(choices, { [id]: title })
        }
    }

    static isModuleActive (id) {
        const module = game.modules.get(id)
        return module && module.active
    }

    static getModuleTitle (id) {
        return game.modules.get(id)?.title ?? ''
    }
}
