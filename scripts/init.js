import { TokenActionHUD } from "./tokenactionhud.js";
import { SystemManagerFactory } from "./managers/systemManagerFactory.js";
import { registerHandlerbars } from "./utilities/handlebars.js";

const appName = "token-action-hud";

let systemManager;

Hooks.on("init", () => {
  registerHandlerbars();

  game.modules.get('token-action-hud').api = {
    /* put all the relevant classes that systems and modules might need to access here */
  }

  const systemManagers = {
    "dnd5e": "dnd5e",
    "dungeonworld": "dungeonworld",
    "pf2e": "pf2e",
    "wfrp4e": "wfrp4e",
    "sfrpg": "sfrpg",
    "sw5e": "sw5e",
    "demonlord": "demonlord",
    "pf1": "pf1",
    "lancer": "lancer",
    "D35E": "D35E",
    "swade": "swade",
    "starwarsffg": "starwarsffg",
    "tormenta20": "tormenta20",
    "blades-in-the-dark": "blades-in-the-dark",
    "symbaroum": "symbaroum",
    "od6s": "od6s",
    "alienrpg": "alienrpg",
    "cthack": "cthack",
    "kamigakari": "kamigakari",
    "tagmar": "tagmar",
    "tagmar_rpg": "tagmar_rpg",
    "ds4": "ds4",
    "coc": "coc",
    "cof": "cof",
    "forbidden-lands": "forbidden-lands",
    "dnd4e": "dnd4e",
    "earthdawn4e": "earthdawn4e",
    "gurps": "gurps",
    "space1889": "space1889",
    "CoC7": "CoC7",
    "cleenmain": "cleenmain"
    /* put all the SystemManagers that are included directly in TAH here */
  }
  Hooks.call('preCreateTAHSystemManager', systemManagers); // this allows systems / modules to react to the hook and inject their own SystemManager
  
  const system = game.system.id;
  const supportedSystem = systemManagers[system];
  if(!supportedSystem) {
    console.error("Token Action HUD: System not supported")
    /* handle the error case somehow. If this happens, it means the current system is not supported */
  }
  systemManager = SystemManagerFactory.create(supportedSystem, appName);
  systemManager.registerSettings();
  if (game.settings.get(systemManager.appName, "dorakoUI")) injectCSS("dorako-action-hud");
});


// Hooks.on("init", () => {
//   registerHandlerbars();

//   let system = game.system.id;

//   systemManager = SystemManagerFactory.create(system, appName);
//   systemManager.registerSettings();
// });

Hooks.once('ready', async () => {
  if (game.user.isGM) {
    if (typeof ColorPicker === 'undefined') {
      ui.notifications.notify("Token Action HUD: To set colors within this module's settings, install and enable the 'Color Picker' module.")
    }
  }
});

Hooks.on("canvasReady", async () => {
  let user = game.user;

  if (!user) throw new Error("Token Action HUD | No user found.");

  if (!game.tokenActionHUD) {
    game.tokenActionHUD = new TokenActionHUD(systemManager);
    await game.tokenActionHUD.init(user);
  }

  game.tokenActionHUD.setTokensReference(canvas.tokens);

  Hooks.on("controlToken", (token, controlled) => {
    game.tokenActionHUD.update();
  });

  Hooks.on("updateToken", (scene, token, diff, options, idUser) => {
    // If it's an X or Y change assume the token is just moving.
    if (diff.hasOwnProperty("y") || diff.hasOwnProperty("x")) return;
    if (game.tokenActionHUD.validTokenChange(token))
      game.tokenActionHUD.update();
  });

  Hooks.on("deleteToken", (scene, token, change, userId) => {
    if (game.tokenActionHUD.validTokenChange(token))
      game.tokenActionHUD.update();
  });

  Hooks.on("hoverToken", (token, hovered) => {
    if (game.tokenActionHUD.validTokenHover(token, hovered))
      game.tokenActionHUD.update();
  });

  Hooks.on("updateActor", (actor) => {
    if (game.tokenActionHUD.validActorOrItemUpdate(actor))
      game.tokenActionHUD.update();
  });

  Hooks.on("deleteActor", (actor) => {
    if (game.tokenActionHUD.validActorOrItemUpdate(actor))
      game.tokenActionHUD.update();
  });

  Hooks.on("deleteItem", (item) => {
    let actor = item.actor;
    if (game.tokenActionHUD.validActorOrItemUpdate(actor))
      game.tokenActionHUD.update();
  });

  Hooks.on("createItem", (item) => {
    let actor = item.actor;
    if (game.tokenActionHUD.validActorOrItemUpdate(actor))
      game.tokenActionHUD.update();
  });

  Hooks.on("updateItem", (item) => {
    let actor = item.actor;
    if (game.tokenActionHUD.validActorOrItemUpdate(actor))
      game.tokenActionHUD.update();
  });

  Hooks.on("renderTokenActionHUD", () => {
    game.tokenActionHUD.applySettings();
    game.tokenActionHUD.trySetPos();
  });

  Hooks.on("renderCompendium", (source, html) => {
    let metadata = source?.metadata;
    if (
      game.tokenActionHUD.isLinkedCompendium(
        `${metadata?.package}.${metadata?.name}`
      )
    )
      game.tokenActionHUD.update();
  });

  Hooks.on("deleteCompendium", (source, html) => {
    let metadata = source?.metadata;
    if (
      game.tokenActionHUD.isLinkedCompendium(
        `${metadata?.package}.${metadata?.name}`
      )
    )
      game.tokenActionHUD.update();
  });

  Hooks.on("createCombat", (combat) => {
    game.tokenActionHUD.update();
  });

  Hooks.on("deleteCombat", (combat) => {
    game.tokenActionHUD.update();
  });

  Hooks.on("updateCombat", (combat) => {
    game.tokenActionHUD.update();
  });

  Hooks.on("updateCombatant", (combat, combatant) => {
    game.tokenActionHUD.update();
  });

  Hooks.on("forceUpdateTokenActionHUD", () => {
    game.tokenActionHUD.update();
  });

  Hooks.on("createActiveEffect", () => {
    game.tokenActionHUD.update();
  });

  Hooks.on("deleteActiveEffect", () => {
    game.tokenActionHUD.update();
  });

  game.tokenActionHUD.update();
});

function injectCSS(filename) {
  const head = document.getElementsByTagName("head")[0];
  const mainCss = document.createElement("link");
  mainCss.setAttribute("rel", "stylesheet");
  mainCss.setAttribute("type", "text/css");
  mainCss.setAttribute(
    "href",
    "modules/token-action-hud/styles/" + filename + ".css"
  );
  mainCss.setAttribute("media", "all");
  head.insertBefore(mainCss, head.lastChild);
}