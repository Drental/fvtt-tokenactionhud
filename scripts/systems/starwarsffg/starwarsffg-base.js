import { RollHandler } from "../../core/rollHandler/rollHandler.js";
import * as settings from "../../core/settings.js";

export class RollHandlerBaseStarWarsFFG extends RollHandler {
  constructor() {
    super();
  }

  doHandleActionEvent(event, encodedValue) {
    const payload = encodedValue.split("|");
    if (payload.length !== 4) {
      super.throwInvalidValueErr();
    }

    const actionType = payload[0];
    const actorId = payload[1];
    const tokenId = payload[2];
    const actionId = payload[3];

    let actor = super.getActor(actorId, tokenId);

    switch (actionType) {
      case "gm":
        switch (actionId) {
          case "destiny":
            return this._rollDestiny();
        }
      case "weapon":
        return game.ffg.DiceHelpers.rollItem(actionId, actor.id);
      case "skill":
        return this._rollSkill(actor, actionId, event);
      case "forcepower":
        return this._rollForcePower(actor, actionId);
    }
  }

  _rollForcePower(actor, itemId) {
    let item = actor.items.get(itemId);
    if (!item) {
      item = game.items.get(itemId);
    }
    if (!item) {
      item = ImportHelpers.findCompendiumEntityById("Item", itemId);
    }
    const forcedice =
      actor.system.stats.forcePool.max -
      actor.system.stats.forcePool.value;
    if (forcedice > 0) {
      let sheet = actor.sheet.getData();
      const dicePool = new DicePoolFFG({
        force: forcedice,
      });
      game.ffg.DiceHelpers.displayRollDialog(
        sheet,
        dicePool,
        `${game.i18n.localize("SWFFG.Rolling")} ${item.name}`,
        item.name,
        item
      );
    }
  }

  _rollDestiny() {
    game.settings.set("starwarsffg", "dPoolLight", 0);
    game.settings.set("starwarsffg", "dPoolDark", 0);
    const messageText = `<button class="ffg-destiny-roll">${game.i18n.localize(
      "SWFFG.DestinyPoolRoll"
    )}</button>`;

    new Map(
      [...game.settings.settings].filter(([k, v]) =>
        v.key.includes("destinyrollers")
      )
    ).forEach((i) => {
      game.settings.set(i.module, i.key, undefined);
    });

    CONFIG.FFG.DestinyGM = game.user.id;

    ChatMessage.create({
      user: game.user.id,
      content: messageText,
    });
  }

  _rollSkill(actor, skillname, event) {
    let difficulty = 2;
    if (event.ctrlKey && !event.shiftKey) {
      difficulty = 3;
    } else if (!event.ctrlKey && event.shiftKey) {
      difficulty = 1;
    }
    const skill = actor.system.skills[skillname];
    const characteristic =
      actor.system.characteristics[skill.characteristic];
    game.ffg.DiceHelpers.rollSkillDirect(
      skill,
      characteristic,
      difficulty,
      actor
    );
  }
}
