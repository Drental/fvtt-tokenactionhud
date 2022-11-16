import { TokenActionHUD } from './tokenactionhud.js'
import { SystemManagers } from './enums/systemManagers.js'
import { SystemManagerFactory } from './systemManagerFactory.js'
import { registerHandlerbars } from './utilities/handlebars.js'
import { switchCSS } from './utilities/utils.js'

const appName = 'token-action-hud'

let systemManager

Hooks.on('init', () => {
    registerHandlerbars()

    game.modules.get('token-action-hud').api = {
    /* put all the relevant classes that systems and modules might need to access here */
    }

    game.settings.register(appName, 'startup', {
        name: 'One-Time Startup Prompt',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    })

    // this allows systems / modules to react to the hook and inject their own SystemManager
    Hooks.call('preCreateTAHSystemManager', SystemManagers)
    const system = game.system.id
    const supportedSystem = SystemManagers[system]
    if (!supportedSystem) {
        ui.notifications.error('Token Action HUD: System is not supported')
        console.error('Token Action HUD: System not supported')
        return
    }
    systemManager = SystemManagerFactory.create(supportedSystem, appName)
    systemManager.registerSettings()
    switchCSS(game.settings.get(systemManager.appName, 'style'))
})

Hooks.once('ready', async () => {
    if (game.user.isGM) {
        if (
            !(game.modules.get('lib-themer')?.active ?? false) &&
            !(game.modules.get('color-picker')?.active ?? false) &&
            !(game.modules.get('colorsettings')?.active ?? false)
        ) {
            const firstStartup = game.settings.get(appName, 'startup') === false
            if (firstStartup) {
                ui.notifications.notify(
                    "Token Action HUD: To set colors within this module's settings, install and enable one of the following 'Color Picker', 'Color Settings' or 'libThemer' modules."
                )
                game.settings.set(appName, 'startup', true)
            }
        }
    }
})

Hooks.on('canvasReady', async () => {
    const user = game.user

    if (!user) throw new Error('Token Action HUD: No user found')

    if (!game.tokenActionHUD) {
        game.tokenActionHUD = new TokenActionHUD(systemManager)
        await game.tokenActionHUD.init(user)
    }

    game.tokenActionHUD.setTokensReference(canvas.tokens)

    Hooks.on('controlToken', (token, controlled) => {
        game.tokenActionHUD.update()
    })

    Hooks.on('updateToken', (token, data, diff) => {
        // If it's an X or Y change, assume the token is just moving
        if (Object.hasOwn(diff, 'y') || Object.hasOwn(diff, 'x')) return
        if (game.tokenActionHUD.validTokenChange(token, data)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('deleteToken', (scene, token, change, userId) => {
        if (game.tokenActionHUD.validTokenChange(token)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('hoverToken', (token, hovered) => {
        if (game.tokenActionHUD.validTokenHover(token, hovered)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('updateActor', (actor, data) => {
        if (game.tokenActionHUD.validActorOrItemUpdate(actor, data)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('deleteActor', (actor, data) => {
        if (game.tokenActionHUD.validActorOrItemUpdate(actor, data)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('deleteItem', (item) => {
        const actor = item.actor
        if (game.tokenActionHUD.validActorOrItemUpdate(actor)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('createItem', (item) => {
        const actor = item.actor
        if (game.tokenActionHUD.validActorOrItemUpdate(actor)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('updateItem', (item) => {
        const actor = item.actor
        if (game.tokenActionHUD.validActorOrItemUpdate(actor)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('renderTokenActionHUD', () => {
        game.tokenActionHUD.applySettings()
        game.tokenActionHUD.trySetPos()
    })

    Hooks.on('renderCompendium', (source, html) => {
        const metadata = source?.metadata
        if (game.tokenActionHUD.isLinkedCompendium(`${metadata?.package}.${metadata?.name}`)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('deleteCompendium', (source, html) => {
        const metadata = source?.metadata
        if (game.tokenActionHUD.isLinkedCompendium(`${metadata?.package}.${metadata?.name}`)) {
            game.tokenActionHUD.update()
        }
    })

    Hooks.on('createCombat', (combat) => {
        game.tokenActionHUD.update()
    })

    Hooks.on('deleteCombat', (combat) => {
        game.tokenActionHUD.update()
    })

    Hooks.on('updateCombat', (combat) => {
        game.tokenActionHUD.update()
    })

    Hooks.on('updateCombatant', (combat, combatant) => {
        game.tokenActionHUD.update()
    })

    Hooks.on('forceUpdateTokenActionHUD', () => {
        game.tokenActionHUD.update()
    })

    Hooks.on('createActiveEffect', () => {
        game.tokenActionHUD.update()
    })

    Hooks.on('deleteActiveEffect', () => {
        game.tokenActionHUD.update()
    })

    game.tokenActionHUD.update()
})
