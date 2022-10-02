import { SystemManager } from "./manager.js";
import { ActionHandler5e as ActionHandler } from "../actions/dnd5e/dnd5e-actions.js";
import { ActionHandler5eGroupByType } from "../actions/dnd5e/dnd5e-actions-by-type.js";
import { CategoryManager } from "../categories/categoryManager.js";
import { MagicItemsPreRollHandler } from "../rollHandlers/dnd5e/pre-magicItems.js";
import { MagicItemActionListExtender } from "../actions/magicItemsExtender.js";
import { RollHandlerBase5e as Core } from "../rollHandlers/dnd5e/dnd5e-base.js";
import { RollHandlerMinorQol5e as MinorQol5e } from "../rollHandlers/dnd5e/dnd5e-minorqol.js";
import { RollHandlerObsidian as Obsidian5e } from "../rollHandlers/dnd5e/dnd5e-obsidian.js";
import * as settings from "../settings.js";
import * as systemSettings from "../settings/dnd5e-settings.js";

export class Dnd5eSystemManager extends SystemManager {
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
    let actionHandler;
    if (
      SystemManager.isModuleActive("character-actions-list-5e") &&
      settings.get("useActionList")
    ) {
      actionHandler = new ActionHandler5eGroupByType(
        character,
        categoryManager
      );
    } else {
      actionHandler = new ActionHandler(character, categoryManager);
    }

    if (SystemManager.isModuleActive("magicitems"))
      actionHandler.addFurtherActionHandler(new MagicItemActionListExtender());

    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let coreTitle = "Core D&D5e";

    if (SystemManager.isModuleActive("midi-qol"))
      coreTitle += ` [supports ${SystemManager.getModuleTitle("midi-qol")}]`;

    let choices = { core: coreTitle };
    SystemManager.addHandler(choices, "minor-qol");
    SystemManager.addHandler(choices, "obsidian");

    return choices;
  }

  /** @override */
  doGetRollHandler(handlerId) {
    let rollHandler;
    switch (handlerId) {
      case "minor-qol":
        rollHandler = new MinorQol5e();
        break;
      case "obsidian":
        rollHandler = new Obsidian5e();
        break;
      case "core":
      default:
        rollHandler = new Core();
        break;
    }

    if (SystemManager.isModuleActive("magicitems"))
      rollHandler.addPreRollHandler(new MagicItemsPreRollHandler());

    return rollHandler;
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    systemSettings.register(appName, updateFunc);
  }

  /** @override */
  async doRegisterDefaultFlags() {
    const defaults = {
      default: {
        categories: {
          inventory: { 
            id: "inventory",
            title: this.i18n("tokenActionHud.dnd5e.inventory"),
            subcategories: {
              inventory_weapons: { 
                id: "weapons" ,
                title: this.i18n("tokenActionHud.weapons"),
                type: "system"
              },
              inventory_equipment: {
                id: "equipment",
                title: this.i18n("tokenActionHud.equipment"),
                type: "system"
              },
              inventory_consumables: {
                id: "consumables",
                title: this.i18n("tokenActionHud.consumables"),
                type: "system"
              },
              inventory_tools: {
                id: "tools",
                title: this.i18n("tokenActionHud.tools"),
                type: "system"
              }
            }
          },
          features: { 
            id: "features",   
            title: this.i18n("tokenActionHud.features"),
            subcategories: {
              features_features: {
                id: "features",
                title: this.i18n("tokenActionHud.features"),
                type: "system"
              }
            }
          },
          spells: { 
            id: "spells",     
            title: this.i18n("tokenActionHud.spells"), 
            subcategories: {
              spells_spells: {
                id: "spells",
                title: this.i18n("tokenActionHud.spells"),
                type: "system"
              }
            }  
          },
          attributes: { 
            id: "attributes", 
            title: this.i18n("tokenActionHud.attributes"),
            subcategories: {
              attributes_checks: {
                id: "checks",
                title: this.i18n("tokenActionHud.checks"),
                type: "system"
              },
              attributes_skills: {
                id: "skills",
                title: this.i18n("tokenActionHud.skills"),
                type: "system"
              }
            }  
          },
          effects: { 
            id: "effects",    
            title: this.i18n("tokenActionHud.effects"),
            subcategories: {
              effects_effects: {
                id: "effects",
                title: this.i18n("tokenActionHud.effects"),
                type: "system"
              }
            }
          },
          conditions: { 
            id: "conditions", 
            title: this.i18n("tokenActionHud.conditions"),
            subcategories: {
              conditions_conditions: {
                id: "conditions",
                title: this.i18n("tokenActionHud.conditions"),
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
              },
              utility_rests: {
                id: "rests",
                title: this.i18n("tokenActionHud.rests"),
                type: "system"
              },
              utility_utility: {
                id: "utility",
                title: this.i18n("tokenActionHud.utility"),
                type: "system"
              }
            }
          }
        },
        subcategories: [
          { id: "abilities", title: this.i18n("tokenActionHud.abilities"), type: "system" },
          { id: "checks", title: this.i18n("tokenActionHud.checks"), type: "system" },
          { id: "combat", title: this.i18n("tokenActionHud.combat"), type: "system" },
          { id: "conditions", title: this.i18n("tokenActionHud.conditions"), type: "system" },
          { id: "consumables", title: this.i18n("tokenActionHud.consumables"), type: "system" },
          { id: "effects", title: this.i18n("tokenActionHud.effects"),vtype: "system" },
          { id: "equipment", title: this.i18n("tokenActionHud.equipment"), type: "system" },
          { id: "features", title: this.i18n("tokenActionHud.features"), type: "system" },
          { id: "rests", title: this.i18n("tokenActionHud.rests"), type: "system" },
          { id: "saves", title: this.i18n("tokenActionHud.saves"), type: "system" },
          { id: "skills", title: this.i18n("tokenActionHud.skills"), type: "system" },
          { id: "spells", title: this.i18n("tokenActionHud.spells"), type: "system" },
          { id: "token", title: this.i18n("tokenActionHud.token"), type: "system" },
          { id: "tools", title: this.i18n("tokenActionHud.tools"), type: "system" },
          { id: "weapons", title: this.i18n("tokenActionHud.weapons"), type: "system" },
          { id: "utility", title: this.i18n("tokenActionHud.utility"), type: "system" }
        ]
      } 
    }
    await game.user.update({flags: {"token-action-hud": defaults}})
  }
}
