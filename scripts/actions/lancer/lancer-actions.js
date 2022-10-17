import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerLancer extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let actorId = token.actor.id;
    result.actorId = actorId;
    let actor = token.actor;
    let mm = await actor.system.derived.mm;

    if (!actor) return result;

    switch (actor.type) {
      case "pilot":
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.lancer.pilot"),
          this._pilotCategory(mm, actorId)
        );
        break;
      case "mech":
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.lancer.pilot"),
          this._pilotCategory(mm.Pilot, mm.Pilot.RegistryID)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.lancer.mech"),
          this._mechCategory(mm, actorId)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.weapons"),
          this._weaponsCategory(mm.Loadout.WepMounts, actorId)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.lancer.systems"),
          this._systemsCategory(mm.Loadout.SysMounts, actorId)
        );
        break;
      case "npc":
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.lancer.stats"),
          this._npcBaseCategory(actor, actorId)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenActionHud.features"),
          this._npcFeatureCategory(actor, actorId)
        );
        break;
    }

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  _makeAction(actionName, actionType, actorId, actionId, option) {
    let action = this.initializeEmptyAction();
    action.name = actionName;
    action.encodedValue = [
      actionType,
      actorId,
      actionId,
      JSON.stringify(option ? option : {}),
    ].join(this.delimiter);
    return action;
  }

  _makeItemSubCat(name, itemType, mm, actorId) {
    let result = this.initializeEmptySubcategory();
    let macro = "item";

    result.name = name;
    result.actions = mm
      .filter((item) => {
        if (item !==null) return item.Type === itemType;
      })
      .map((item) => {
        return this._makeAction(item.Name, macro, actorId, item.RegistryID);
      });

    return result;
  }

  _makeNPCItemSubCat(name, itemType, actor, actorId) {
    let result = this.initializeEmptySubcategory();
    let macro = "item";

    result.name = name;
    result.actions = actor.items
      .filter((item) => {
        if (item !==null) return item.type === "npc_feature";
      })
      .filter((item) => {
        return item.system.type === itemType;
      })
      .map((item) => {
        return this._makeAction(item.name, macro, actorId, item.id);
      });
    return result;
  }

  _pilotCategory(mm, actorId) {
    let result = this.initializeEmptyCategory("pilot");

    [
      this._skillsSubCategory(mm, actorId),
      this._talentsSubCategory(mm, actorId),
      this._pilotGearSubCategory(mm, actorId),
      this._pilotWeaponSubCategory(mm, actorId),
    ].forEach((subCat) => {
      this._combineSubcategoryWithCategory(result, subCat.name, subCat);
    });

    return result;
  }

  _npcBaseCategory(actor, actorId) {
    let result = this.initializeEmptyCategory("mech");

    [this._haseSubCategory(actorId)].forEach((subCat) => {
      this._combineSubcategoryWithCategory(result, subCat.name, subCat);
    });

    return result;
  }

  _npcFeatureCategory(actor, actorId) {
    let result = this.initializeEmptyCategory("feature");

    [
      this._npcWeaponSubCat(actor, actorId),
      this._npcTechSubCat(actor, actorId),
      this._npcReactionSubCat(actor, actorId),
      this._npcSystemSubCat(actor, actorId),
      this._npcTraitSubCat(actor, actorId),
    ].forEach((subCat) => {
      this._combineSubcategoryWithCategory(result, subCat.name, subCat);
    });

    return result;
  }

  _npcWeaponSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenActionHud.weapons"),
      "Weapon",
      actor,
      actorId
    );
  }

  _npcTraitSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenActionHud.traits"),
      "Trait",
      actor,
      actorId
    );
  }

  _npcSystemSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenActionHud.lancer.systems"),
      "System",
      actor,
      actorId
    );
  }

  _npcTechSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenActionHud.lancer.techs"),
      "Tech",
      actor,
      actorId
    );
  }

  _npcReactionSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenActionHud.reactions"),
      "Reaction",
      actor,
      actorId
    );
  }

  _skillsSubCategory(mm, actorId) {
    return this._makeItemSubCat(
      this.i18n("tokenActionHud.lancer.skillTriggers"),
      "skill",
      mm._skills,
      actorId
    );
  }

  _talentsSubCategory(mm, actorId) {
    let result = this.initializeEmptySubcategory();
    let macro = "item";

    result.id = "talent";
    result.name = this.i18n("tokenActionHud.talents");

    let itemSubCats = mm._talents
      .filter((item) => {
        if (item !==null) return item.Type === "talent";
      })
      .map((talent) => {
        let subcat = this.initializeEmptySubcategory();
        subcat.name = talent.Name;

        for (let i = 0; i < talent.CurrentRank; i++) {
          let option = { rank: `${i}` };
          let action = this._makeAction(
            `${this.i18n("tokenActionHud.lancer.rank")} ${i + 1}`,
            macro,
            actorId,
            talent.RegistryID,
            option
          );
          subcat.actions.push(action);
        }

        return subcat;
      });

    this._combineSubcategoryWithCategory;

    result.subcategories = itemSubCats;

    return result;
  }

  _pilotWeaponSubCategory(mm, actorId) {
    return this._makeItemSubCat(
      this.i18n("tokenActionHud.weapons"),
      "pilot_weapon",
      mm.Loadout.Weapons,
      actorId
    );
  }

  _pilotGearSubCategory(mm, actorId) {
    return this._makeItemSubCat(
      this.i18n("tokenActionHud.lancer.gear"),
      "pilot_gear",
      mm.Loadout.Gear,
      actorId
    );
  }

  _mechCategory(mm, actorId) {
    let result = this.initializeEmptyCategory("mech");

    [
      this._haseSubCategory(actorId),
      this._statSubCategory(actorId),
      this._coreBonSubCategory(mm, actorId),
      this._corePowerSubCategory(mm.Loadout.Frame, actorId),
    ].forEach((subCat) => {
      this._combineSubcategoryWithCategory(result, subCat.name, subCat);
    });

    return result;
  }

  _haseSubCategory(actorId) {
    let result = this.initializeEmptySubcategory();
    let macro = "hase";

    result.id = "hase";
    result.name = this.i18n("tokenActionHud.lancer.hase");

    let hull = this.i18n("tokenActionHud.lancer.hull");
    let agility = this.i18n("tokenActionHud.attribute.agility");
    let systems = this.i18n("tokenActionHud.lancer.systems");
    let engineering = this.i18n("tokenActionHud.lancer.engineering");

    let haseActionData = [
      { name: hull, id: "Hull" },
      { name: agility, id: "Agi" },
      { name: systems, id: "Sys" },
      { name: engineering, id: "Eng" },
    ];

    let haseActions = haseActionData.map((actionData) => {
      return this._makeAction(actionData.name, macro, actorId, actionData.id);
    });

    result.actions = haseActions;

    return result;
  }

  _statSubCategory(actorId) {
    let result = this.initializeEmptySubcategory();
    let macro = "stat";

    result.id = "stat";
    result.name = this.i18n("tokenActionHud.lancer.stat");

    let grit = this.i18n("tokenActionHud.lancer.grit");
    let techAttack = this.i18n("tokenActionHud.lancer.techAttack");

    let statActionData = [
      { name: grit, data: "Pilot.Grit" },
      { name: techattack, data: "techattack" },
    ];

    let statActions = statActionData.map((actionData) => {
      return this._makeAction(actionData.name, macro, actorId, actionData.data);
    });

    result.actions = statActions;

    return result;
  }

  _coreBonSubCategory(mm, actorId) {
    let result = this.initializeEmptySubcategory();
    let coreBonus = mm.Pilot.CoreBonuses;
    result.name = "Core Bonuses";
    result.actions = coreBonus.map((bonus) => {
      let option = {};
      option.pilot = mm.Pilot.RegistryID;
      return this._makeAction(
        bonus.Name,
        "coreBonus",
        actorId,
        bonus.RegistryID,
        option
      );
    });
    return result;
  }

  _corePowerSubCategory(frame, actorId) {
    let result = this.initializeEmptySubcategory();

    let core = frame.CoreSystem;

    result.name = core.Name;

    if (core.PassiveName !== "Core Passive") {
      result.actions.push(
        this._makeAction(core.PassiveName, "corePassive", actorId, "")
      );
    }
    if (core.ActiveName) {
      result.actions.push(
        this._makeAction(core.ActiveName, "coreActive", actorId, "")
      );
    }

    return result;
  }

  _weaponsCategory(WepMounts, actorId) {
    let result = this.initializeEmptyCategory();
    let macro = "item";

    result.id = "weapons";
    result.name = this.i18n("tokenActionHud.weapons");

    let itemSubCats = WepMounts.map((mount, i) => {
      let subcat = this.initializeEmptySubcategory("Mount_" + i);
      subcat.name = mount.MountType;

      subcat.actions = mount.Slots.filter((slot) => slot.Weapon !== null).map(
        (slot) => {
          return this._makeAction(
            slot.Weapon.Name,
            macro,
            actorId,
            slot.Weapon.RegistryID
          );
        }
      );

      return subcat;
    });

    itemSubCats.forEach((subCat) => {
      this._combineSubcategoryWithCategory(result, subCat.name, subCat);
    });

    return result;
  }

  _systemsCategory(loadout, actorId) {
    let result = this.initializeEmptyCategory();
    let macro = "item";

    result.id = "systems";
    result.name = this.i18n("tokenActionHud.lancer.systems");

    let itemSubCats = loadout
      .flatMap((mount) => mount.System)
      .map((system) => {
        let subcat = this.initializeEmptySubcategory(system.RegistryID);
        subcat.name = system.Name;

        let activations = system.Actions.map((action, i) => {
          let option = {};
          option.Type = "Action";
          option.Index = i;
          return this._makeAction(
            action.Name,
            "activation",
            actorId,
            system.RegistryID,
            option
          );
        });

        let deployables = system.Deployables.map((deployable, i) => {
          let option = {};
          option.Type = "Deployable";
          option.Index = i;
          return this._makeAction(
            deployable.Name,
            "activation",
            actorId,
            system.RegistryID,
            option
          );
        });

        subcat.actions = activations.concat(deployables);

        return subcat;
      });

    itemSubCats.forEach((subCat) => {
      this._combineSubcategoryWithCategory(result, subCat.name, subCat);
    });

    return result;
  }
}
