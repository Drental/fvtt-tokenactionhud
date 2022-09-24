import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { CompendiumHelper } from "../../categories/compendiumHelper.js";

export class ActionHandlerDw extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActions(token, multipleTokens) {
    let result = this.initializeEmptyActionList();

    if (settings.get("showGmCompendiums")) {
      result.tokenId = "gm";
      result.actorId = "gm";
      await this.addGmCompendiumsToList(result);
    }

    if (!token) return result;

    let tokenId = token.id;

    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    result.actorId = actor.id;

    let actorType = actor.type;

    if (actorType === "npc") {
      let damage = this._getDamage(actor, tokenId);
      let tags = this._getTags(actor, tokenId);
      let specialQualities = this._getSpecialQualities(actor, tokenId);
      this.moves = this._getMovesNpc(actor, tokenId);

      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.damage"),
        damage
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.dungeonWorld.tags"),
        tags
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.dungeonWorld.specialQualities"),
        specialQualities
      );
    } else if (actorType === "character") {
      let damage = this._getDamage(actor, tokenId);
      let startingMoves = this._getMovesByType(actor, tokenId, "starting");
      let advancedMoves = this._getMovesByType(actor, tokenId, "advanced");
      let basicMoves = this._getMovesByType(actor, tokenId, "basic");
      let specialMoves = this._getMovesByType(actor, tokenId, "special");
      let otherMoves = this._getMovesByType(actor, tokenId, "");
      let spells = this._getSpells(
        actor,
        tokenId,
        "spells",
        this.i18n("tokenActionHud.spells"),
        "spell"
      );
      let equipment = this._getSubcategoryByType(
        actor,
        tokenId,
        "equipment",
        this.i18n("tokenActionHud.equipment"),
        "equipment"
      );
      let abilities = this._getAbilities(actor, tokenId);

      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.damage"),
        damage
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.dungeonWorld.starting"),
        startingMoves
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.advanced"),
        advancedMoves
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.dungeonWorld.special"),
        specialMoves
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.dungeonWorld.basic"),
        basicMoves
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.other"),
        otherMoves
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.spells"),
        spells
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.equipment"),
        equipment
      );
      this._combineCategoryWithList(
        result,
        this.i18n("tokenActionHud.abilities"),
        abilities
      );
    }

    if (settings.get("showHudTitle")) result.hudTitle = token.name;

    return result;
  }

  async addGmCompendiumsToList(actionList) {
    let category = this.initializeEmptyCategory("gm");

    let movesSubcategory = this.initializeEmptySubcategory();
    movesSubcategory.actions = await CompendiumHelper.getEntriesForActions(
      "dungeonworld.gm-movesprincipals",
      this.delimiter
    );
    let movesName = this.i18n("tokenActionHud.dungeonWorld.moves");
    this._combineSubcategoryWithCategory(category, movesName, movesSubcategory);

    let chartsSubcategory = this.initializeEmptySubcategory();
    chartsSubcategory.actions = await CompendiumHelper.getEntriesForActions(
      "dungeonworld.charts",
      this.delimiter
    );
    let chartsName = this.i18n("tokenActionHud.dungeonWorld.charts");
    this._combineSubcategoryWithCategory(
      category,
      chartsName,
      chartsSubcategory
    );

    let treasureSubcategory = this.initializeEmptySubcategory();
    treasureSubcategory.actions = await CompendiumHelper.getEntriesForActions(
      "dungeonworld.rollable-tables",
      this.delimiter
    );
    let treasureName = this.i18n("tokenActionHud.dungeonWorld.treasure");
    this._combineSubcategoryWithCategory(
      category,
      treasureName,
      treasureSubcategory
    );

    let categoryName = this.i18n("tokenActionHud.dungeonWorld.gm");
    this._combineCategoryWithList(actionList, categoryName, category);
  }

  _getDamage(actor, tokenId) {
    let result = this.initializeEmptyCategory("damage");
    let damageCategory = this.initializeEmptySubcategory();
    let encodedValue = ["damage", tokenId, "damage"].join(this.delimiter);
    damageCategory.actions.push({
      name: this.i18n("DW.Damage"),
      encodedValue: encodedValue,
      id: "damage",
    });

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("DW.Damage"),
      damageCategory
    );

    return result;
  }

  _getMovesByType(actor, tokenId, movesType) {
    let moves = actor.itemTypes.move.filter(
      (m) => m.system.moveType === movesType
    );
    let result = this.initializeEmptyCategory("moves");

    let rollCategory = this._getRollMoves(moves, tokenId);
    let bookCategory = this._getBookMoves(moves, tokenId);

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.roll"),
      rollCategory
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.book"),
      bookCategory
    );

    return result;
  }

  _getRollMoves(moves, tokenId) {
    let rollMoves = moves.filter((m) => m.system.rollType !== "");
    let rollActions = this._produceMap(tokenId, rollMoves, "move");
    let rollCategory = this.initializeEmptySubcategory();
    rollCategory.actions = rollActions;

    return rollCategory;
  }

  _getBookMoves(moves, tokenId) {
    let bookMoves = moves.filter((m) => m.system.rollType === "");
    let bookActions = this._produceMap(tokenId, bookMoves, "move");
    let bookCategory = this.initializeEmptySubcategory();
    bookCategory.actions = bookActions;

    return bookCategory;
  }

  /** @private */
  _getSubcategoryByType(
    actor,
    tokenId,
    categoryId,
    categoryName,
    categoryType
  ) {
    let items = actor.itemTypes[categoryType];
    let result = this.initializeEmptyCategory(categoryId);
    let actions = this._produceMap(tokenId, items, categoryType);
    let category = this.initializeEmptySubcategory();
    category.actions = actions;

    this._combineSubcategoryWithCategory(result, categoryName, category);

    return result;
  }

  /** @private */
  _getSpells(actor, tokenId, categoryId, categoryName, categoryType) {
    let items = actor.itemTypes[categoryType];
    let preparedSpells = items
      .filter((s) => s.system.prepared)
      .sort(
        (a, b) =>
          parseInt(a.system.spellLevel) - parseInt(b.system.spellLevel)
      );
    let spellsByLevel = preparedSpells.reduce((acc, s) => {
      let spellLevel = s.system.spellLevel;
      let levelName =
        spellLevel == 0
          ? "Rotes"
          : `${this.i18n("tokenActionHud.level")} ${spellLevel}`;
      let levelCategory;
      if (!acc.some((l) => l.name === levelName)) {
        levelCategory = this.initializeEmptySubcategory();
        levelCategory.name = levelName;
        acc.push(levelCategory);
      } else {
        levelCategory = acc.find((l) => l.name === levelName);
      }

      let spellAction = this._produceMap(tokenId, [s], categoryType);

      levelCategory.actions.push(...spellAction);

      return acc;
    }, []);

    let result = this.initializeEmptyCategory(categoryId);
    spellsByLevel.forEach((subcat) => {
      this._combineSubcategoryWithCategory(result, subcat.name, subcat);
    });

    return result;
  }

  /** @private */
  _getAbilities(actor, tokenId) {
    let result = this.initializeEmptyCategory("abilities");

    let abilities = Object.entries(actor.system.abilities);
    let abilitiesMap = abilities.map((a) => {
      return { data: { _id: a[0] }, name: a[1].label };
    });
    let actions = this._produceMap(tokenId, abilitiesMap, "ability");
    let abilitiesCategory = this.initializeEmptySubcategory();
    abilitiesCategory.actions = actions;

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.abilities"),
      abilitiesCategory
    );

    return result;
  }

  _getMovesNpc(actor, tokenId) {
    let result = this.initializeEmptyCategory("moves");

    let biography = actor.system.details.biography;

    let instinctsCategory = this.initializeEmptySubcategory();
    let instinctRegex = new RegExp("<p(|s+[^>]*)>(Instinct:.*?)</ps*>", "g");
    let instinctMap = Array.from(biography.matchAll(instinctRegex)).map((m) => {
      let move = m[2];
      let encodedValue = encodeURIComponent(move);
      return { data: { _id: encodedValue }, name: move };
    });

    let instinctActions = this._produceMap(tokenId, instinctMap, "instinct");
    instinctsCategory.actions = instinctActions;

    let movesCategory = this.initializeEmptySubcategory();
    var movesRegex = new RegExp("<li(|s+[^>]*)>(.*?)</lis*>", "g");
    var movesMap = Array.from(biography.matchAll(movesRegex)).map((m) => {
      let move = m[2];
      let encodedValue = encodeURIComponent(move);
      return { data: { _id: encodedValue }, name: move };
    });

    let movesActions = this._produceMap(tokenId, movesMap, "move");
    movesCategory.actions = movesActions;

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.dungeonWorld.instinct"),
      instinctsCategory
    );
    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.dungeonWorld.monsterMoves"),
      movesCategory
    );

    return result;
  }

  _getTags(actor, tokenId) {
    let result = this.initializeEmptyCategory("tags");
    let tags = actor.system.tagsString.split(",").map((t) => {
      let tag = t.trim();
      if (tag.length === 0) return;

      let encodedValue = encodeURIComponent(tag);
      return { data: { _id: encodedValue }, name: tag };
    });

    let tagCategory = this.initializeEmptySubcategory();
    tagCategory.actions = this._produceMap(tokenId, tags, "tag");

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.dungeonWorld.tags"),
      tagCategory
    );
    return result;
  }

  _getSpecialQualities(actor, tokenId) {
    let result = this.initializeEmptyCategory("qualities");
    let qualities = actor.system.attributes.specialQualities.value
      .split(",")
      .map((s) => {
        let quality = s.trim();
        if (quality.length === 0) return;

        let encodedValue = encodeURIComponent(quality);
        return { data: { _id: encodedValue }, name: quality };
      });

    let qualityCategory = this.initializeEmptySubcategory();
    qualityCategory.actions = this._produceMap(tokenId, qualities, "quality");

    this._combineSubcategoryWithCategory(
      result,
      this.i18n("tokenActionHud.dungeonWorld.specialQualities"),
      qualityCategory
    );
    return result;
  }

  /** @private */
  _produceMap(tokenId, itemSet, macroType) {
    return itemSet
      .filter((i) => !!i)
      .map((i) => {
        let encodedValue = [macroType, tokenId, i.id].join(
          this.delimiter
        );
        let item = { name: i.name, encodedValue: encodedValue, id: i.id };

        this._addItemInfo(i, item);

        return item;
      });
  }

  _addItemInfo(i, item) {
    let uses = item.system?.uses;
    item.info1 = uses ?? "";

    let quantity = item.system?.quantity;
    item.info2 = quantity > 1 ? quantity : "";
  }
}
