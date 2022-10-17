import { SystemManager } from './manager.js';
import {ActionHandlerGURPS} from "../actions/gurps/gurps-actions.js";
import { RollHandlerBaseGURPS as Core } from "../rollHandlers/gurps/gurps-base.js";
import * as systemSettings from '../settings/gurps-settings.js';

export class GURPSSystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }


    doGetActionHandler(character, categoryManager) {
        return new ActionHandlerGURPS(character, categoryManager);
    }

    doGetRollHandler(handlerId) {
        return new Core();
    }

    doRegisterSettings(appName, updateFunc) {
        systemSettings.register(appName, updateFunc);
    }


    getAvailableRollHandlers() {
        return { core: 'Core GURPS'};
    }
}
