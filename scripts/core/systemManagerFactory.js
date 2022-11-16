import { AlienRpgSystemManager } from '../systems/alienrpg/alienrpg.js'
import { BitDSystemManager } from '../systems/bitd/bitd.js'
import { CleenmainSystemManager } from '../systems/cleenmain/cleenmain.js'
import { CoC7SystemManager } from '../systems/coc7/coc7.js'
import { CoSystemManager } from '../systems/co/co.js'
import { CthackSystemManager } from '../systems/cthack/cthack.js'
import { D35ESystemManager } from '../systems/d35e/d35e.js'
import { DemonlordSystemManager } from '../systems/demonlord/demonlord.js'
import { DnD4eSystemManager } from '../systems/dnd4e/dnd4e.js'
import { Dnd5eSystemManager } from '../systems/dnd5e/dnd5e.js'
import { Ds4SystemManager } from '../systems/ds4/ds4.js'
import { DungeonWorldSystemManager } from '../systems/dungeonworld/dungeonworld.js'
import { ED4eSystemManager } from '../systems/ed4e/ed4e.js'
import { ForbiddenLandsSystemManager } from '../systems/forbiddenlands/forbiddenlands.js'
import { GURPSSystemManager } from '../systems/gurps/gurps.js'
import { KamigakariSystemManager } from '../systems/kamigakari/kamigakari.js'
import { LancerSystemManager } from '../systems/lancer/lancer.js'
import { OD6SSystemManager } from '../systems/od6s/od6s.js'
import { Pf1SystemManager } from '../systems/pf1/pf1.js'
import { Pf2eSystemManager } from '../systems/pf2e/pf2e.js'
import { SW5eSystemManager } from '../systems/sw5e/sw5e.js'
import { SfrpgSystemManager } from '../systems/sfrpg/sfrpg.js'
import { Space1889SystemManager } from '../systems/space1889/space1889.js'
import { StarWarsFFGSystemManager } from '../systems/starwarsffg/starwarsffg.js'
import { SwadeSystemManager } from '../systems/swade/swade.js'
import { SymbaroumSystemManager } from '../systems/symbaroum/symbaroum.js'
import { TagmarSystemManager } from '../systems/tagmar/tagmar.js'
import { Tormenta20SystemManager } from '../systems/tormenta20/tormenta20.js'
import { Wfrp4eSystemManager } from '../systems/wfrp4e/wfrp4e.js'

export class SystemManagerFactory {
    static create (system, appName) {
        switch (system) {
        case 'alienrpg':
            return new AlienRpgSystemManager(appName)
        case 'blades-in-the-dark':
            return new BitDSystemManager(appName)
        case 'cleenmain':
            return new CleenmainSystemManager(appName)
        case 'coc':
            return new CoSystemManager(appName)
        case 'CoC7':
            return new CoC7SystemManager(appName)
        case 'cof':
            return new CoSystemManager(appName)
        case 'cthack':
            return new CthackSystemManager(appName)
        case 'D35E':
            return new D35ESystemManager(appName)
        case 'demonlord':
            return new DemonlordSystemManager(appName)
        case 'dnd4e':
            return new DnD4eSystemManager(appName)
        case 'dnd5e':
            return new Dnd5eSystemManager(appName)
        case 'ds4':
            return new Ds4SystemManager(appName)
        case 'dungeonworld':
            return new DungeonWorldSystemManager(appName)
        case 'earthdawn4e':
            return new ED4eSystemManager(appName)
        case 'forbidden-lands':
            return new ForbiddenLandsSystemManager(appName)
        case 'gurps':
            return new GURPSSystemManager(appName)
        case 'kamigakari':
            return new KamigakariSystemManager(appName)
        case 'lancer':
            return new LancerSystemManager(appName)
        case 'od6s':
            return new OD6SSystemManager(appName)
        case 'pf1':
            return new Pf1SystemManager(appName)
        case 'pf2e':
            return new Pf2eSystemManager(appName)
        case 'starwarsffg':
            return new StarWarsFFGSystemManager(appName)
        case 'sw5e':
            return new SW5eSystemManager(appName)
        case 'swade':
            return new SwadeSystemManager(appName)
        case 'sfrpg':
            return new SfrpgSystemManager(appName)
        case 'space1889':
            return new Space1889SystemManager(appName)
        case 'symbaroum':
            return new SymbaroumSystemManager(appName)
        case 'tagmar':
        case 'tagmar_rpg':
            return new TagmarSystemManager(appName)
        case 'tormenta20':
            return new Tormenta20SystemManager(appName)
        case 'wfrp4e':
            return new Wfrp4eSystemManager(appName)
        }
    }
}
