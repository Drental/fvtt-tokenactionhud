import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseDs4 extends RollHandler {
  /** @override */
  async doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");

    if (payload.length != 3) {
      super.throwInvalidValueErr();
    }

    const macroType = payload[0];
    const tokenId = payload[1];
    const actionId = payload[2];

    if (characterId === "multi") {
      for (const token of canvas.tokens.controlled) {
        await this._handleMacros(event, macroType, token.id, actionId);
      }
    } else {
      await this._handleMacros(event, macroType, actorId, tokenId, actionId);
    }
  }

  async _handleMacros(event, macroType, actorId, tokenId, actionId) {
    switch (macroType) {
      case "check":
        await this._rollCheckMacro(event, actorId, tokenId, actionId);
        break;
      case "weapon":
      case "spell":
        if (this.isRenderItem()) this.doRenderItem(actorId, tokenId, actionId);
        else this._rollItemMacro(event, actorId, tokenId, actionId);
        break;
    }
  }

  async _rollCheckMacro(event, actorId, tokenId, check) {
    const token = super.getToken(tokenId);
    const actor = token?.actor;
    await actor.rollCheck(check, token.document);
  }

  async _rollItemMacro(event, actorId, tokenId, itemId) {
    const actor = super.getActor(characterId);
    const item = super.getItem(actor, itemId);
    return item.use();
  }
}
