import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { PcActionHandlerPf2e } from "./pf2e-actions-pc.js";
import { NpcActionHandlerPf2e } from "./pf2e-actions-npc.js";
import { SKILL_ABBREVIATIONS } from "./values.js";

export class ActionHandlerPf2e extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
    this.pcActionHandler = new PcActionHandlerPf2e(this);
    this.npcActionHandler = new NpcActionHandlerPf2e(this);
  }

  /** @override */
  async buildSystemActions(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (multipleTokens) {
      this._buildMultipleTokenList(result);
      return result;
    }

    if (!token) return result;

    let tokenId = token.id;
    result.tokenId = tokenId;

    let actor = token.actor;
    if (!actor) return result;

    let knownActors = ["character", "npc", "familiar"];
    let actorType = actor.type;
    if (!knownActors.includes(actorType)) return result;

    result.actorId = actor.id;

    if (actorType === "character" || actorType === "familiar")
      await this.pcActionHandler.buildActionList(result, tokenId, actor);

    if (actorType === "npc")
      await this.npcActionHandler.buildActionList(result, tokenId, actor);

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  _buildMultipleTokenList(list) {
    list.tokenId = "multi";
    list.actorId = "multi";

    const allowedTypes = ["npc", "character", "familiar"];
    let actors = canvas.tokens.controlled
      .map((t) => t.actor)
      .filter((a) => allowedTypes.includes(a.type));

    const tokenId = list.tokenId;

    this._addMultiSkills(list, tokenId, actors);
    this._addMultiSaves(list, tokenId, actors);
    this._addMultiAttributes(list, tokenId, actors);
    this._addMultiUtilities(list, tokenId, actors);
  }

  _addMultiSkills(list, tokenId, actors) {
    const macroType = "skill";
    const category = this.initializeEmptyCategory(macroType);
    const subcategory = this.initializeEmptySubcategory(macroType);

    const allSkillSets = actors.map((a) =>
      Object.entries(a.system.skills).filter((s) => !!s[1].roll)
    );
    const minSkillSetSize = Math.min(...allSkillSets.map((s) => s.length));
    const smallestSkillSet = allSkillSets.find(
      (set) => set.length === minSkillSetSize
    );
    const finalSharedSkills = smallestSkillSet.filter((skill) =>
      allSkillSets.every((set) =>
        set.some((setSkill) => setSkill[0] === skill[0])
      )
    );

    finalSharedSkills.forEach((skill) => {
      const key = skill[0];
      const data = skill[1];

      let name = CONFIG.PF2E.skills[key];
      if (!name) name = data.name;

      const encodedValue = [macroType, tokenId, key].join(this.delimiter);
      const action = {
        name: game.i18n.localize(name),
        encodedValue: encodedValue,
        id: key,
      };
      subcategory.actions.push(action);
    });

    const skillsName = this.i18n("tokenActionHud.pf2e.commonSkills");
    this._combineSubcategoryWithCategory(category, skillsName, subcategory);
    this._combineCategoryWithList(list, skillsName, category);
  }

  _addMultiSaves(list, tokenId, actors) {
    const macroType = "save";
    const category = this.initializeEmptyCategory(macroType);
    const subcategory = this.initializeEmptySubcategory(macroType);

    Object.entries(CONFIG.PF2E.saves).forEach((save) => {
      const key = save[0];
      const name = save[1];
      const encodedValue = [macroType, tokenId, key].join(this.delimiter);
      const action = {
        name: game.i18n.localize(name),
        encodedValue: encodedValue,
        id: key,
      };
      subcategory.actions.push(action);
    });

    const savesName = this.i18n("tokenActionHud.saves");
    this._combineSubcategoryWithCategory(category, savesName, subcategory);
    this._combineCategoryWithList(list, savesName, category);
  }

  _addMultiAttributes(list, tokenId, actors) {
    let macroType = "attribute";
    let result = this.initializeEmptyCategory("attributes");
    let attributes = this.initializeEmptySubcategory();

    let attributesMap = [
      { id: "perception", name: "Perception" },
      { id: "initiative", name: "Initiative" },
    ];

    attributes.actions = this._produceActionMap(
      tokenId,
      attributesMap,
      macroType
    );

    const attributesName = this.i18n("tokenActionHud.attributes");
    this._combineSubcategoryWithCategory(result, attributesName, attributes);
    this._combineCategoryWithList(list, attributesName, result);
  }

  _addMultiUtilities(list, tokenId, actors) {
    if (!actors.every((actor) => actor.type === "character")) return;

    let result = this.initializeEmptyCategory("utility");
    let macroType = "utility";

    let rests = this.initializeEmptySubcategory();

    let restActions = [];
    let treatWoundsValue = ["utility", tokenId, "treatWounds"].join(
      this.delimiter
    );
    let treatWoundsAction = {
      id: "treatWounds",
      name: this.i18n("tokenActionHud.pf2e.treatWounds"),
      encodedValue: treatWoundsValue,
    };
    restActions.push(treatWoundsAction);

    let longRestValue = ["utility", tokenId, "longRest"].join(this.delimiter);
    let longRestAction = {
      id: "longRest",
      name: this.i18n("tokenActionHud.pf2e.restNight"),
      encodedValue: longRestValue,
    };
    restActions.push(longRestAction);

    if (game.settings.get("pf2e", "staminaVariant")) {
      let takeBreatherValue = ["utility", tokenId, "takeABreather"].join(
        this.delimiter
      );
      let takeBreatherAction = {
        id: "takeABreather",
        name: this.i18n("tokenActionHud.pf2e.takeBreather"),
        encodedValue: takeBreatherValue,
      };

      restActions.push(takeBreatherAction);
    }

    rests.actions = restActions;

    const utilityName = this.i18n("tokenActionHud.utility");
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.rests"),
      rests
    );
    this._combineCategoryWithList(list, utilityName, result);
  }

  /** @private */
  _getItemsList(actor, tokenId) {
    if (settings.get("showInventoryCategory") === false) return;
    let macroType = "item";
    let result = this.initializeEmptyCategory("items");

    let filter = ["weapon", "equipment", "consumable", "armor", "backpack"];
    let items = (actor.items ?? [])
      .filter(
        (a) =>
          ["held","worn"].includes(a.system.equipped?.carryType) && !a.system.containerId?.value?.length
      )
      .filter((i) => filter.includes(i.type) && i.system.quantity > 0)
      .sort(this._foundrySort);

    let weaponList = items.filter((i) => i.type === "weapon");
    if (actor.type === "character")
      weaponList = weaponList.filter((i) => ["held","worn"].includes(i.system.equipped?.carryType));
    let weaponActions = this._buildItemActions(tokenId, macroType, weaponList);
    let weapons = this.initializeEmptySubcategory();
    weapons.actions = weaponActions;

    let armourList = items.filter((i) => i.type === "armor");
    if (actor.type === "character")
      armourList = armourList.filter((i) => ["held","worn"].includes(i.system.equipped?.carryType));
    let armourActions = this._buildItemActions(tokenId, macroType, armourList);
    let armour = this.initializeEmptySubcategory();
    armour.actions = armourActions;

    let equipmentList = items.filter(
      (i) => i.type === "equipment" || i.type === "backpack"
    );
    let equipmentActions = this._buildItemActions(
      tokenId,
      macroType,
      equipmentList
    );
    let equipment = this.initializeEmptySubcategory();
    equipment.actions = equipmentActions;

    let consumablesList = items.filter((i) => i.type === "consumable");
    let consumableActions = this._buildItemActions(
      tokenId,
      macroType,
      consumablesList
    );
    let consumables = this.initializeEmptySubcategory();
    consumables.actions = consumableActions;

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.weapons"),
      weapons
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.armour"),
      armour
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.equipment"),
      equipment
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.consumables"),
      consumables
    );
    this._addContainerSubcategories(tokenId, macroType, result, actor, items);

    return result;
  }

  /** @private */
  _addContainerSubcategories(tokenId, macroType, category, actor, items) {
    const allContainerIds = [
      ...new Set(
        actor.items
          .filter((i) => i.system.containerId?.value)
          .map((i) => i.system.containerId.value)
      ),
    ];
    const containers = (items ?? []).filter((i) =>
      allContainerIds.includes(i.id)
    );

    containers.forEach((container) => {
      const containerId = container.id;
      const contents = actor.items
        .filter((i) => i.system.containerId?.value === containerId)
        .sort(this._foundrySort);
      if (contents.length === 0) return;

      const containerCategory = this.initializeEmptySubcategory(containerId);
      let containerActions = this._buildItemActions(
        tokenId,
        macroType,
        contents
      );
      containerCategory.actions = containerActions;
      containerCategory.info1 = container.system.bulkCapacity.value;

      this._combineSubcategoryWithCategory(
        category,
        container.name,
        containerCategory
      );
    });
  }

  /** @private */
  _getEffectsList(actor, tokenId) {
    if (settings.get("showEffectsCategory") === false) return;
    let macroType = "item";
    let result = this.initializeEmptyCategory("effects");

    let filter = ["effect"];
    let items = (actor.items ?? [])
      .filter((i) => filter.includes(i.type))
      .sort(this._foundrySort);

    let effectsList = items.filter((i) => i.type === "effect");
    let effectActions = this._buildItemActions(tokenId, macroType, effectsList);
    let effects = this.initializeEmptySubcategory();
    effects.actions = effectActions;

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.weapons"),
      effects
    );

    return result;
  }

  /** @private */
  _addStrikesCategories(actor, tokenId, category) {
    let macroType = "strike";
    let strikes = actor.system.actions?.filter((a) => 
      a.type === macroType && 
      (a.item.system.quantity > 0 || actor.type === 'npc')
    );

    if (!strikes) return;

    strikes.forEach((s) => {
      this._buildStrikeSubcategory(s, category, "", tokenId, actor);
    });
  }

  /** @private */
  _buildStrikeSubcategory(s, category, usage, tokenId, actor) {
    let macroType = "strike";
    let calculateAttackPenalty = settings.get("calculateAttackPenalty");
    let subcategory = this.initializeEmptySubcategory();
    let glyph = s.glyph;
    if (glyph)
      subcategory.icon = `<span style='font-family: "Pathfinder2eActions"'>${glyph}</span>`;
    if (s.ready) {
      let map = Math.abs(parseInt(s.variants[1].label.split(" ")[1]));
      let attackMod = s.totalModifier;

      let currentMap = 0;
      let currentBonus = attackMod;
      let calculatePenalty = calculateAttackPenalty;

      let variantsMap = s.variants.map(
        function (v) {
          let name;
          if (currentBonus === attackMod || calculatePenalty) {
            name = currentBonus >= 0 ? `+${currentBonus}` : `${currentBonus}`;
          } else {
            name = currentMap >= 0 ? `+${currentMap}` : `${currentMap}`;
          }
          currentMap -= map;
          currentBonus -= map;
          return {
            id: encodeURIComponent(`${this.label}>${this.variants.indexOf(v)}>` + usage),
            name: name,
          };
        }.bind(s)
      );

      variantsMap[0].img = s.imageUrl;
      subcategory.actions = this._produceActionMap(
        tokenId,
        variantsMap,
        macroType
      );

      let damageEncodedValue = [
        macroType,
        tokenId,
        encodeURIComponent(s.name + ">damage>" + usage),
      ].join(this.delimiter);
      let critEncodedValue = [
        macroType,
        tokenId,
        encodeURIComponent(s.name + ">critical>" + usage),
      ].join(this.delimiter);
      subcategory.actions.push({
        name: this.i18n("tokenActionHud.damage"),
        encodedValue: damageEncodedValue,
        id: encodeURIComponent(s.name + ">damage>" + usage),
      });
      subcategory.actions.push({
        name: this.i18n("tokenActionHud.critical"),
        encodedValue: critEncodedValue,
        id: encodeURIComponent(s.name + ">critical>" + usage),
      });

      let ammoAction = this._ammoInfo(tokenId, actor, s);
      if (!!ammoAction) {
        subcategory.actions.push(ammoAction);
      }
    }

    if (s.auxiliaryActions && !usage) {
      const auxActionsMap = s.auxiliaryActions.map(
        function (a) {
          return {
            id: encodeURIComponent(`${this.name}>${this.auxiliaryActions.indexOf(a)}>` + usage),
            name: a.label,
          };
        }.bind(s)
      );
      if (!s.ready && auxActionsMap[0]){
        auxActionsMap[0].img = s.imageUrl;
      }
      const auxActionsList = this._produceActionMap(
        tokenId,
        auxActionsMap,
        "auxAction"
      );
      auxActionsList.forEach((a) => {
        subcategory.actions.push(a);
      });
    }

    this._combineSubcategoryWithCategory(category, usage ? usage : s.name, subcategory);
    if (!usage && s.altUsages) {
      for (const altUsage of s.altUsages) {
        this._buildStrikeSubcategory(altUsage, category, altUsage.item.isMelee ? "melee" : "thrown", tokenId, actor);
      }
    }
  }

  /** @private */
  _ammoInfo(tokenId, actor, strike) {
    if (!strike.selectedAmmoId || !strike.ammunition) return;

    const item = actor.items.get(strike.selectedAmmoId);

    if (!item) {
      return {
        name: this.i18n("tokenActionHud.pf2e.noAmmo"),
        encodedValue: "noAmmo",
        id: "noAmmo",
      };
    }

    let encodedValue = ["ammo", tokenId, item.id].join(this.delimiter);
    let img = this._getImage(item);
    let action = {
      name: item.label,
      encodedValue: encodedValue,
      id: item.id,
      img: img,
    };
    action.info1 = item.system.quantity?.value;

    return action;
  }

  _getSkillsList(actor, tokenId) {
    if (settings.get("showSkillsCategory") === false) return;
    let result = this.initializeEmptyCategory("skills");

    let abbreviated = settings.get("abbreviateSkills");

    let actorSkills = Object.entries(actor.skills).filter(
      (s) => !!s[1].label && s[1].label.length > 1
    );

    let skillMap = actorSkills
      .filter((s) => !s[1].lore)
      .map((s) =>
        this.createSkillMap(tokenId, "skill", s, abbreviated)
      );
    let skills = this.initializeEmptySubcategory();
    skills.actions = skillMap;

    let loreMap = actorSkills
      .filter((s) => s[1].lore)
      .sort(this._foundrySort)
      .map((s) =>
        this.createSkillMap(tokenId, "skill", s, abbreviated)
      );
    let lore = this.initializeEmptySubcategory();
    lore.actions = loreMap;

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.skills"),
      skills
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.pf2e.lore"),
      lore
    );

    return result;
  }

  /** @private */
  _getActionsList(actor, tokenId) {
    if (settings.get("showActionsCategory") === false) return;
    let macroType = "action";
    let result = this.initializeEmptyCategory("actions");

    let filteredActions = (actor.items ?? [])
      .filter((a) => a.type === macroType || a.type === "feat")
      .sort(this._foundrySort);

    if (settings.get("ignorePassiveActions"))
      filteredActions = filteredActions.filter(
        (a) => a.system.actionType.value !== "passive"
      );

    let actions = this.initializeEmptySubcategory();
    actions.actions = this._produceActionMap(
      tokenId,
      (filteredActions ?? []).filter(
        (a) =>
          a.system.actionType?.value === "action" && this._actionIsShort(a)
      ),
      macroType
    );

    let reactions = this.initializeEmptySubcategory();
    reactions.actions = this._produceActionMap(
      tokenId,
      (filteredActions ?? []).filter(
        (a) =>
          a.system.actionType?.value === "reaction" && this._actionIsShort(a)
      ),
      macroType
    );

    let free = this.initializeEmptySubcategory();
    free.actions = this._produceActionMap(
      tokenId,
      (filteredActions ?? []).filter(
        (a) =>
          a.system.actionType?.value === "free" && this._actionIsShort(a)
      ),
      macroType
    );

    let passive = this.initializeEmptySubcategory();
    passive.actions = this._produceActionMap(
      tokenId,
      (filteredActions ?? []).filter(
        (a) =>
          a.system.actionType?.value === "passive" &&
          this._actionIsShort(a) &&
          a.type !== "feat"
      ),
      macroType
    );

    let exploration = this.initializeEmptySubcategory();
    exploration.actions = this._produceActionMap(
      tokenId,
      (filteredActions ?? []).filter((a) =>
        a.system.traits?.value.includes("exploration")
      ),
      macroType
    );

    let downtime = this.initializeEmptySubcategory();
    downtime.actions = this._produceActionMap(
      tokenId,
      (filteredActions ?? []).filter((a) =>
        a.system.traits?.value.includes("downtime")
      ),
      macroType
    );

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.actions"),
      actions
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.reactions"),
      reactions
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.pf2e.free"),
      free
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.passive"),
      passive
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.pf2e.exploration"),
      exploration
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.pf2e.downtime"),
      downtime
    );

    return result;
  }

  /** @private */
  _actionIsShort(action) {
    return !(
      action.system.traits?.value.includes("exploration") ||
      action.system.traits?.value.includes("downtime")
    );
  }

  async _getSpellsList(actor, tokenId) {
    if (settings.get("showSpellsCategory") === false) return;
    let result = this.initializeEmptyCategory("spells");

    let filter = ["spellcastingEntry"];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type));
    const macroType = "spell";

    let spellCategories = this.initializeEmptySubcategory();

    for (const spellcastingEntry of items) {
      const bookName = spellcastingEntry.name;
      let spellcastingEntryCategory = this.initializeEmptySubcategory(bookName);
      spellcastingEntryCategory.name = bookName;
      spellCategories.subcategories.push(spellcastingEntryCategory);

      const spellInfo = await spellcastingEntry.getSpellData();

      const activeLevels = spellInfo.levels.filter((level) => level.active.length > 0);
      for (const [i, level] of Object.entries(activeLevels)) {
        const isFirst = Number(i) === 0;
        let levelName = String(game.i18n.localize(level.label));
        let levelSubcategory = this.initializeEmptySubcategory();

        this._setSpellSlotInfo(actor, tokenId, levelSubcategory, level, spellInfo, isFirst);

        if (isFirst) {
          levelName = `${bookName} - ${levelName}`;
          levelSubcategory.info2 = this._getSpellDcInfo(spellcastingEntry);
        }

        const availableSpells = level.active.filter((i) => !i?.expended && i);
        for (const { spell, uses } of availableSpells) {
          let encodedValue = [
            macroType,
            tokenId,
            `${spellInfo.id}>${level.level}>${spell.id}`,
          ].join(this.delimiter);

          const spellAction = {
            name: spell.name,
            encodedValue: encodedValue,
            id: spell.id,
            img: this._getImage(spell),
            icon: this._getActionIcon(spell.system?.time?.value),
            spellLevel: level.level,
            info2: uses ? `${uses.value}/${uses.max}` : null,
          };

          this._addSpellInfo(spell, spellAction);
          levelSubcategory.actions.push(spellAction);
        }

        this._combineSubcategoryWithCategory(
          spellcastingEntryCategory,
          levelName,
          levelSubcategory
        );
      }
    }

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.spells"),
      spellCategories
    );
    return result;
  }

  /** @private */
  _getSpellDcInfo(spellcastingEntry) {
    let result = "";

    const statistic = spellcastingEntry.statistic;
    let spelldc = typeof statistic.dc === "function" ? statistic.dc().value : statistic.dc.value;
    let spellatk = statistic.check.mod;
    let attackBonus =
      spellatk >= 0
        ? `${this.i18n("tokenActionHud.pf2e.atk")} +${spellatk}`
        : `${this.i18n("tokenActionHud.pf2e.atk")} ${spellatk}`;
    let dcInfo = `${this.i18n("tokenActionHud.pf2e.dc")}${spelldc}`;

    result = `${attackBonus} ${dcInfo}`;

    return result;
  }

  /** @private */
  _setSpellSlotInfo(
    actor,
    tokenId,
    category,
    level,
    spellInfo,
    firstSubcategory
  ) {
    let maxSlots, valueSlots, increaseId, decreaseId;
    if (firstSubcategory && spellInfo.isFocusPool) {
      let focus = actor.system.resources.focus;
      maxSlots = focus.max;
      valueSlots = focus.value;

      if (maxSlots > 0) {
        category.info1 = `${valueSlots}/${maxSlots}`;

        increaseId = `${spellInfo.id}>focus>slotIncrease`;
        let increaseEncodedValue = ["spellSlot", tokenId, increaseId].join(
          this.delimiter
        );
        category.actions.unshift({
          id: increaseId,
          name: "+",
          encodedValue: increaseEncodedValue,
          cssClass: "shrink",
        });

        decreaseId = `${spellInfo.id}>focus>slotDecrease`;
        let decreaseEncodedValue = ["spellSlot", tokenId, decreaseId].join(
          this.delimiter
        );
        category.actions.unshift({
          id: decreaseId,
          encodedValue: decreaseEncodedValue,
          name: "-",
          cssClass: "shrink",
        });
      }
    }

    if (level.isCantrip === true) return;

    if (
      level.uses?.max > 0 &&
      !(spellInfo.isPrepared && !spellInfo.isFlexible) &&
      !spellInfo.isFocusPool
    ) {
      let slots = level.uses;
      let slotLevel = `slot${level.level}`;
      maxSlots = slots.max;
      valueSlots = slots.value;

      if (maxSlots > 0) {
        category.info1 = `${valueSlots}/${maxSlots}`;

        increaseId = `${spellInfo.id}>${slotLevel}>slotIncrease`;
        let increaseEncodedValue = ["spellSlot", tokenId, increaseId].join(
          this.delimiter
        );
        category.actions.unshift({
          encodedValue: increaseEncodedValue,
          name: "+",
          id: increaseId,
          cssClass: "shrink",
        });

        decreaseId = `${spellInfo.id}>${slotLevel}>slotDecrease`;
        let decreaseEncodedValue = ["spellSlot", tokenId, decreaseId].join(
          this.delimiter
        );
        category.actions.unshift({
          encodedValue: decreaseEncodedValue,
          name: "-",
          id: increaseId,
          cssClass: "shrink",
        });
      }
    }
  }

  /** @private */
  _addSpellInfo(s, spell) {
    this._addComponentsInfo(s, spell);
  }

  _addComponentsInfo(s, spell) {
    let components = s.components;
    if (components) {
      spell.info1 = components.value;
    } else {
      components = s.system.components?.value.split(",");
      spell.info1 = components
        .map((c) => c.trim().charAt(0).toUpperCase())
        .join("");
    }
  }

  /** @private */
  _getFeatsList(actor, tokenId) {
    if (settings.get("showFeaturesCategory") === false) return;
    let macroType = "feat";
    let featTypes = [
      { featType: "ancestryfeature", title: this.i18n("tokenActionHud.ancestryFeatures") },
      { featType: "classfeature", title: this.i18n("tokenActionHud.pf2e.classFeatures") },
      { featType: "ancestry", title: this.i18n("tokenActionHud.ancestryFeats") },
      { featType: "class", title: this.i18n("tokenActionHud.pf2e.classFeats") },
      { featType: "skill", title: this.i18n("tokenActionHud.skillFeats") },
      { featType: "general", title: this.i18n("tokenActionHud.pf2e.generalFeats") },
      { featType: "bonus", title: this.i18n("tokenActionHud.pf2e.bonusFeats") }
    ]

    let result = this.initializeEmptyCategory("feats");

    let filter = [macroType];
    let items = (actor.items ?? [])
      .filter((a) => filter.includes(a.type))
      .sort(this._foundrySort);


    for (const featType of featTypes) {
      let subcategory = this.initializeEmptySubcategory();
      subcategory.actions = this._produceActionMap(
        tokenId,
        (items ?? []).filter((a) => a.featType === featType.featType),
        macroType
      );

      this._combineSubcategoryWithCategory(
        result,
        featType.title,
        subcategory
      );
    }

    return result;
  }

  _getSaveList(actor, tokenId) {
    if (settings.get("showSavesCategory") === false) return;
    let result = this.initializeEmptyCategory("saves");

    let actorSaves = Object.values(actor.saves);
    let saveMap = actorSaves.map((save) => ({ id: save.slug, name: save.label }));

    let saves = this.initializeEmptySubcategory();
    saves.actions = this._produceActionMap(tokenId, saveMap, "save");

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.saves"),
      saves
    );

    return result;
  }

  /** @protected */
  createSkillMap(tokenId, macroType, skillEntry, abbreviated) {
    let key = skillEntry[0];
    let data = skillEntry[1];
    const label = game.i18n.localize(data.label);
    const name = abbreviated ? SKILL_ABBREVIATIONS[data.slug] ?? label : label;

    let value = data.check.mod;
    let info = "";
    if (value != 0) {
      if (value > 0) info = `+${value}`;
      else info = `${value}`;
    }

    let action = this._produceActionMap(
      tokenId,
      [{ id: key, name: name }],
      macroType
    );
    action[0].info1 = info;
    return action[0];
  }

  /** @private */
  _getUtilityList(actor, tokenId) {
    if (settings.get("showUtilityCategory") === false) return;
    let result = this.initializeEmptyCategory("utility");
    let macroType = "utility";

    // Combat Subcategory
    let combatSubcategory = this.initializeEmptySubcategory();

    // End Turn
    if (game.combat?.current?.tokenId === tokenId) {
      let endTurnValue = [macroType, tokenId, "endTurn"].join(this.delimiter);
      let endTurnAction = {
        id: "endTurn",
        encodedValue: endTurnValue,
        name: this.i18n("tokenActionHud.endTurn"),
      };

      combatSubcategory.actions.push(endTurnAction);
    }

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.combat"),
      combatSubcategory
    );

    // Attributes Subcategory
    if (actor.type === "character") {
      let attributes = this.initializeEmptySubcategory();
      let attributeActions = [];

      // Hero Points
      let heroPoints = actor.system.resources?.heroPoints;
      if (heroPoints)
        attributeActions.push(
          this._getAttributeAction(
            tokenId,
            "heroPoint",
            this.i18n("tokenActionHud.pf2e.heroPoints"),
            heroPoints.value,
            heroPoints.max
          )
        );

      // Dying
      let doomedPoints = actor.system.attributes?.doomed;
      let dyingPoints = actor.system.attributes?.dying;
      if (dyingPoints) {
        let dyingVal = dyingPoints.value;
        let dyingMax = dyingPoints.max;
        if (doomedPoints) dyingMax -= doomedPoints.value;
        attributeActions.push(
          this._getAttributeAction(
            tokenId,
            "dying",
            this.i18n("tokenActionHud.pf2e.dying"),
            dyingVal,
            dyingMax
          )
        );
      }

      // Recovery Check
      if (dyingPoints?.value >= 1) {
        let recoveryCheckValue = ["recoveryCheck", tokenId, "recoveryCheck"].join(
          this.delimiter
        );
        let recoveryCheckAction = {
          id: "recoveryCheck",
          encodedValue: recoveryCheckValue,
          name: this.i18n("tokenActionHud.pf2e.recoveryCheck"),
        };
        attributeActions.push(recoveryCheckAction);
      }

      // Wounded
      let woundedPoints = actor.system.attributes?.wounded;
      if (woundedPoints)
        attributeActions.push(
          this._getAttributeAction(
            tokenId,
            "wounded",
            this.i18n("tokenActionHud.pf2e.wounded"),
            woundedPoints.value,
            woundedPoints.max
          )
        );

      // Doomed
      if (doomedPoints)
        attributeActions.push(
          this._getAttributeAction(
            tokenId,
            "doomed",
            this.i18n("tokenActionHud.pf2e.doomed"),
            doomedPoints.value,
            doomedPoints.max
          )
        );

      attributes.actions = attributeActions;

      this._combineSubcategoryWithCategory(
        result,
        this.i18n("tokenActionHud.attributes"),
        attributes
      );

      // Rests Subcategory
      let rests = this.initializeEmptySubcategory();

      let restActions = [];

      // Treat Wounds
      let treatWoundsValue = ["utility", tokenId, "treatWounds"].join(
        this.delimiter
      );
      let treatWoundsAction = {
        id: "treatWounds",
        name: this.i18n("tokenActionHud.pf2e.treatWounds"),
        encodedValue: treatWoundsValue,
      };
      restActions.push(treatWoundsAction);

      // Rest for the Night
      let longRestValue = ["utility", tokenId, "longRest"].join(this.delimiter);
      let longRestAction = {
        id: "longRest",
        name: this.i18n("tokenActionHud.pf2e.restNight"),
        encodedValue: longRestValue,
      };
      restActions.push(longRestAction);

      // Take a Breather
      if (game.settings.get("pf2e", "staminaVariant")) {
        let takeBreatherValue = ["utility", tokenId, "takeABreather"].join(
          this.delimiter
        );
        let takeBreatherAction = {
          id: "takeABreather",
          name: this.i18n("tokenActionHud.pf2e.takeBreather"),
          encodedValue: takeBreatherValue,
        };

        restActions.push(takeBreatherAction);
      }

      rests.actions = restActions;

      this._combineSubcategoryWithCategory(
        result,
        this.i18n("tokenActionHud.rests"),
        rests
      );
    }

    return result;
  }

  _getAttributeAction(tokenId, macroType, attrName, attrVal, attrMax) {
    let id = attrName.slugify({ replacement: "_", strict: true });
    let labelValue = [macroType, tokenId, id].join(this.delimiter);
    let attributeAction = { name: attrName, encodedValue: labelValue, id: id };
    attributeAction.info1 = `${attrVal}/${attrMax}`;

    return attributeAction;
  }

  /** @private */
  _buildItemActions(tokenId, macroType, itemList, isPassive = false) {
    let result = this._produceActionMap(
      tokenId,
      itemList,
      macroType,
      isPassive
    );

    result.forEach((i) =>
      this._addItemInfo(
        itemList.find((item) => item.id === i.id),
        i
      )
    );

    return result;
  }

  /** @private */
  _addItemInfo(item, itemAction) {
    itemAction.info1 = this._getQuantityData(item);
  }

  /** @private */
  _getQuantityData(item) {
    let result = "";
    let quantity = item.system.quantity?.value;
    if (quantity > 1) {
      result = quantity;
    }

    return result;
  }

  /** @private */
  _produceActionMap(tokenId, itemSet, type, isPassive = false) {
    return itemSet.map((i) => this._produceAction(tokenId, i, type, isPassive));
  }

  /** @private */
  _produceAction(tokenId, item, type, isPassive = false) {
    let encodedValue = [type, tokenId, item.id].join(this.delimiter);
    let icon;
    let actions = item.system?.actions;
    let actionType = item.system?.actionType?.value;
    if (["free", "reaction", "passive"].includes(actionType)) {
      icon = this._getActionIcon(actionType);
    } else if (actions && !isPassive) {
      let actionValue = parseInt((actions || {}).value, 10) || 1;
      icon = this._getActionIcon(actionValue);
    }

    let img = this._getImage(item);
    return {
      name: item.name,
      encodedValue: encodedValue,
      id: item.id,
      img: img,
      icon: icon,
    };
  }

  _getActionIcon(action) {
    const img = {
      1: `<span style='font-family: "Pathfinder2eActions"'>A</span>`,
      2: `<span style='font-family: "Pathfinder2eActions"'>D</span>`,
      3: `<span style='font-family: "Pathfinder2eActions"'>T</span>`,
      free: `<span style='font-family: "Pathfinder2eActions"'>F</span>`,
      reaction: `<span style='font-family: "Pathfinder2eActions"'>R</span>`,
      passive: ``,
    };
    return img[action];
  }

  _getImage(item) {
    let result = "";
    if (settings.get("showIcons")) result = item.img ?? "";

    return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
  }
}
