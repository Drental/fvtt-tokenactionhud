import { SystemManager } from './manager.js';
import {ActionHandlerSpace1889} from "../actions/space1889/space1889-actions.js";
import { RollHandlerBaseSpace1889 as Core } from "../rollHandlers/space1889/space1889-base.js";
import * as systemSettings from '../settings/space1889-settings.js';

export class Space1889SystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }


    doGetActionHandler(filterManager, categoryManager) {
        return new ActionHandlerSpace1889(filterManager, categoryManager);
    }

    doGetRollHandler(handlerId) {
        return new Core();
    }

    doRegisterSettings(appName, updateFunc) {
        systemSettings.register(appName, updateFunc);
    }


    getAvailableRollHandlers() {
        return { core: 'Core Space1889'};
    }
}
