import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseDs4 extends RollHandler {
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

    if (tokenId === "multi" && actionId !== "toggleCombat") {
      for (const token of canvas.tokens.controlled) {
        const tokenActorId = token.actor?.id;
        const tokenTokenId = token.id;
        await this._handleMacros(
          event,
          actionType,
          tokenActorId,
          tokenTokenId,
          actionId
        );
      }
    } else {
      await this._handleMacros(event, actionType, actorId, tokenId, actionId);
    }
  }

  async _handleMacros(event, actionType, actorId, tokenId, actionId) {
    switch (actionType) {
      case "check":
        await this._rollCheckMacro(tokenId, actionId);
        break;
      case "weapon":
      case "spell":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this._rollItemMacro(actorId, tokenId, actionId);
        break;
    }
  }

  async _rollCheckMacro(tokenId, check) {
    const token = super.getToken(tokenId);
    const actor = token?.actor;
    await actor.rollCheck(check, token.document);
  }

  async _rollItemMacro(actorId, tokenId, actionId) {
    const actor = super.getActor(actorId, tokenId);
    const item = super.getItem(actor, actionId);
    return item.use();
  }
}
