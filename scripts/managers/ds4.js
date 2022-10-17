import { SystemManager } from "./manager.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { ActionHandlerDs4 as ActionHandler } from "../actions/ds4/ds4-actions.js";
import { RollHandlerBaseDs4 as Core } from "../rollHandlers/ds4/ds4-base.js";
import * as settings from "../settings/ds4-settings.js";

export class Ds4SystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetCategoryManager(user) {
    const categoryManager = new CategoryManager(user);
    return categoryManager;
  }

  /** @override */
  doGetActionHandler(character, categoryManager) {
    return new ActionHandler(character, categoryManager);
  }

  /** @override */
  getAvailableRollHandlers() {
    return { core: "Core DS4" };
  }

  /** @override */
  doGetRollHandler(handlerId) {
    return new Core();
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    settings.register(appName, updateFunc);
  }

  /** @override */
  async doRegisterDefaultFlags() {
    const defaults = {
      default: {
        categories: {
          checks: { 
            id: "checks",
            title: this.i18n("tokenActionHud.ds4.checks"),
            subcategories: {
              check_checks: { 
                id: "checks" ,
                title: this.i18n("tokenActionHud.ds4.checks"),
                type: "system"
              }
            }
          },
          weapons: { 
            id: "weapons",
            title: this.i18n("tokenActionHud.ds4.weapons"),
            subcategories: {
              weapons_weapons: { 
                id: "weapons" ,
                title: this.i18n("tokenActionHud.ds4.weapons"),
                type: "system"
              }
            }
          },
          spells: { 
            id: "spells",     
            title: this.i18n("tokenActionHud.ds4.spells"), 
            subcategories: {
              spells_spells: {
                id: "spells",
                title: this.i18n("tokenActionHud.ds4.spells"),
                type: "system"
              }
            }  
          },
          utility: { 
            id: "utility", 
            title: this.i18n("tokenActionHud.utility"),
            subcategories: {
              utility_combat: {
                id: "combat",
                title: this.i18n("tokenActionHud.combat"),
                type: "system"
              },
              utility_token: {
                id: "token",
                title: this.i18n("tokenActionHud.token"),
                type: "system"
              }
            }
          }
        },
        subcategories: [
          { id: "checks", title: this.i18n("tokenActionHud.ds4.checks"), type: "system" },
          { id: "weapons", title: this.i18n("tokenActionHud.ds4.weapons"), type: "system" },
          { id: "spells", title: this.i18n("tokenActionHud.ds4.spells"), type: "system" },
          { id: "combat", title: this.i18n("tokenActionHud.combat"), type: "system" },
          { id: "token", title: this.i18n("tokenActionHud.token"), type: "system" }
        ]
      } 
    }
    await game.user.update({flags: {"token-action-hud": defaults}})
  }
}
