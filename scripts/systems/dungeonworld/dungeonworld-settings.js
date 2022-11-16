export function register (app, updateSettings) {
    game.settings.register(app, 'showGmCompendiums', {
        name: game.i18n.localize(
            'tokenActionHud.dungeonWorld.settings.showGmCompendiums.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.dungeonWorld.settings.showGmCompendiums.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateSettings(value)
        }
    })
}
