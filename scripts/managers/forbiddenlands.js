import { SystemManager } from './manager.js';
import { ActionHandlerForbiddenlands as ActionHandler } from '../actions/forbiddenlands/forbiddenlands-actions.js'
import { RollHandlerBaseForbiddenlands as Core } from '../rollHandlers/forbiddenlands/forbiddenlands-base.js';
import * as settings from '../settings/forbiddenlands-settings.js'

export class ForbiddenLandsSystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }

    /** @override */
    doGetActionHandler(filterManager, categoryManager) {
        let actionHandler = new ActionHandler(filterManager, categoryManager);
        return actionHandler;
    }

    /** @override */
    getAvailableRollHandlers() {
        let choices = { 'core': 'Core Forbidden Lands' };

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        return new Core();
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        settings.register(appName, updateFunc);
    }
}