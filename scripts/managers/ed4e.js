import { SystemManager } from './manager.js';
import {ActionHandlerED4e} from "../actions/ed4e/ed4e-actions.js";
import { RollHandlerBaseED4e as Core } from "../rollHandlers/ed4e/ed4e-base.js";
import * as systemSettings from '../settings/ed4e-settings.js';

export class ED4eSystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }


    doGetActionHandler(character, categoryManager) {
        return new ActionHandlerED4e(character, categoryManager);
    }

    doGetRollHandler(handlerId) {
        return new Core();
    }

    doRegisterSettings(appName, updateFunc) {
        systemSettings.register(appName, updateFunc);
    }


    getAvailableRollHandlers() {
        return { core: 'Core Earthdawn 4e'};
    }
}
