import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerLancer extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (!token) return result;

    let actorId = token.actor.id;
    result.actorId = actorId;
    let actor = token.actor;
    let mm = actor.data.data.derived.mm;

    if (!actor) return result;

    switch (actor.data.type) {
      case "pilot":
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.pilot"),
          this._pilotCategory(mm, actorId)
        );
        break;
      case "mech":
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.pilot"),
          this._pilotCategory(mm.Pilot, mm.Pilot.RegistryID)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.mech"),
          this._mechCategory(mm, actorId)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.weapons"),
          this._weaponsCategory(mm.Loadout.WepMounts, actorId)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.systems"),
          this._systemsCategory(mm.Loadout.SysMounts, actorId)
        );
        break;
      case "npc":
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.stats"),
          this._npcBaseCategory(actor, actorId)
        );
        this._combineCategoryWithList(
          result,
          this.i18n("tokenactionhud.features"),
          this._npcFeatureCategory(actor, actorId)
        );
        break;
    }

    if (settings.get("showHudTitle")) result.hudTitle = token.data?.name;

    return result;
  }

  _makeAction(actionName, macroType, actorId, actionId, option) {
    let action = this.initializeEmptyAction();
    action.name = actionName;
    action.encodedValue = [
      macroType,
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
        if (item != null) return item.Type === itemType;
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
    result.actions = actor.data.items
      .filter((item) => {
        if (item != null) return item.data.type === "npc_feature";
      })
      .filter((item) => {
        return item.data.data.type === itemType;
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
      this.i18n("tokenactionhud.weapons"),
      "Weapon",
      actor,
      actorId
    );
  }

  _npcTraitSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenactionhud.traits"),
      "Trait",
      actor,
      actorId
    );
  }

  _npcSystemSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenactionhud.systems"),
      "System",
      actor,
      actorId
    );
  }

  _npcTechSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenactionhud.techs"),
      "Tech",
      actor,
      actorId
    );
  }

  _npcReactionSubCat(actor, actorId) {
    return this._makeNPCItemSubCat(
      this.i18n("tokenactionhud.reactions"),
      "Reaction",
      actor,
      actorId
    );
  }

  _skillsSubCategory(mm, actorId) {
    return this._makeItemSubCat(
      this.i18n("tokenactionhud.skilltriggers"),
      "skill",
      mm._skills,
      actorId
    );
  }

  _talentsSubCategory(mm, actorId) {
    let result = this.initializeEmptySubcategory();
    let macro = "item";

    result.id = "talent";
    result.name = this.i18n("tokenactionhud.talents");

    let itemSubCats = mm._talents
      .filter((item) => {
        if (item != null) return item.Type === "talent";
      })
      .map((talent) => {
        let subcat = this.initializeEmptySubcategory();
        subcat.name = talent.Name;

        for (let i = 0; i < talent.CurrentRank; i++) {
          let option = { rank: `${i}` };
          let action = this._makeAction(
            `${this.i18n("tokenactionhud.rank")} ${i + 1}`,
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
      this.i18n("tokenactionhud.weapons"),
      "pilot_weapon",
      mm.Loadout.Weapons,
      actorId
    );
  }

  _pilotGearSubCategory(mm, actorId) {
    return this._makeItemSubCat(
      this.i18n("tokenactionhud.gear"),
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
    result.name = this.i18n("tokenactionhud.hase");

    let hull = this.i18n("tokenactionhud.hull");
    let agility = this.i18n("tokenactionhud.attribute.agility");
    let systems = this.i18n("tokenactionhud.systems");
    let engineering = this.i18n("tokenactionhud.engineering");

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
    result.name = this.i18n("tokenactionhud.stat");

    let grit = this.i18n("tokenactionhud.grit");
    let techAttack = this.i18n("tokenactionhud.techattack");

    let statActionData = [
      { name: grit, data: "Pilot.Grit" },
      { name: techAttack, data: "TechAttack" },
    ];

    let statActions = statActionData.map((actionData) => {
      return this._makeAction(actionData.name, macro, actorId, actionData.data);
    });

    result.actions = statActions;

    return result;
  }

  _coreBonSubCategory(mm, actorId) {
    let result = this.initializeEmptySubcategory();
    let corebonus = mm.Pilot.CoreBonuses;
    result.name = "Core Bonuses";
    result.actions = corebonus.map((bonus) => {
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

    if (core.PassiveName != "Core Passive") {
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
    result.name = this.i18n("tokenactionhud.weapons");

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
    result.name = this.i18n("tokenactionhud.systems");

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
