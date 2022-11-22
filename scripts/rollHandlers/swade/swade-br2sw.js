import { RollHandler } from "../rollHandler.js";

export class RollHandlerBR2SWSwade extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split("|");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];

    let actor = super.getActor(tokenId);

    let hasSheet = ["item"];
    if (this.isRenderItem() && hasSheet.includes(macroType))
      return this.doRenderItem(tokenId, actionId);

    switch (macroType) {
      case "item":
        this._rollItem(event, actor, actionId, tokenId);
        break;
      case "status":
        await this._toggleStatus(event, actor, actionId, tokenId);
        break;
      case "benny":
        this._adjustBennies(event, actor, actionId);
        break;
      case "gmBenny":
        await this._adjustGmBennies(event, actor, actionId);
        break;
      case "attribute":
        this._rollAttribute(event, actor, actionId, tokenId);
        break;
      case "runningDie":
        actor.rollRunningDie();
        break;
      case "skill":
        this._rollSkill(event, actor, actionId, tokenId);
        break;
      case "wounds":
      case "fatigue":
      case "powerPoints":
        await this._adjustAttributes(event, actor, macroType, actionId);
        break;
      case "utility":
        if (actionId === "endTurn") {
          if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
        }
        break;
    }
  }

  /** @private */
  _rollItem(event, actor, actionId, tokenId) {
    //const item = super.getItem(actor, actionId);
    //item.show();
    let behavior;
    if (event.ctrlKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
    } else if (event.altKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "alt_click");
    } else if (event.shiftKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "shift_click");
    } else {
      behavior = game.settings.get("betterrolls-swade2", "click");
    }
    if (behavior === "trait") {
      game.brsw
        .create_item_card_from_id(tokenId, actor.id, actionId)
        .then((message) => {
          game.brsw.roll_item(message, $(message.data.content), false);
        });
    } else if (behavior === "trait_damage") {
      game.brsw
        .create_item_card_from_id(tokenId, actor.id, actionId)
        .then((message) => {
          game.brsw.roll_item(message, $(message.data.content), false, true);
        });
    } else if (behavior === "system") {
      game.swade.rollItemMacro(actor.items.get(actionId).name);
    } else {
      game.brsw.create_item_card_from_id(tokenId, actor.id, actionId);
    }
  }

  /** @private */
  async _toggleStatus(event, actor, actionId, tokenId) {
    const existsOnActor = actor.effects.find(
      e => e.getFlag("core", "statusId") == actionId);
    const data = game.swade.util.getStatusEffectDataById(actionId);
    data["flags.core.statusId"] = actionId;
    await canvas.tokens.get(tokenId).toggleEffect(data, {active: !existsOnActor});
  }

  /** @private */
  _adjustBennies(event, actor, actionId) {
    if (actionId === "spend") {
      actor.spendBenny();
    }

    if (actionId === "give") actor.getBenny();
  }

  /** @private */
  async _adjustGmBennies(event, actor, actionId) {
    let user = game.user;
    if (!user.isGM) return;

    const benniesValue = user.getFlag("swade", "bennies");
    if (actionId === "spend") {
      game.user.spendBenny()
    }

    if (actionId === "give") {
      game.user.getBenny()
    }

    Hooks.callAll("forceUpdateTokenActionHUD");
  }

  /** @private */
  _rollAttribute(event, actor, actionId, tokenId) {
    //actor.rollAttribute(actionId, {event: event});
    let behavior;
    if (event.ctrlKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
    } else if (event.altKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "alt_click");
    } else if (event.shiftKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "shift_click");
    } else {
      behavior = game.settings.get("betterrolls-swade2", "click");
    }
    if (behavior === "trait" || behavior === "trait_damage") {
      game.brsw
        .create_attribute_card_from_id(tokenId, actor.id, actionId)
        .then((message) => {
          game.brsw.roll_attribute(message, $(message.data.content), false);
        });
    } else if (behavior === "system") {
      actor.rollAttribute(actionId);
    } else {
      game.brsw.create_attribute_card_from_id(tokenId, actor.id, actionId);
    }
  }

  /** @private */
  _rollSkill(event, actor, actionId, tokenId) {
    //actor.rollSkill(actionId, {event: event});
    let behavior;
    if (event.ctrlKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
    } else if (event.altKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "alt_click");
    } else if (event.shiftKey === true) {
      behavior = game.settings.get("betterrolls-swade2", "shift_click");
    } else {
      behavior = game.settings.get("betterrolls-swade2", "click");
    }
    if (behavior === "trait" || behavior === "trait_damage") {
      game.brsw
        .create_skill_card_from_id(tokenId, actor.id, actionId)
        .then((message) => {
          game.brsw.roll_skill(message, $(message.data.content), false);
        });
    } else if (behavior === "system") {
      game.swade.rollItemMacro(actor.items.get(actionId).name);
    } else {
      game.brsw.create_skill_card_from_id(tokenId, actor.id, actionId);
    }
  }

  /** @private */
  async _adjustAttributes(event, actor, macroType, actionId) {
    const actionIdArray = actionId.split(">");
    const changeType = actionIdArray[0];
    const pool = (actionIdArray.length > 0) ? actionIdArray[1] : null;
    let attribute = (macroType === 'powerPoints')
      ? actor.system[macroType][pool]
      : actor.system[macroType];

    if (!attribute) return;

    const curValue = attribute.value;
    const max = attribute.max;
    const min = attribute.min ?? 0;

    let value;
    switch (changeType) {
      case "increase":
        value = Math.clamped(curValue + 1, min, max);
        break;
      case "decrease":
        value = Math.clamped(curValue - 1, min, max);
        break;
    }

    let update = { data: {} };

    update.data[macroType] = (macroType === 'powerPoints')
      ? { [pool]: { value: value } }
      : { value: value };

    await actor.update(update);
  }
}
