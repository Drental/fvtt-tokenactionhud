export function register(appName, updateFunc) {
  
    game.settings.register(appName, 'showManeuvers', {
        name: "Show Maneuvers",
        hint: "Display 'Set Maneuver' button when in combat",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {updateFunc(value);}
    });


}