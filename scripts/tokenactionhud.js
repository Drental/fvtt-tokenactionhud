import * as settings from "./settings.js";
import { TagDialogHelper } from "./utilities/tagDialogHelper.js";
import { CategoryResizer } from "./utilities/categoryResizer.js";

export class TokenActionHUD extends Application {
  i18n = (toTranslate) => game.i18n.localize(toTranslate);

  refresh_timeout = null;
  tokens = null;
  rendering = false;
  categoryHovered = "";
  defaultLeftPos = 150;
  defaultTopPos = 80;

  constructor(systemManager) {
    super();
    this.systemManager = systemManager;
  }

  async init(user) {
    await this.systemManager.registerDefaultFlags();
    this.categoryManager = await this.systemManager.getCategoryManager(user);
    this.actionHandler = await this.systemManager.getActionHandler(user);
    this.rollHandler = this.systemManager.getRollHandler(); 
  }

  updateSettings() {
    this.updateRollHandler();
    this.update();
  }

  updateRollHandler() {
    this.rollHandler = this.systemManager.getRollHandler();
  }

  setTokensReference(tokens) {
    this.tokens = tokens;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "/modules/token-action-hud/templates/template.hbs",
      id: "token-action-hud",
      classes: [],
      width: 200,
      height: 20,
      left: 150,
      top: 80,
      scale: 1,
      background: "none",
      popOut: false,
      minimizable: false,
      resizable: false,
      title: "token-action-hud",
      dragDrop: [],
      tabs: [],
      scrollY: [],
    });
  }

  getScale() {
    const scale = parseFloat(settings.get("scale"));

    if (scale < 0.5) return 0.5;

    if (scale > 2) return 2;

    return scale;
  }

  getSetting(key) {
    return settings.get(key);
  }

  /** @override */
  getData(options = {}) {
    const data = super.getData();
    data.actions = this.actionList;
    data.id = "token-action-hud";
    data.hovering = settings.get("onTokenHover");
    data.scale = this.getScale();
    data.background = this.getSetting("background") ?? "#00000000";
    settings.Logger.debug("HUD data:", data);
    
    for (const category of data.actions.categories) {
      const advancedCategoryOptions = game.user.getFlag("token-action-hud", `categories.${category.id}.advancedCategoryOptions`);
      if (!advancedCategoryOptions?.compactView) continue;

      const characterCount = advancedCategoryOptions.characterCount ?? 2;
      if (category.subcategories) subcatRecursion(category);

      function subcatRecursion(category) {
        for (const subcategory of category.subcategories) {
          for (const action of subcategory.actions) {
            action.title = action.name;

            if (action.name.length < 2) continue;
            else if (characterCount === 0) action.name = "";
            else action.name = action.name
              .split(" ")
              .map(p => p.slice(0, characterCount))
              .join(" ");
          }

          if (subcategory.subcategories.length) subcategory.subcategories.forEach(s => subcatRecursion(s));
        }
      }
    }

    return data;
  }

  /** @override */
  activateListeners(html) {
    const repositionIcon = "#tah-reposition";
    const editCategoriesButton = "#tah-edit-categories";
    const unlockButton = "#tah-unlock";
    const lockButton = "#tah-lock";
    const category = ".tah-category";
    const titleButton = ".tah-title-button";
    const action = ".tah-action";
  
    const handleClick = (e) => {
      let target = e.target;

      if (target.tagName !== "BUTTON") target = e.currentTarget.children[0];
      let value = target.value;
      try {
        this.rollHandler.handleActionEvent(e, value);
        target.blur();
      } catch (error) {
        settings.Logger.error(e);
      }
    };

    html.find(titleButton).on("click", (e) => {
      this.bringToTop();
    });

    html.find(action).on("click", (e) => {
      handleClick(e);
    });

    html.find(action).contextmenu((e) => {
      handleClick(e);
    });

    function handlePossibleFilterButtonClick(e) {
      let target = e.target;
      if (target.value.length === 0) return;

      let id = target.value;
      let categoryTitle = target.innerText ?? target.outerText;

      TagDialogHelper.showSubcategoryDialog(
          game.tokenActionHUD.categoryManager,
          id,
          categoryTitle
        );
    }

    function handlePossibleFilterSubtitleClick(e) {
      let target = e.target;
      if (target.id.length === 0) return;
      const nestId = target.id;

      TagDialogHelper.showActionDialog(game.tokenActionHUD.actionHandler, nestId);
    }

    function closeCategory(event) {
      if (game.tokenActionHUD.rendering) return;
      let category = $(this)[0];
      $(category).removeClass("hover");
      let id = category.id;
      game.tokenActionHUD.clearHoveredCategory(id);
    }

    function openCategory(event) {
      let category = $(this)[0];
      closeAllCategories(event);
      $(category).addClass("hover");
      let id = category.id;
      game.tokenActionHUD.setHoveredCategory(id);
      CategoryResizer.resizeHoveredCategory(id);
    }

    function closeAllCategories(event) {
      html.find(category).removeClass("hover");
    }

    function toggleCategory(event) {
      let category = $(this.parentElement);
      let boundClick;
      if ($(category).hasClass("hover")) {
        boundClick = closeCategory.bind(this.parentElement);
        boundClick(event);
      } else {
        boundClick = openCategory.bind(this.parentElement);
        boundClick(event);
      }
    }

    html
      .find(titleButton)
      .contextmenu("click", (e) => handlePossibleFilterButtonClick(e));

    html
      .find(".tah-subtitle")
      .click("click", (e) => handlePossibleFilterSubtitleClick(e));
    html
      .find(".tah-subtitle")
      .contextmenu("click", (e) => handlePossibleFilterSubtitleClick(e));

    if (settings.get("clickOpenCategory")) {
      html.find(titleButton).click("click", toggleCategory);
    } else {
      html.find(category).hover(openCategory, closeCategory);
    }

    html.find(unlockButton).mousedown((ev) => {
      ev.preventDefault();
      ev = ev || window.event;
      $(ev.target).addClass('tah-hidden');
      html.find(lockButton).removeClass('tah-hidden');
      html.find(editCategoriesButton).removeClass('tah-hidden');
    });

    html.find(lockButton).mousedown((ev) => {
      ev.preventDefault();
      ev = ev || window.event;
      $(ev.target).addClass('tah-hidden');
      html.find(unlockButton).removeClass('tah-hidden');
      html.find(editCategoriesButton).addClass('tah-hidden');
    });

    html.find(editCategoriesButton).mousedown((ev) => {
      ev.preventDefault();
      ev = ev || window.event;

      TagDialogHelper._showCategoryDialog(this.categoryManager);
    });

    html.find(repositionIcon).mousedown((ev) => {
      this.dragEvent(ev);
    });

    html.find(titleButton).mousedown((ev) => {
      this.dragEvent(ev);
    });

    $(document)
      .find(".tah-filterholder")
      .parents(".tah-subcategory")
      .css("cursor", "pointer");
  }

  dragEvent(ev) {
    ev.preventDefault();
    ev = ev || window.event;
    document.onmousemove = mouseMoveEvent;
    document.onmouseup = mouseUpEvent;

    const element = ev.target.parentElement.closest('div#token-action-hud')
    let pos1 = 0,
    pos2 = 0,
    pos3 = ev.clientX,
    pos4 = ev.clientY,
    elementTop = element.offsetTop,
    elementLeft = element.offsetLeft;

    function mouseMoveEvent (e) {
      e = e || window.event;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elementTop = element.offsetTop - pos2;
      elementLeft = element.offsetLeft - pos1;
      
      // set the element's new position:
      element.style.top = elementTop + "px";
      element.style.left = elementLeft + "px";
      element.style.position = "fixed";
    }

    function mouseUpEvent () {
      document.onmousemove = null;
      document.onmouseup = null;

      game.user.update({
        flags: {
          "token-action-hud": { hudPos: { top: elementTop, left: elementLeft } },
        },
      });
  
      settings.Logger.info(
        `Setting position to x: ${elementTop}px, y: ${elementLeft}px, and saving in user flags.`
      );
    }
  }

  applySettings() {
    if (!settings.get("dropdown")) {
      $(document).find(".tah-content").css({
        bottom: "40px",
        "flex-direction": "column-reverse",
      });
    }
  }

  // Positioning
  trySetPos() {
    if (!this.actionList) return;

    let hudTitle = $(document).find("#tah-hudTitle");
    if (hudTitle.length > 0)
      hudTitle.css("top", -hudTitle[0].getBoundingClientRect().height);

    let token = canvas?.tokens?.placeables.find(
      (t) => t.id === this.actionList?.tokenId
    );
    if (settings.get("onTokenHover") && token) {
      this.setHoverPos(token);
    } else {
      this.setUserPos();
    }

    this.restoreCategoryHoverState();
    this.rendering = false;
  }

  setUserPos() {
    if (
      !(
        game.user.flags["token-action-hud"] &&
        game.user.flags["token-action-hud"].hudPos
      )
    )
      return;

    let pos = game.user.flags["token-action-hud"].hudPos;
    let defaultLeftPos = this.defaultLeftPos;
    let defaultTopPos = this.defaultTopPos;

    return new Promise((resolve) => {
      function check() {
        let elmnt = document.getElementById("token-action-hud");
        if (elmnt) {
          elmnt.style.bottom = null;
          elmnt.style.top =
            pos.top < 5 || pos.top > window.innerHeight + 5
              ? defaultTopPos + "px"
              : pos.top + "px";
          elmnt.style.left =
            pos.left < 5 || pos.left > window.innerWidth + 5
              ? defaultLeftPos + "px"
              : pos.left + "px";
          elmnt.style.position = "fixed";
          resolve();
        } else {
          setTimeout(check, 30);
        }
      }

      check();
    });
  }

  setHoverPos(token) {
    return new Promise((resolve) => {
      function check(token) {
        let elmnt = $("#token-action-hud");
        if (elmnt) {
          elmnt.css("bottom", null);
          elmnt.css(
            "left",
            token.worldTransform.tx +
              (token.width * canvas.dimensions.size + 55) *
                canvas.scene._viewPosition.scale +
              "px"
          );
          elmnt.css("top", token.worldTransform.ty + 0 + "px");
          elmnt.css("position", "fixed");
          resolve();
        } else {
          setTimeout(check, 30);
        }
      }

      check(token);
    });
  }

  setHoveredCategory(catId) {
    this.categoryHovered = catId;
  }

  clearHoveredCategory(catId) {
    if (this.categoryHovered === catId) this.categoryHovered = "";
  }

  restoreCategoryHoverState() {
    if (this.categoryHovered === "") return;

    let id = `#${this.categoryHovered}`;
    let category = $(id);

    if (!category[0]) return;

    if (settings.get("clickOpenCategory")) {
      let button = category.find(".tah-title-button")[0];
      button.click();
    } else {
      category.mouseenter();
    }
  }

  async resetHud() {
    await this.resetFlags();
    this.resetPosition();
  }

  resetPosition() {
    settings.Logger.info(
      `Resetting HUD position to x: 80px, y: 150px, and saving in user flags. \nIf HUD is still not visible, something else may be wrong.\nFeel free to contact Drental#7416 on Discord`
    );
    game.user.update({
      flags: { "token-action-hud": { hudPos: { top: 80, left: 150 } } },
    });
    this.update();
  }

  async resetFlags() {
    settings.Logger.info(
      `Resetting Token Action HUD filter and category flags`
    );
    await this.categoryManager.reset();
    //??? await this.filterManager.reset();
    this.update();
  }

  update() {
    // Delay refresh because switching tokens could cause a controlToken(false) then controlToken(true) very fast
    if (this.refresh_timeout) clearTimeout(this.refresh_timeout);
    this.refresh_timeout = setTimeout(this.updateHud.bind(this), 100);
  }

  async updateHud() {
    settings.Logger.debug("Updating HUD");
    const controlledTokens = this.tokens?.controlled;
    const character = this._getTargetCharacter(controlledTokens);

    let multipleTokens = controlledTokens.length > 1 && !character;

    if ((!character && !multipleTokens) || !this.showHudEnabled()) {
      this.close();
      return;
    }
  
    this.actionList = await this.actionHandler.buildActionList(character);

    this.rendering = true;
    this.render(true);
  }

  // Really just checks if only one token is being controlled. Not smart.
  validTokenChange(token) {
    if (settings.get("alwaysShowHud"))
      return (
        this.isRelevantToken(token) || token.actorId === game.user.character?.id
      );
    else return this.isRelevantToken(token);
  }

  isRelevantToken(token) {
    let controlled = this.tokens?.controlled;
    return (
      controlled?.some((t) => t.id === this.getTokenId(token)) ||
      (controlled?.length === 0 &&
        canvas?.tokens?.placeables?.some(
          (t) => t.id === this.actionList?.tokenId
        ))
    );
  }

  getTokenId(token) {
    return token.id ?? token.id;
  }

  // Is something being hovered on, is the setting on, and is it the token you're currently selecting.
  validTokenHover(token, hovered) {
    return (
      hovered &&
      settings.get("onTokenHover") &&
      token.id === this.actionList?.tokenId
    );
  }

  // Basically update any time. All this logic could be improved.
  validActorOrItemUpdate(actor) {
    const ignoreUpdateActor = game.tokenActionHUD.ignoreUpdateActor;
    if (ignoreUpdateActor) {
      game.tokenActionHUD.ignoreUpdateActor = false;
      return false;
    }
    if (actor) {
      settings.Logger.debug(`actor change, comparing actors`);
      settings.Logger.debug(
        `actor.id: ${actor.id}; this.actionList.actorId: ${this.actionList?.actorId}`
      );

      if (!actor) {
        settings.Logger.debug("No actor, possibly deleted, should update HUD.");
        return true;
      }

      if (this.actionList && actor.id === this.actionList.actorId) {
        settings.Logger.debug("Same actor IDs, should update HUD.");
        return true;
      }

      settings.Logger.debug("Different actor, no need to update HUD.");
      return false;
    }
  }

  showHudEnabled() {
    settings.Logger.debug(
      "showHudEnabled()",
      `isGM: ${game.user.isGM}`,
      `enabledForUser: ${settings.get("enabledForUser")}`,
      `playerPermission: ${settings.get("playerPermission")}`
    );

    if (!settings.get("enabledForUser")) return false;

    return settings.get("playerPermission") || game.user.isGM;
  }

  isLinkedCompendium(compendiumKey) {
    settings.Logger.debug(
      "Compendium hook triggered. Checking if compendium is linked."
    );
    return this.categoryManager.isLinkedCompendium(compendiumKey);
  }

  /** @private */
  _getTargetCharacter(controlled = []) {
    if (controlled.length > 1) return null;
    let character;
    if (controlled.length === 1) {
      const token = controlled[0];
      const actor = token.actor;
      if (!this._userHasPermission(token)) return null;
      character = { token, actor };
      character.id = token?.id ?? actor?.id;
      character.name = token?.name ?? actor?.name;
      if ( character.id ) return character;
    }
    if (
      controlled.length === 0 &&
      game.user.character
    ) {
      if (!settings.get("alwaysShowHud")) return null;

      const actor = game.user.character;
      const token = canvas?.tokens?.placeables.find(
        token => token.actor?.id === actor?.id
      );
      character = { token: token ?? null, actor };
      character.id = token?.id ?? actor.id;
      character.name = token?.name ?? actor.name;
      if (character.id) return character;
    }
      return null;
  }

  /** @private */
  _userHasPermission(token = "") {
    let actor = token.actor;
    let user = game.user;
    return game.user.isGM || actor?.testUserPermission(user, "OWNER");
  }
}
