import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerDemonlord extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;

    if (!actor) {
      this._buildMultipleTokenActions(actionList, subcategoryIds);
      return actionList;
    }

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "challenge"))
      this._buildChallengeRoll(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "weapons"))
      this._buildWeapons(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "talents"))
      this._buildTalents(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "magic"))
      this._buildMagic(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "combat"))
      this._buildCombat(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "rest"))
      this._buildRest(actionList, character);

    return actionList;
  }

  _buildMultipleTokenActions(actionList, subcategoryIds) {
    const allowedTypes = ["creature", "character"];
    const actors = canvas.tokens.controlled
      .map((token) => token.actor)
      .filter((actor) => allowedTypes.includes(actor.type));

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "challenge"))
      this._buildMultiTokenChallengeRoll(actionList, actors);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "rest"))
      this._buildMultiTokenRest(actionList, actors);
  }

  // CHALLENGE ROLL

  _buildChallengeRoll(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;const actionType = "challenge";
    const subcategoryId = "challenge";

    const attributes = Object.entries(actor.system.attributes);
    const actions = attributes.map((attribute) => {
      const id = attribute[0];
      const name = this.i18n("tokenActionHud.attribute." + id);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const icon = this.getImage(attribute);
      return {
        id: id,
        name: name,
        encodedValue: encodedValue,
        icon: icon,
        selected: true,
      };
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildMultiTokenChallengeRoll(actionList, actors) {
    const actorId = "multi";
    const tokenId = "multi;";
    const actionType = "challenge";
    const subcategoryId = "challenge";
    let actions = [];
    if (
      actors.every((actor) => {
        const attributes = Object.entries(actor.system.attributes);
        actions = attributes.map((attribute) => {
          const id = attribute[0];
          const name = this.i18n("tokenActionHud.attribute." + id);
          const encodedValue = [actionType, actorId, tokenId, id].join(
            this.delimiter
          );
          return {
            id: id,
            name: name,
            encodedValue: encodedValue,
            selected: true,
          };
        });
      })
    );

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // WEAPONS

  _buildWeapons(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;const actionType = "weapon";
    const subcategoryId = "weapons";

    const actions = actor.items
      .filter((item) => item.type == actionType)
      .map((item) => {
        const id = item.id;
        const name = item.name;
        const encodedValue = [actionType, actorId, tokenId, id].join(
          this.delimiter
        );
        return {
          id: id,
          name: name,
          encodedValue: encodedValue,
          selected: true,
        };
      });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  // TALENTS

  _buildTalents(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;const actionType = "talent";
    const categoryId = "talents";

    const talents = actor.items.filter((item) => item.type == actionType);

    const groups = [
      ...new Set(talents.map((talent) => talent.system.groupname)),
    ];

    let subcategoryList = [];

    groups.sort().forEach((group) => {
      if (group !== undefined) {
        const subcategoryId = `talents_${group.toLowerCase()}`;
        const subcategoryName = group;
        const subcategory = this.initializeEmptySubcategory(
          subcategoryId,
          categoryId,
          subcategoryName
        );

        const actions = talents
          .filter((talent) => talent.system.groupname === group)
          .map((talent) => {
            const id = talent.id;
            const name = talent.name;
            const encodedValue = [actionType, actorId, tokenId, id].join(
              this.delimiter
            );
            const img = this.getImage(talent);
            const info2 = this._getUsesData(talent);
            return {
              id: id,
              name: name,
              encodedValue: encodedValue,
              img: img,
              info2: info2,
              selected: true,
            };
          });

        this.addToSubcategoriesList(
          subcategoryList,
          subcategoryId,
          subcategory,
          actions
        );
      }
    });

    this.addSubcategoriesToActionList(actionList, subcategoryList, categoryId);
  }

  // MAGIC

  _buildMagic(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;const actionType = "spell";
    const subcategoryId = "spells";
    let subcategoryList = [];

    let spells = actor.items.filter((i) => i.type === "spell");
    spells = this._sortSpellsByRank(spells);

    const traditions = [
      ...new Set(spells.map((spell) => spell.system.tradition)),
    ];
    traditions.sort().forEach((tradition) => {
      if (tradition !== undefined) {
        const traditionSubcategoryId = tradition;
        const traditionName = tradition;
        const subcategory = this.initializeEmptySubcategory(
          traditionSubcategoryId,
          subcategoryId,
          traditionName
        );

        const actions = spells.map((spell) => {
          if (spell.system.tradition === tradition) {
            const id = spell.id;
            const name = spell.name;
            const encodedValue = [actionType, actorId, tokenId, id].join(
              this.delimiter
            );
            const img = this.getImage(spell);
            const info2 = this._getCastingsData(spell);
            return {
              id: id,
              name: name,
              encodedValue: encodedValue,
              img: img,
              info2: info2,
              selected: true,
            };
          }
        });

        this.addToSubcategoriesList(
          subcategoryList,
          traditionSubcategoryId,
          subcategory,
          actions
        );
      }
    });

    this.addSubcategoriesToActionList(actionList, subcategoryList, subcategoryId);
  }

  _sortSpellsByRank(spells) {
    let result = Object.values(spells);

    result.sort((a, b) => {
      if (a.system.rank === b.system.rank)
        return a.name
          .toUpperCase()
          .localeCompare(b.name.toUpperCase(), undefined, {
            sensitivity: "base",
          });
      return a.system.rank - b.system.rank;
    });

    return result;
  }

  _buildCombat(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    if (!tokenId) return;
    const actionType = "utility";
    const subcategoryId = "combat";
    let actions = [];

    // End Turn
    if (game.combat?.current?.tokenId === tokenId) {
      const id = "endTurn";
      const name = this.i18n("tokenActionHud.endTurn");
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      };
      actions.push(action);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildRest(actionList, character) {
    const actor = character?.actor;
    const actorId = character?.actor?.id;
    const tokenId = character?.token?.id;
    const actionType = "utility";
    const subcategoryId = "rest";
    let actions = [];

    if (actor.type === "character") {
      const id = "rest";
      const name = this.i18n("tokenActionHud.demonLord.rest");
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      };
      actions.push(action);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildMultiTokenRest(actionList, actors) {
    const actorId = "multi";
    const tokenId = "multi";
    const actionType = "utility";
    const subcategoryId = "rest";
    let actions = [];

    if (actors.every((actor) => actor.type === "character")) {
      const id = "rest";
      const name = this.i18n("tokenActionHud.demonLord.rest");
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      };
      actions.push(action);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _getUsesData(item) {
    let result = "";

    let uses = item.system.uses;
    if (!uses) return result;

    if (!(uses.max || uses.value)) return result;

    result = uses.value ?? 0;

    if (uses.max > 0) {
      result += `/${uses.max}`;
    }

    return result;
  }

  _getCastingsData(item) {
    let result = "";

    let uses = item.system.castings;
    if (!uses) return result;

    if (!(uses.max || uses.value)) return result;

    result = uses.value ?? 0;

    if (uses.max > 0) {
      result += `/${uses.max}`;
    }

    return result;
  }
}
