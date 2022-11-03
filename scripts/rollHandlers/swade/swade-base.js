import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseSwade extends RollHandler {
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
        this._rollItem(event, actor, actionId);
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
        this._rollAttribute(event, actor, actionId);
        break;
      case "skill":
        this._rollSkill(event, actor, actionId);
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
  _rollItem(event, actor, actionId) {
    const item = super.getItem(actor, actionId);
    item.show();
  }

  /** @private */
  async _toggleStatus(event, actor, actionId, tokenId) {
    const existsOnActor = actor.effects.find(
      e => e.getFlag("core", "statusId") == actionId);

    const filter = (e) => e.id === actionId;
    let data = CONFIG.statusEffects.find(filter);
    if (!data) data = SWADE.statusEffects.find(filter);

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
  _rollAttribute(event, actor, actionId) {
    actor.rollAttribute(actionId, { event: event });
  }

  /** @private */
  _rollSkill(event, actor, actionId) {
    actor.rollSkill(actionId, { event: event });
  }

  /** @private */
  async _adjustAttributes(event, actor, macroType, actionId) {
    let attribute = actor.system[macroType];

    if (!attribute) return;

    const curValue = attribute.value;
    const max = attribute.max;
    const min = attribute.min ?? 0;

    let value;
    switch (actionId) {
      case "increase":
        value = Math.clamped(curValue + 1, min, max);
        break;
      case "decrease":
        value = Math.clamped(curValue - 1, min, max);
        break;
    }

    let update = { data: {} };

    update.data[macroType] = { value: value };

    await actor.update(update);
  }
}
