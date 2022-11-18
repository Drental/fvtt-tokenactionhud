import { BitDSystemManager } from "./bitd.js";
import { Dnd5eSystemManager } from "./dnd5e.js";
import { DemonlordSystemManager } from "./demonlord.js";
import { DungeonWorldSystemManager } from "./dungeonworld.js";
import { Pf1SystemManager } from "./pf1.js";
import { D35ESystemManager } from "./d35e.js";
import { Pf2eSystemManager } from "./pf2e.js";
import { SfrpgSystemManager } from "./sfrpg.js";
import { SW5eSystemManager } from "./sw5e.js";
import { Wfrp4eSystemManager } from "./wfrp4e.js";
import { LancerSystemManager } from "./lancer.js";
import { SwadeSystemManager } from "./swade.js";
import { StarWarsFFGSystemManager } from "./starwarsffg.js";
import { Tormenta20SystemManager } from "./tormenta20.js";
import { SymbaroumSystemManager } from "./symbaroum.js";
import { AlienrpgSystemManager } from "./alienrpg.js";
import { OD6SSystemManager } from "./od6s.js";
import { CthackSystemManager } from "./cthack.js";
import { KamigakariSystemManager } from "./kamigakari.js";
import { TagmarSystemManager } from "./tagmar.js";
import { Ds4SystemManager } from "./ds4.js";
import { CoSystemManager } from "./co.js";
import { ForbiddenLandsSystemManager } from './forbiddenlands.js'
import { DnD4eSystemManager } from './dnd4e.js'
import { ED4eSystemManager } from './ed4e.js'
import { GURPSSystemManager } from './gurps.js'
import { Space1889SystemManager } from './space1889.js'
import { CoC7SystemManager } from './coc7.js'
import { CypherSystemSystemManager } from './cyphersystem.js'
import { CleenmainSystemManager } from './cleenmain.js'

export class SystemManagerFactory {
  static create(system, appName) {
    switch (system) {
      case "blades-in-the-dark":
        return new BitDSystemManager(appName);
      case "cyphersystem":
        return new CypherSystemSystemManager(appName);
      case "demonlord":
        return new DemonlordSystemManager(appName);
      case "dnd5e":
        return new Dnd5eSystemManager(appName);
      case "dungeonworld":
        return new DungeonWorldSystemManager(appName);
      case "pf1":
        return new Pf1SystemManager(appName);
      case "D35E":
        return new D35ESystemManager(appName);
      case "od6s":
        return new OD6SSystemManager(appName);
      case "pf2e":
        return new Pf2eSystemManager(appName);
      case "sfrpg":
        return new SfrpgSystemManager(appName);
      case "sw5e":
        return new SW5eSystemManager(appName);
      case "wfrp4e":
        return new Wfrp4eSystemManager(appName);
      case "lancer":
        return new LancerSystemManager(appName);
      case "swade":
        return new SwadeSystemManager(appName);
      case "starwarsffg":
        return new StarWarsFFGSystemManager(appName);
      case "tormenta20":
        return new Tormenta20SystemManager(appName);
      case "symbaroum":
        return new SymbaroumSystemManager(appName);
      case "alienrpg":
        return new AlienrpgSystemManager(appName);
      case "cthack":
        return new CthackSystemManager(appName);
      case "kamigakari":
        return new KamigakariSystemManager(appName);
      case "tagmar":
        return new TagmarSystemManager(appName);
      case "tagmar_rpg":
        return new TagmarSystemManager(appName);
      case "ds4":
        return new Ds4SystemManager(appName);
      case "cof":
        return new CoSystemManager(appName);
      case "coc":
        return new CoSystemManager(appName);
      case 'forbidden-lands':
        return new ForbiddenLandsSystemManager(appName);
      case 'dnd4e':
        return new DnD4eSystemManager(appName);
      case 'earthdawn4e':
        return new ED4eSystemManager(appName);
      case 'gurps':
        return new GURPSSystemManager(appName);
      case 'space1889':
        return new Space1889SystemManager(appName);
      case 'CoC7':
        return new CoC7SystemManager(appName);
      case 'cleenmain':
        return new CleenmainSystemManager(appName);
    }
  }
}
