export function register(appName, updateFunc) {

    game.settings.register(appName, 'showGeneral', {
        name: "Show General",
        hint: "Display category for general rolls like Attributes, Half-Magic or Recovery",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showFavorites', {
        name: "Show Favorites",
        hint: "Display category for items marked as favorites",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showTalents', {
        name: "Show Talents",
        hint: "Display category for all talents",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showSkills', {
        name: "Show Skills",
        hint: "Display category for all skills",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showMatrices', {
        name: "Show Matrices",
        hint: "Display category for all spell matrices",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showInventory', {
        name: "Show Inventory",
        hint: "Display category for weapons and equipment",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showStatusToggle', {
        name: "Show Status Toggle",
        hint: "Display category for toggling system use and conditions",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });

    game.settings.register(appName, 'showCombat', {
        name: "Show Combat",
        hint: "Display category for combat (Weapons, Matrices, Favorites, etc.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });
}