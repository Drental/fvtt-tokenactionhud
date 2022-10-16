import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";

export class ActionHandlerAlienrpg extends ActionHandler {
  constructor(categoryManager) {
    super(categoryManager);
  }

  /** @override */
  async buildSystemActions(actionList, character, subcategoryIds) {
    const actor = character?.actor;

    if (actor?.type === "character" || actor?.type === "synthetic") {
      return this._buildCharacterActions(actionList, character, subcategoryIds);
    }
    if (actor?.type === "creature") {
      return this._buildCreatureActions(actionList, character, subcategoryIds);
    }
    if (!actor) {
      return this._buildMultiTokenActions(actionList, subcategoryIds);
    }

    return actionList;
  }

  async _buildCharacterActions(actionList, character, subcategoryIds) {
    const inventorySubcategoryIds = subcategoryIds.filter(
      (subcategoryId) =>
        subcategoryId === "weapons" ||
        subcategoryId === "armor" ||
        subcategoryId === "equipment"
    );

    if (subcategoryIds.some((subcategoryId) => subcategoryId === "attributes"))
      this._buildAttributes(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "skills"))
      this._buildSkills(actionList, character);
    if (inventorySubcategoryIds)
      this._buildInventory(actionList, character, inventorySubcategoryIds);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "talents"))
      this._buildTalents(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "agenda"))
      this._buildAgenda(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "consumables"))
      consumables = this._buildConsumables(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "power"))
      power = this._buildPowers(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "conditions"))
      conditions = this._buildConditions(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
      utility = this._buildUtility(actionList, character);

    return actionList;
  }

  async _buildCreatureActions(actionList, character, subcategoryIds) {
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "attributes"))
      attributes = this._buildCreatureAttributes(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "attack"))
      attack = this._buildAttacks(actionList, character);
    if (subcategoryIds.some((subcategoryId) => subcategoryId === "utility"))
      utility = this._buildUtility(actionList, character);

    return actionList;
  }

  _buildInventory(actionList, character, inventorySubcategoryIds) {
    const actor = character.actor;
    const itemTypes = ["weapon", "armor", "item"];
    const items = (actor.items ?? []).filter((item) =>
      itemTypes.includes(item.type)
    );
    const sortedItems = this.sortItems(items);

    // WEAPONS
    if (
      inventorySubcategoryIds.some(
        (subcategoryId) => subcategoryId === "weapons"
      )
    ) {
      const weapons = sortedItems.filter((item) => item.type == "weapon");
      this._buildItems(actionList, character, weapons, "weapons");
    }

    // ARMOR
    if (
      inventorySubcategoryIds.some((subcategoryId) => subcategoryId === "armor")
    ) {
      const armor = sortedItems.filter((item) => item.type === "armor");
      this._buildItems(actionList, character, armor, "armor");
    }

    // EQUIPMENT
    if (
      inventorySubcategoryIds.some((subcategoryId) => subcategoryId === "item")
    ) {
      const equipment = sortedItems.filter((item) => item.type === "item");
      this._buildItems(actionList, character, equipment, "equipment");
    }
  }

  _buildTalents(actionList, character) {
    const actor = character.actor;
    const talents = (actor.items ?? [])
      .filter((item) => item.type === "talent")
      .sort(this.foundrySort);
    this._buildItems(actionList, character, talents, "talents");

    return result;
  }

  _buildAgenda(actionList, character) {
    const actor = character.actor;
    const agenda = (actor.items ?? [])
      .filter((item) => item.type === "agenda")
      .sort(this.foundrySort);
    this._buildItems(actionList, character, agenda, "agenda");

    return result;
  }

  _buildConsumables(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "consumables";
    const subcategoryId = "consumables";

    let rollableConsumables = Object.entries(actor.system.consumables);
    // Remove Power from the list
    rollableConsumables.splice(1, 1);

    let actions = [];
    rollableConsumables.forEach((consumable) => {
      const id = consumable[0];
      const name = this.i18n("tokenActionHud.alienRpg." + consumable[0]);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const img = this.getImage(consumable);
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        img: img,
        selected: true,
      };

      actions.push(action);
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildPowers(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "power";
    const subcategoryId = "powers";

    const powers = (actor.items ?? [])
      .filter((item) => item.type === "item" && item.system.totalPower > 0)
      .sort(this.foundrySort);

    let actions = [];
    powers.forEach((power) => {
      const id = power.id;
      const name = power.name;
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const img = this.getImage(power);
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        img: img,
        selected: true,
      };

      actions.push(action);
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  /** @private */
  _buildItems(
    actionList,
    character,
    items,
    actionType,
    subcategoryId,
    isPassive = false
  ) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actions = items.map((item) =>
      this._buildItem(actorId, tokenId, actionType, item)
    );

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildItem(actorId, tokenId, actionType, item) {
    const itemId = item.id;
    const itemName = item.name;
    const encodedValue = [actionType, actorId, tokenId, actionId].join(
      this.delimiter
    );
    const img = this.getImage(item);
    const info1 = this._getQuantityData(item);
    const info2 = type === "talent" ? this._getUsesData(item) : null;
    let result = {
      id: itemId,
      name: itemName,
      encodedValue: encodedValue,
      img: img,
      info1: info1,
      info2: info2,
      selected: true,
    };

    return result;
  }

  /** @private */
  _getQuantityData(item) {
    let result = "";
    const quantity = item.system.quantity?.value;
    if (quantity > 1) {
      result = quantity;
    }

    return result;
  }

  _buildAttributes(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    let actionType = "attribute";
    const subcategoryId = "attributes";

    const attributes = Object.entries(actor.system.attributes);

    let actions = [];
    attributes.forEach((attribute) => {
      const id = attribute[0];
      const name = this.i18n("tokenActionHud.alienRpg." + attribute[0]);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
        selected: true,
      };
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildCreatureAttributes(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "creatureattribute";
    const subcategoryId = "attributes";

    // Attributes
    const attributes = Object.entries(actor.system.attributes);

    let actions = [];
    attributes.forEach((attribute) => {
      const id = attribute[0];
      const name = this.i18n("tokenActionHud.alienRpg." + attribute[0]);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
      };

      actions.push(action);
    });

    // General
    let general = Object.entries(actor.system.general);
    general.splice(2, 3);

    general.forEach((general) => {
      const id = general[0];
      const name = this.i18n("tokenActionHud.alienRpg." + general[0]);
      const encodedValue = [actionType, actorId, tokenId, id].join(
        this.delimiter
      );
      const action = {
        id: id,
        name: name,
        encodedValue: encodedValue,
      };

      actions.push(action);
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildSkills(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "skill";
    const subcategoryId = "skills";

    const skills = Object.entries(actor.system.skills);

    let actions = [];
    skills.forEach((skill) => {
      const id = skill[0];
      const name = this.i18n("tokenActionHud.alienRpg." + skill[0]);
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
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildAttacks(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const subcategoryId = "attacks";

    if (actor.type !== "creature") return;

    const attacks = ["creatureAttack", "acidSplash"];

    let actions = [];
    attacks.forEach((attack) => {
      const actionType = attack;
      const id = attack;
      const name = this.i18n(`tokenActionHud.alienRpg.${attack}`);
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
    });

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _buildUtility(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const subcategoryId = "utility";

    let actions = [];

    if (
      actor.type === "character" ||
      actor.type === "creature" ||
      actor.type === "synthetic"
    ) {
      // Health
      let health = 0;
      health = actor.system.header?.health;
      if (health) {
        const action = this._getHeaderActions(
          "health",
          actorId,
          tokenId,
          this.i18n("tokenActionHud.alienRpg.health"),
          health.value,
          "10"
        );
        actions.push(action);
      }
    }

    if (actor.type === "character") {
      // Stress
      const stress = actor.system.header?.stress;
      if (stress) {
        const action = this._getHeaderActions(
          "stress",
          actorId,
          tokenId,
          this.i18n("tokenActionHud.alienRpg.stressPoints"),
          stress.value,
          "10"
        );
        actions.push(action);
      }
    }

    if (actor.type === "character" || actor.type === "synthetic") {
      // Roll Stress
      const rollStressActionType = "rollStress";
      const rollStressId = "rollStress";
      const rollStressName = this.i18n("tokenActionHud.alienRpg.rollStress");
      const rollStressEncodedValue = [
        rollStressActionType,
        actorId,
        tokenId,
        rollStressId,
        "",
      ].join(this.delimiter);
      const rollStressAction = {
        id: rollStressId,
        name: rollStressName,
        encodedValue: rollStressEncodedValue,
        selected: true,
      };
      actions.push(rollStressAction);

      // Roll Crit
      const rollCritActionType = "rollCrit";
      const rollCritId = "rollCrit";
      const rollCritName = this.i18n("tokenActionHud.alienRpg.rollCrit");
      const rollCritEncodedValue = [
        rollCritActionType,
        actorId,
        tokenId,
        rollCritId,
        "",
      ].join(this.delimiter);
      const rollCritAction = {
        id: rollCritId,
        name: rollCritName,
        encodedValue: rollCritEncodedValue,
        selected: true,
      };
      actions.push(rollCritAction);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _getHeaderActions(actionType, actorId, tokenId, attrName, attrVal, attrMax) {
    const id = attrName.slugify({ replacement: "_", strict: true });
    const encodedValue = [actionType, actorId, tokenId, id, attrVal].join(
      this.delimiter
    );
    const action = {
      id: id,
      name: attrName,
      encodedValue: encodedValue,
      info1: `${attrVal}/${attrMax}`,
      selected: true,
    };

    return action;
  }

  _buildConditions(actionList, character) {
    const actorId = character.actor?.id;
    const tokenId = character.token?.id;
    const actor = character.actor;
    const actionType = "conditions";
    const subcategoryId = "conditions";

    let actions = [];

    if (actor.type === "character") {
      // Toggle Starving
      const toggleStarvingId = "toggleStarving";
      const toggleStarvingName = this.i18n("tokenActionHud.alienRpg.starving");
      const toggleStarvingEncodedValue = [
        actionType,
        actorId,
        tokenId,
        toggleStarvingId,
        "",
      ].join(this.delimiter);
      const toggleStarvingAction = {
        id: toggleStarvingId,
        name: toggleStarvingName,
        encodedValue: toggleStarvingEncodedValue,
        selected: true,
      };
      const toggleStarvingActive = actor.system.general.starving.value
        ? " active"
        : "";
      toggleStarvingAction.cssClass = `toggle${toggleStarvingActive}`;

      actions.push(toggleStarvingAction);

      // Toggle Dehydrated
      const toggleDehydratedId = "toggleDehydrated";
      const toggleDehydratedName = this.i18n(
        "tokenActionHud.alienRpg.dehydrated"
      );
      const toggleDehydratedEncodedValue = [
        actionType,
        actorId,
        tokenId,
        toggleDehydratedId,
        "",
      ].join(this.delimiter);
      const toggleDehydratedAction = {
        id: toggleDehydratedId,
        name: toggleDehydratedName,
        encodedValue: toggleDehydratedEncodedValue,
        selected: true,
      };
      const toggleDehydratedActive = actor.system.general.dehydrated.value
        ? " active"
        : "";
      toggleDehydratedAction.cssClass = `toggle${toggleDehydratedActive}`;

      actions.push(toggleDehydratedAction);

      // Toggle Exhausted
      const toggleExhaustedId = "toggleExhausted";
      const toggleExhaustedName = this.i18n(
        "tokenActionHud.alienRpg.exhausted"
      );
      const toggleExhaustedEncodedValue = [
        actionType,
        actorId,
        tokenId,
        toggleExhaustedId,
        "",
      ].join(this.delimiter);
      const toggleExhaustedAction = {
        id: toggleExhaustedId,
        name: toggleExhaustedName,
        encodedValue: toggleExhaustedEncodedValue,
        selected: true,
      };
      const toggleExhaustedActive = actor.system.general.exhausted.value
        ? " active"
        : "";
      toggleExhaustedAction.cssClass = `toggle${toggleExhaustedActive}`;

      actions.push(toggleExhaustedAction);

      // Toggle Freezing
      const toggleFreezingId = "toggleFreezing";
      const toggleFreezingName = this.i18n("tokenActionHud.alienRpg.freezing");
      const toggleFreezingEncodedValue = [
        actionType,
        actorId,
        tokenId,
        toggleFreezingId,
        "",
      ].join(this.delimiter);
      const toggleFreezingAction = {
        id: toggleFreezingId,
        encodedValue: toggleFreezingEncodedValue,
        name: toggleFreezingName,
        selected: true,
      };
      const toggleFreezingActive = actor.system.general.freezing.value
        ? " active"
        : "";
      toggleFreezingAction.cssClass = `toggle${toggleFreezingActive}`;

      actions.push(toggleFreezingAction);

      // Toggle Panic
      const togglePanicId = "togglePanic";
      const togglePanicName = this.i18n("tokenActionHud.alienRpg.panic");
      const togglePanicEncodedValue = [
        actionType,
        actorId,
        tokenId,
        togglePanicId,
        "",
      ].join(this.delimiter);
      const togglePanicAction = {
        id: togglePanicId,
        name: togglePanicName,
        encodedValue: togglePanicEncodedValue,
        selected: true,
      };
      const togglePanicActive = actor.system.general.panic.value
        ? " active"
        : "";
      togglePanicAction.cssClass = `toggle${togglePanicActive}`;

      actions.push(togglePanicAction);
    }

    this.addActionsToActionList(actionList, actions, subcategoryId);
  }

  _getUsesData(item) {
    let result = "";

    const uses = item.system.uses;
    if (!uses) return result;

    if (!(uses.max || uses.value)) return result;

    result = uses.value ?? 0;

    if (uses.max > 0) {
      result += `/${uses.max}`;
    }

    return result;
  }
}
