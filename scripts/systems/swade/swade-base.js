import { RollHandler } from "../../core/rollHandler/rollHandler.js";

export class RollHandlerBaseSwade extends RollHandler {
  constructor() {
    super();
  }

  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");

    if (payload.length !== 4) {
      super.throwInvalidValueErr();
    }

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    let actor = super.getActor(actorId, tokenId);

    let hasSheet = ["item"];
    if (this.isRenderItem() && hasSheet.includes(actionType))
      return this.doRenderItem(actorId, tokenId, actionId);

    switch (actionType) {
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
        await this._adjustAttributes(event, actor, actionType, actionId);
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
    const effect = CONFIG.SWADE.statusEffects.find(
      (e) => e.id === actionId
    );
    effect["flags.core.statusId"] = actionId;
    await canvas.tokens.get(tokenId).toggleEffect(effect, {active: !existsOnActor});
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
  async _adjustAttributes(event, actor, actionType, actionId) {
    let attribute = actor.system[actionType];

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

    update.data[actionType] = { value: value };

    await actor.update(update);
  }
}
