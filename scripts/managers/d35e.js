import { SystemManager } from "./manager.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { ActionHandlerD35E as ActionHandler } from "../actions/d35e/d35e-actions.js";
import { RollHandlerBaseD35E as Core } from "../rollHandlers/d35e/d35e-base.js";
import * as settings from "../settings/d35e-settings.js";

export class D35ESystemManager extends SystemManager {
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
    let actionHandler = new ActionHandler(character, categoryManager);
    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let choices = { core: "Core D35E" };

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

  /** @override */
  async doRegisterDefaultFlags() {
    const defaults = {
      default: {
        categories: {
          attacks: { 
            id: "attacks",
            title: this.i18n("tokenActionHud.d35e.attacks"),
            subcategories: {
              attacks_attacks: { 
                id: "attacks" ,
                title: this.i18n("tokenActionHud.d35e.attacks"),
                type: "system"
              }
            }
          },
          buffs: { 
            id: "buffs",
            title: this.i18n("tokenActionHud.d35e.buffs"),
            subcategories: {
              buffs_buffs: { 
                id: "buffs" ,
                title: this.i18n("tokenActionHud.d35e.buffs"),
                type: "system"
              }
            }
          },
          inventory: { 
            id: "inventory",   
            title: this.i18n("tokenActionHud.d35e.inventory"),
            subcategories: {
              inventory_weapons: {
                id: "weapons",
                title: this.i18n("tokenActionHud.d35e.weapons"),
                type: "system"
              },
              inventory_equipment: {
                id: "equipment",
                title: this.i18n("tokenActionHud.d35e.equipment"),
                type: "system"
              },
              inventory_consumables: {
                id: "consumables",
                title: this.i18n("tokenActionHud.d35e.consumables"),
                type: "system"
              },
              inventory_inconsumables: {
                id: "inconsumables",
                title: this.i18n("tokenActionHud.d35e.inconsumables"),
                type: "system"
              },
              inventory_tools: {
                id: "tools",
                title: this.i18n("tokenActionHud.d35e.tools"),
                type: "system"
              },
              inventory_other: {
                id: "other",
                title: this.i18n("tokenActionHud.d35e.other"),
                type: "system"
              }
            }
          },
          spells: { 
            id: "spells",     
            title: this.i18n("tokenActionHud.d35e.spells"), 
            subcategories: {
              spells_spells: {
                id: "spells",
                title: this.i18n("tokenActionHud.d35e.spells"),
                type: "system"
              }
            }  
          },
          features: { 
            id: "features",     
            title: this.i18n("tokenActionHud.d35e.features"), 
            subcategories: {
              features_features: {
                id: "features",
                title: this.i18n("tokenActionHud.d35e.features"),
                type: "system"
              }
            }  
          },
          attributes: { 
            id: "attributes",     
            title: this.i18n("tokenActionHud.d35e.attributes"), 
            subcategories: {
              attributes_checks: {
                id: "checks",
                title: this.i18n("tokenActionHud.d35e.checks"),
                type: "system"
              },
              attributes_saves: {
                id: "saves",
                title: this.i18n("tokenActionHud.d35e.saves"),
                type: "system"
              },
              attributes_defenses: {
                id: "defenses",
                title: this.i18n("tokenActionHud.d35e.defenses"),
                type: "system"
              },
              attributes_skills: {
                id: "skills",
                title: this.i18n("tokenActionHud.d35e.skills"),
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
              utility_rest: {
                id: "rests",
                title: this.i18n("tokenActionHud.d35e.rests"),
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
          { id: "attacks", title: this.i18n("tokenActionHud.d35e.attacks"), type: "system" },
          { id: "buffs", title: this.i18n("tokenActionHud.d35e.buffs"), type: "system" },
          { id: "weapons", title: this.i18n("tokenActionHud.d35e.weapons"), type: "system" },
          { id: "equipment", title: this.i18n("tokenActionHud.d35e.equipment"), type: "system" },
          { id: "consumables", title: this.i18n("tokenActionHud.d35e.consumables"), type: "system" },
          { id: "inconsumables", title: this.i18n("tokenActionHud.d35e.inconsumables"), type: "system" },
          { id: "tools", title: this.i18n("tokenActionHud.d35e.tools"), type: "system" },
          { id: "other", title: this.i18n("tokenActionHud.d35e.other"), type: "system" },
          { id: "spells", title: this.i18n("tokenActionHud.d35e.spells"), type: "system" },
          { id: "features", title: this.i18n("tokenActionHud.d35e.features"), type: "system" },
          { id: "checks", title: this.i18n("tokenActionHud.d35e.checks"), type: "system" },
          { id: "saves", title: this.i18n("tokenActionHud.d35e.saves"), type: "system" },
          { id: "defenses", title: this.i18n("tokenActionHud.d35e.defenses"), type: "system" },
          { id: "skills", title: this.i18n("tokenActionHud.d35e.skills"), type: "system" },
          { id: "combat", title: this.i18n("tokenActionHud.combat"), type: "system" },
          { id: "rests", title: this.i18n("tokenActionHud.d35e.rests"), type: "system" },
          { id: "token", title: this.i18n("tokenActionHud.token"), type: "system" }
        ]
      } 
    }
    await game.user.update({flags: {"token-action-hud": defaults}})
  }
}
