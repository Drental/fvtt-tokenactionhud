import { RollHandler } from "../rollHandler.js";
import * as settings from "../../settings.js";

export class RollHandlerBasePf2e extends RollHandler {
  BLIND_ROLL_MODE = "blindroll";

  constructor() {
    super();
  }

  eventToRollParams(event) {
    const skipDefault = !game.user.settings.showRollDialogs;
    return {
        secret: !!(event.ctrlKey || event.metaKey),
        skipDialog: event.shiftKey ? !skipDefault : skipDefault,
    };
  }

  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");
    settings.Logger.debug(encodedValue);
    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    let renderable = ["item", "feat", "action", "lore", "ammo"];
    if (renderable.includes(macroType) && this.isRenderItem())
      return this.doRenderItem(tokenId, actionId);

    try {
      const knownCharacters = ["character", "familiar", "npc"];
      if (tokenId === "multi") {
        const controlled = canvas.tokens.controlled.filter((t) =>
          knownCharacters.includes(t.actor?.data.type)
        );
        for (let token of controlled) {
          let idToken = token.data._id;
          await this._handleMacros(event, macroType, idToken, actionId);
        }
      } else {
        await this._handleMacros(event, macroType, tokenId, actionId);
      }
    } catch (e) {
      throw e;
    }
  }

  async _handleMacros(event, macroType, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let charType;
    if (actor) charType = actor.data.type;

    let sharedActions = [
      "ability",
      "spell",
      "item",
      "skill",
      "lore",
      "utility",
      "toggle",
      "strike",
    ];
    if (!sharedActions.includes(macroType)) {
      switch (charType) {
        case "npc":
          await this._handleUniqueActionsNpc(
            macroType,
            event,
            tokenId,
            actor,
            actionId
          );
          break;
        case "character":
        case "familiar":
          await this._handleUniqueActionsChar(
            macroType,
            event,
            tokenId,
            actor,
            actionId
          );
          break;
      }
    }

    switch (macroType) {
      case "ability":
        this._rollAbility(event, actor, actionId);
        break;
      case "skill":
        await this._rollSkill(event, actor, actionId);
        break;
      case "action":
      case "feat":
      case "item":
        this._rollItem(event, actor, actionId);
        break;
      case "spell":
        await this._rollSpell(event, tokenId, actor, actionId);
        break;
      case "utility":
        this._performUtilityMacro(event, tokenId, actionId);
        break;
      case "toggle":
        await this._performToggleMacro(event, tokenId, actionId);
        break;
      case "strike":
        this._rollStrikeChar(event, tokenId, actor, actionId);
        break;
    }
  }

  /** @private */
  async _handleUniqueActionsChar(macroType, event, tokenId, actor, actionId) {
    switch (macroType) {
      case "save":
        this._rollSaveChar(event, actor, actionId);
        break;
      case "attribute":
        this._rollAttributeChar(event, actor, actionId);
        break;
      case "spellSlot":
        await this._adjustSpellSlot(event, actor, actionId);
        break;
      case "heroPoint":
        await this._adjustResources(
          event,
          actor,
          "heroPoints",
          "value",
          actionId
        );
        break;
      case "doomed":
      case "wounded":
      case "dying":
        await this._adjustCondition(event, actor, macroType);
        break;
      case "recoveryCheck":
        actor.rollRecovery({ event });
        break;
      case "familiarAttack":
        this._rollFamiliarAttack(event, actor);
        break;
      case "auxAction":
        this._performAuxAction(event, tokenId, actor, actionId);
        break;
    }
  }

  /** @private */
  async _handleUniqueActionsNpc(macroType, event, tokenId, actor, actionId) {
    switch (macroType) {
      case "save":
        this._rollSaveNpc(event, actor, actionId);
        break;
      case "npcStrike":
        this._rollStrikeNpc(event, tokenId, actor, actionId);
        break;
      case "attribute":
        await this._rollAttributeNpc(event, tokenId, actor, actionId);
        break;
    }
  }

  /** @private */
  _rollSkill(event, actor, actionId) {
    let skill = actor.data.data.skills[actionId];

    if (!skill || !skill.roll) {
      actor.rollSkill(event, actionId);
    } else {
      var abilityBased = `${skill.ability}-based`;
      const options = actor.getRollOptions([
        "all",
        "skill-check",
        abilityBased,
        CONFIG.PF2E.skills[actionId] ?? actionId,
      ]);
      skill.roll({ event, options });
    }
  }

  /** @private */
  _rollAbility(event, actor, actionId) {
    actor.rollAbility(event, actionId);
  }

  /** @private */
  _rollAttributeChar(event, actor, actionId) {
    let attribute = actor.data.data.attributes[actionId];
    if (!attribute) {
      actor.rollAttribute(event, actionId);
    } else {
      const options = actor.getRollOptions(["all", attribute]);
      attribute.roll({ event, options });
    }
  }

  /** @private */
  async _rollAttributeNpc(event, tokenId, actor, actionId) {
    if (actionId === "initiative")
      await actor.rollInitiative({ createCombatants: true });
    else actor.rollAttribute(event, actionId);
  }

  /** @private */
  _rollSaveChar(event, actor, actionId) {
    let save = actor.saves[actionId];
    if (!save) {
      actor.rollSave(event, actionId);
    } else {
      const rollParams = this.eventToRollParams(event);
      save.check.roll(rollParams);
    }
  }

  async _adjustSpellSlot(event, actor, actionId) {
    let actionParts = decodeURIComponent(actionId).split(">");

    let spellbookId = actionParts[0];
    let slot = actionParts[1];
    let effect = actionParts[2];

    let spellbook = actor.items.get(spellbookId);

    let value, max;
    if (slot === "focus") {
      value = actor.data.data.resources.focus.value;
      max = actor.data.data.resources.focus.max;
    } else {
      let slots = spellbook.data.data.slots;
      value = slots[slot].value;
      max = slots[slot].max;
    }

    switch (effect) {
      case "slotIncrease":
        if (value >= max) break;

        value++;
        break;
      case "slotDecrease":
        if (value <= 0) break;

        value--;
    }

    let update;
    if (slot === "focus") {
      actor.update({ "data.resources.focus.value": value });
    } else {
      update = [
        { _id: spellbook.id, data: { slots: { [slot]: { value: value } } } },
      ];
      await Item.updateDocuments(update, { parent: actor });
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  /** @private */
  _rollSaveNpc(event, actor, actionId) {
    const rollParams = this.eventToRollParams(event);
    actor.saves[actionId].check.roll(rollParams);
  }

  async _updateRollMode(rollMode) {
    await game.settings.set("core", "rollMode", rollMode);
  }

  /** @private */
  _rollStrikeChar(event, tokenId, actor, actionId) {
    let actionParts = decodeURIComponent(actionId).split(">");

    let strikeName = actionParts[0];
    let strikeType = actionParts[1];
    let strikeUsage = actionParts[2];

    let strike = actor.data.data.actions
      .filter((a) => a.type === "strike")
      .find((s) => s.name === strikeName);

    if (this.isRenderItem()) {
      let item = actor.data.data.actions
        .filter((a) => a.type === "strike")
        .find((s) => s.name === strikeName).origin;
      if (item) return this.doRenderItem(tokenId, item.data.id);
    }

    if (strikeUsage !== "") {
      strike = strike[strikeUsage];
    }

    let options;
    switch (strikeType) {
      case "damage":
        options = actor.getRollOptions(["all", "damage-roll"]);
        strike.damage({ event, options });
        break;
      case "critical":
        options = actor.getRollOptions(["all", "damage-roll"]);
        strike.critical({ event, options });
        break;
      default:
        options = actor.getRollOptions(["all", "attack-roll"]);
        strike.variants[strikeType]?.roll({
          event,
          options,
        });
        break;
    }
  }

  /** @private */
  _performAuxAction(event, tokenId, actor, actionId) {
    let actionParts = decodeURIComponent(actionId).split(">");

    let strikeName = actionParts[0];
    let strikeType = actionParts[1];
    let strikeUsage = actionParts[2];

    let strike = actor.data.data.actions
      .filter((a) => a.type === "strike")
      .find((s) => s.name === strikeName);

    if (this.isRenderItem()) {
      let item = actor.data.data.actions
        .filter((a) => a.type === "strike")
        .find((s) => s.name === strikeName).origin;
      if (item) return this.doRenderItem(tokenId, item.data.id);
    }

    if (strikeUsage !== "") {
      strike = strike[strikeUsage];
    }

    strike.auxiliaryActions[strikeType]?.execute();
  }

  /** @private */
  _rollStrikeNpc(event, tokenId, actor, actionId) {
    let actionParts = decodeURIComponent(actionId).split(">");

    let strikeId = actionParts[0];
    let strikeType = actionParts[1];

    if (strikeId === "plus") {
      let item = actor.items.find(
        (i) =>
          strikeType
            .toUpperCase()
            .localeCompare(i.name.toUpperCase(), undefined, {
              sensitivity: "base",
            }) === 0
      );

      if (this.isRenderItem()) return this.doRenderItem(tokenId, item.id);

      item.toChat();
      return;
    }

    if (this.isRenderItem()) return this.doRenderItem(tokenId, strikeId);

    let strike = actor.items.get(strikeId);

    switch (strikeType) {
      case "damage":
        strike.rollNPCDamage(event);
        break;
      case "critical":
        strike.rollNPCDamage(event, true);
        break;
      case "0":
        strike.rollNPCAttack(event);
        break;
      case "1":
        strike.rollNPCAttack(event, 2);
        break;
      case "2":
        strike.rollNPCAttack(event, 3);
        break;
    }
  }

  /** @private */
  _rollItem(event, actor, actionId) {
    let item = actor.items.get(actionId);

    item.toChat();
  }

  /** @private */
  _rollFamiliarAttack(event, actor) {
    const options = actor.getRollOptions(["all", "attack"]);
    actor.data.data.attack.roll(event, options);
  }

  /** @private */
  async _rollSpell(event, tokenId, actor, actionId) {
    let actionParts = decodeURIComponent(actionId).split(">");

    let spellbookId = actionParts[0];
    let level = actionParts[1];
    let spellId = actionParts[2];
    let expend = actionParts[3] ?? false;

    if (expend) {
      await this._expendSpell(actor, spellbookId, level, spellId);
      return;
    }

    if (this.isRenderItem()) return this.doRenderItem(tokenId, spellId);

    let spell = actor.items.get(spellId);

    this._rollHeightenedSpell(actor, spell, level);
    return;
  }

  async _expendSpell(actor, spellbookId, level, spellId) {
    let spellbook = actor.items.get(spellbookId);
    let spellSlot = Object.entries(
      spellbook.data.data.slots[`slot${level}`].prepared
    ).find(
      (s) => s[1].id === spellId && (s[1].expended === false || !s[1].expended)
    )[0];

    if (spellSlot === -1) return;

    const key = `data.slots.slot${level}.prepared.${spellSlot}`;
    const options = {
      _id: spellbookId,
    };
    options[key] = {
      expended: true,
    };

    let updates = [options];

    await Item.updateDocuments(updates, { parent: actor });
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async _rollHeightenedSpell(actor, item, spellLevel) {
    let data = item.getChatData(undefined, { spellLvl: spellLevel });
    let token = canvas.tokens.placeables.find((p) => p.actor?.id === actor.id);
    let castLevel = parseInt(spellLevel);
    if (item.data.data.level.value < castLevel) {
      data.properties.push(
        `Heightened: +${castLevel - item.data.data.level.value}`
      );
      if (!item.data.hasOwnProperty("contextualData"))
        item.data.contextualData = {};
      item.data.contextualData.spellLvl = castLevel;
      data.spellLvl = castLevel;
    }

    const template = `systems/pf2e/templates/chat/${item.data.type}-card.html`;
    const templateData = {
      actor: actor,
      tokenId: token ? `${token.scene.id}.${token.id}` : null,
      item: item,
      data: data,
    };

    // Basic chat message data
    const chatData = {
      user: game.user.id,
      speaker: {
        actor: actor.id,
        token: actor.getActiveTokens()[0]?.id,
        scene: actor.getActiveTokens()[0]?.scene.id
      },
      flags: {
        core: {
          canPopout: true,
        },
        pf2e: {
          origin: { uuid: item.uuid, type: item.type },
        },
      },
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };

    // Toggle default roll mode
    const rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode))
      chatData.whisper = ChatMessage.getWhisperRecipients("GM").map(
        (u) => u.id
      );
    if (rollMode === "blindroll") chatData.blind = true;

    // Render the template
    chatData.content = await renderTemplate(template, templateData);

    // Create the chat message
    return ChatMessage.create(chatData, { renderSheet: false });
  }

  _performUtilityMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case "treatWounds":
        this._executeMacroById("6duZj0Ygiqv712rq");
        break;
      case "longRest":
        this._executeMacroById("0GU2sdy3r2MeC56x");
        break;
      case "takeABreather":
        this._executeMacroById("aS6F7PSUlS9JM5jr");
        break;
      case "toggleCombat":
        token.toggleCombat();
        Hooks.callAll("forceUpdateTokenActionHUD");
        break;
      case "toggleVisibility":
        token.toggleVisibility();
        break;
    }
  }

  async _executeMacroById(id) {
    let pack = game.packs.get("pf2e.pf2e-macros");
    pack.getDocument(id).then((e) => e.execute());
  }

  async _adjustResources(event, actor, property, valueName, actionId) {
    let value = actor.data.data.resources[property][valueName];
    let max = actor.data.data.resources[property]["max"];

    if (this.rightClick) {
      if (value <= 0) return;
      value--;
    } else {
      if (value >= max) return;
      value++;
    }

    let update = [
      {
        _id: actor.id,
        data: { resources: { [property]: { [valueName]: value } } },
      },
    ];

    await Actor.updateDocuments(update);
    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async _adjustCondition(event, actor, property) {
    let max = actor.data.data.attributes[property]["max"];

    if (this.rightClick) {
      await actor.decreaseCondition(property);
    } else {
      await actor.increaseCondition(property, { max: max });
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  async _performToggleMacro(event, tokenId, actionId) {
    const actor = super.getActor(tokenId);
    const toggle = JSON.parse(actionId);
    if (!(toggle.domain && toggle.option)) return;

    await actor.toggleRollOption(toggle.domain, toggle.option, toggle.itemId);
  }
}
