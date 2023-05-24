# Changelog

Call to Arms! Token Action HUD is moving to [Token Action HUD Core](https://foundryvtt.com/packages/token-action-hud-core) with dedicated Token Action HUD system modules. Token Action HUD Core has new customisation features over this one, but there are far too many systems for me to move over and continue to maintain.

If you're interested in picking up development of the Token Action HUD system module for your favourite system, please get in touch with me at the [Token Action HUD Core repos](https://github.com/Larkinabout/fvtt-token-action-hud-core) or on Discord (Russell#7071).

# [3.0.21] 2023-05-24
- Alien RPG - Update strings, courtesy of Txus5012.
- SWADE - Add equip status to items, courtesy of mclemente (#268).

# [3.0.20] 2023-04-27
- Chroniques Oubliées - Fix capacity bug, courtesy of Qaw.
- Pathfinder 2 - Update French localization, courtesy of rectulo.
- SWADE - Add skill icons to Skills, courtesy of mclemente (#392).
- SWADE - Do not display the Wild Die for Skills, courtesy of mclemente (#393).
- SWADE - Add support for Actions, courtesy of mclemente (#394).
- SWADE - Add icons to Status Effects, courtesy of mclemente.
- SWADE - Update the Brazilian Portuguese localization, courtesy of mclemente.

# [3.0.19] 2023-01-28
- Forbidden Lands - Fix missing Animal Handling and Sleight of Hand language references (#371).
- Forbidden Lands - Fix actions not rolling due to required click event (#378).
- Lancer - Update actions for v10 support - Provided by dodgepong (#377).
- Pathfinder 2 - Fix error with Strikes caused by new weapons (#368).
- Starfinder - Replace deprecated 'data' reference (#369).
- Starfinder - Fix spells not showing the Spell Configuration dialog (#370).

# [3.0.18] 2023-01-08
- Core - Resize menus to the window height when the hotbar is hidden (#327).
- GURPS - Add attributes, equipment and HP/FP buttons - Provided by crnormand (#366).
- Pathfinder 2e - Fix multiple strikes with the same name causing the wrong strike to be rolled (#361).
- Pathfinder 2e - Fix warning when selecting a familiar token - Provided by xdy (#362).
- Pathfinder 2e - Hide unidentified effects for non-GM users - Provided by Felerius (#367).
- SWADE - Show Power Points with zero available points (#353).

# [3.0.17] 2022-12-09
- Core - Add touch support for dragging the HUD (#341).
- Core - Update Dorako style - Provided by Dorako (#350).
- Core - Fix keybindings event listener not firing when clicking buttons on the HUD (#352).
- Pathfinder 2e - Update BR language file - Provided by zengerbr (#344).
- Pathfinder 2e - Fix thrown strike actions not passing alt usage to roll (#347).
- Star Wars 5e - Fix skill functionality and brought in line with D&D 5e - Provided by supervj (#348).

# [3.0.16] 2022-11-22
- Cypher System - Sort Abilities and Skills into categories - Provided by farling42 (#336).
- Dungeonslayers 4 - Use item.roll() instead of item.use() - Fixed by Athemis (#340).
- Pathfinder 1e - Fix parentless custom skills not working (#334).
- SWADE - Add support for additional Power Points pools (#330).
- SWADE - Fix 'Running Die' action not working on core and displaying wrong die in subcategory name (#335).

# [3.0.15] 2022-11-18
- Cypher System - Add support for the Cypher System system - Provided by farling42 (#331).
- OpenD6 Space - Fix HUD for v10-compatible release - Provided by madseumas (#332).
- Tormenta20 - Fix HUD for v10-compatible release (#333).

# [3.0.14] 2022-11-10
- D&D5e - Fix error when Ruins of Symbaroum module is enabled and the actor has spells (#186).
- Pathfinder 1e - Use spellbook labels for categories (#320).
- Pathfinder 2e - Remove duplicate Effects category and fix subcategory name - Provided by Felerius.
- Starfinder - Fix Crew Actions (#201).
- SWADE - Add 'Running Die' action to the Attributes category under the Derived Stats subcategory (#173).
- SWADE - Fix Entangled status still applying core statuses when the Fantasy Companion system setting was enabled (#322).
- SWADE - Fix Power Points not updating on the HUD following change in SWADE 2.1.0 (#328).
- Symbaroum - Fix HUD for the Symbaroum following v10 release.

# [3.0.13] 2022-10-26
- Core - Update fr.json - Provided by rectulo.
- Core - Add 'Enable Dragging' module setting.
- Core - Add collapse/expand button to left of HUD.
- Core - Fix overflowing subtitles (#314).
- Core - Fix scene and hotbar context menus appearing below the HUD (#316).
- 3.5e SRD - Fix Psionic Power spells not showing on the HUD (#145).
- D&D 5e - Fix title references when Group by Action Type is enabled (#318).
- Pathfinder 1e - Fix BAB and CMB title references (#315).
- Pathfinder 2e - Fix error caused by tokens with no actor assigned (#145).

# [3.0.12] 2022-10-18
- Core - Fix menus closing when cursor moves into space between buttons (#308).
- Core - Replace 'Dropdown Categories' module setting with 'Direction' module setting to support left and right directions in the future. The new setting should pick up the old setting.
- Core - Fix HUD holding focus when 'Enable for Current User' is unticked and Foundry VTT is reloaded (#311).
- Pathfinder 2e - Fix deprecated StatisticModifier#name (#302) - Provided by Drental.
- Pathfinder 2e - Add melee and thrown icons to actions in the Strikes category (#307).

# [3.0.11] 2022-10-08
- Core - Fix compendium subcategories (#295).
- Core - Fix HUD appearing above dialog windows (#297). 
- Core - Fix 's is not defined' error (#298).
- Core - Fix color pickers defaulting to black when upgrading to Foundry VTT v10.287 and the ColorSettings module is in use (#300).
- Core - Add Compact option to the Style module setting.
- Starfinder - Categorise Features into Active Feats and Passive Feats subcategories (#55).
- Star Wars FFG - Fix HUD for v1.80-alpha3 (#299).

# [3.0.10] 2022-10-02
- Core - Improve Foundry VTT style to better match core style, especially around toggleable buttons. 
- Core - Center align names on buttons (#286).
- Core - Bring HUD to top by clicking on the category buttons (#284).
- D&D 5e - Fix Effects/Conditions for Combat Utility Belt's Enhanced Conditions (#291).
- D&D 5e - Fix overlay toggle when right-clicking effects/conditions.
- GURPS - Update GURPS support to v5 - Provided by crnormand.
- GURPS - Fix raw HTML output (#292) - Fixed by crnormand.
- Starfinder - Fix Equipment and Features actions not working (#290).
- Starfinder - Add handling to roll attack on shift-click and roll damage on ctrl-click (#141).

# [3.0.9] 2022-09-28
- Core - Add support for libThemer, ColorPicker, or ColorSettings libraries for color pickers (#278) - Provided by mouse0270.
- Core - Move ColorPicker and ColorSettings to `relationships.flags.optional` / `relationships.optional` (#278) - Provided by mouse0270.
- D&D 4e - Fix power grouping overriding sheet with default value - Fix provided by draconas1.
- Earthdawn - Fix equipped weapons not appearing in the Combat category (#283).
- Pathfinder 1e - Add handling for skipping action dialogs while holding down the shift key (#138).
- Pathfinder 2e - Remove width limit on the Strikes category (#286).
- Misc - Add changelog.md to package.

## [3.0.8] 2022-09-21
- Core - Refactor language files - thanks Larkinabout!
- pf2e - allow actors to strike again in 4.1.0 - handiwork.

## [3.0.7] 2022-09-19
- Core - Fix issue with loading styles on the Forge and some modules
- SPACE 1889 - Entry "Active Defense" is missing for creatures - Fixes provided by Scepfari (#274) 

## [3.0.6] 2022-09-14
- Core - Fix Dorako UI stylesheet (#264). **NB. The Dorako UI module setting has been replaced by the Style setting.**
- Pathfinder 2e - Fix Strikes not displaying for NPCs.
- Space: 1889 - Fixes provided by Scepfari (#265 & #266)
- SWADE - Add setting to allow (or disallow) roles to give bennies from the HUD (#179).
- SWADE - Add HUD for Vehicle actors (#245).
- SWADE - General update for Foundry VTT v10.

## [3.0.5] 2022-09-13
- Core - Rework default CSS.
- Core - Add module settings for the button background color and button border color. The Color Picker module is required for these settings (#261).
- Core - Rename 'Toggle Combat State' and 'Toggle Visibility' buttons to show the current state on the button (#157).
- D&D 4e/5e, Forbidden Lands, Pathfinder 1e/2e, WFRP 4e - Add module settings to show/hide indivdual categories (#146).
- D&D 4e/5e, Forbidden Lands, Pathfinder 1e/2e, Starfinder, WFRP 4e  - Add 'End Turn' button to the Utility category (#167).
- D&D 5e - Add support for Dfred's Convenient Effects (#113).
- Pathfinder 1e - Fix unprepared spells displaying for the Arcanist class (#214).
- Pathfinder 2e - Recategorise subcategories in the Features category to match the default character sheet (#218).
- Pathfinder 2e - Remove items with zero quantity from the HUD (#223).
- Tormenta20 - Fix Abilities, Skills and Conditions categories (#207).

## [3.0.4] 2022-09-07

- tah - Make content height responsive to HUD position. A scroll bar will now appear for long lists.
- dnd5e - Add Weapon category for Vehicle actor type (#244).
- dnd5e - Recategorise Features for Vehicle actor type to match Default 5e Vehicle Sheet.
- forbidden-lands - Fix some skills not including character stats (#241).
- forbidden-lands - Fix monster attacks not working.
- forbidden-lands - Add character spells and monster skills to the HUD.
- pf2e - Fix error caused by missing async/await chain on getSpellData().

## [3.0.3] 2022-09-05

- tah - More v10 compat.
- pf1 - Fix error when selecting token (#258).
- dnd5e - Fix error when selecting more than one token (#259).

## [3.0.2] 2022-09-04

- tah - More v10 compat - big thanks to Wickermoon!!
- forbidden-lands - add code for conditions and consumables - thank you Larkinabout!

## [3.0.1] 2022-09-04

- tah - replace deprecated Methods across the codebase - big thanks to Larkinabout!!

## [3.0.0] 2022-09-03

- tah - rough v10 migration - Work in Progress, *I might not finish this! But got it to load.*
- SW5e - brought in line with dnd5e chhanges - thanks Kakeman89!
- dnd4e - allow skipping dialogs on some actions - thanks Draconas!

## [2.3.0] 2022-08-26

- pf2e - fixed npc strike usage - done by yours truly

## [2.2.29] 2022-08-25

- pf2e - fixed *not* alternative strike usages (combination weapon and thrown) - done by yours truly

## [2.2.28] 2022-08-24

- TAH - fixed security alert about terser - done by yours truly
- pf2e - fixed alternative strike usages (combination weapon and thrown) - done by yours truly
- pf2e - make rightclick on strikes open the item sheet - done by yours truly

## [2.2.27] 2022-07-25

- cleenmain - system fixed - thank you Khaali!

## [2.2.26] 2022-07-12
- TAH - adjusted custom category width within advanced category options to prevent conflicts with UI modules.

## [2.2.25] 2022-07-11

- TAH - implemented advanced category options.

## [2.2.24] 2022-07-06

- cleenmain - build fixed - done by my own fingers! (don't blame them, they said they weren't able to test because they didN#t know the build process)

## [2.2.23] 2022-07-06

- cleenmain - new system - thank you Khaali!

## [2.2.22] 2022-07-04

- pf2 - don't cast spells on rightclick - done by my own fingers!

## [2.2.21] 2022-06-30

- pf1 - fix HUD for new classes - thank you claudekennilol and Noon

## [2.2.20] 2022-06-28

- TAH - add sourcemap - thank you Supe
- pf2e - change spell posting to spell casting - thank you Supe

## [2.2.19] 2022-06-17

- TAH - update tagify.css - thank you Shark that walks like a man

## [2.2.18] 2022-06-16

- pf2e - refactor skill and save rolling - thank you Supe
- TAH - update tagify - thank you Supe
- Localisation - update all localisation in ja.json - Thank you Yasnen!!

## [2.2.17] 2022-06-04

- Lancer - Quick fix for tech attacks. - thank you purringInsanity
- localisation - updated french and english keys - thank you QaW

## [2.2.16] 2022-05-26

- dungeonworld - fix calculation of damage modifier - thank you sanguaire
- localisation - updated japanese - thanks Yasnen
- CoC7 - added system support - thanks snap01

## [2.2.15] 2022-04-29

- pf2e - improve code for toggles - thank you shark that walks like a man
- gurps - V4 Support (Right mouse click on damage) - thanks Nose66 

## [2.2.14] 2022-04-10

- pf2e - fix unequipped unarmed weapons and spell attack mod display

## [2.2.13] 2022-04-03

- space1889 - added new system - thanks Scepfari

## [2.2.12] 2022-04-03

- dnd5e - add option to show items without activations (this also allows to use items withoout Activations as Magic Items)

## [2.2.11] 2022-04-03

- pf2e - fix toggles

## [2.2.10] 2022-04-02

- pf2e - fix NPCs

## [2.2.9] 2022-04-02

- TAH - Fixed Hotbar height styling
- pf2e - added the weapon draw/sheath/etc. actions.

## [2.2.8] 2022-03-31

- GURPS - Fixed large melee and ranged lists - thanks Nose66

## [2.2.7] 2022-03-30

- GURPS - updated GURPS support - thanks Nose66
- WFRP - Split basic and advaanced skills correctly - thanks Txus5012
- dnd4e - Added Action Point, 2nd Wind and Deathsave - thanks drakonas
- Opend6 - extend vehicle actions - thanks extend vehicle actions

## [2.2.6] 2022-03-09

- TAH - Add a new UI option with permission from Dorako - THANK YOU DORAKO!
- GURPS - updated GURPS support - thanks Nose66

## [2.2.5] 2022-03-06

- pf2e - work around toggles getting stuck bug
- GURPS - updated GURPS support - thanks Nose66

## [2.2.4] 2022-03-04

- TAH - spanish translation update - thanks EnteriCansinos
- dnd4e - Updated conditions - thanks draconas
- cthack - new features - thanks Qaw
- pf2e - unbreak dcs - thanks supe
- ED4e - Update - thanks qrizzl
- GURPS - Added new system - thanks Nose66

### Changed

- pf2e - restore inventory after 3.4

## [2.2.3] 2022-02-17

### Changed

- pf2e - restore inventory after 3.4

## [2.2.2] 2022-02-15

### Changed

- pf2e - Add Scene to speaker info to resolve tokens - thanks Dorako!

## [2.2.1] 2022-02-14

### Changed

- TAH - blur the event target after handling the event - thanks tposney!
- SWADE - Update for status Effects in v1.0 - thanks bloy!
- pf2e - fix spell modifier reminder - thanks SoldierDash!
- DnD4e - Update integration - thanks Draconas!

## [2.2.0] 2022-02-06

### Changed

- ED4e - Added support for Earthdawn4e system - thanks qrizzl!

## [2.1.2] 2022-02-03

### Changed

- TAH - revert all changes.

## [2.1.1] 2022-02-03

### Changed

- TAH - delete a superfluous </div>

## [2.1.0] 2022-02-03

### Changed

- TAH - better handling of focus - thanks tposney
- TAH - use a div on the name of an action - thanks Dorako

## [2.0.19] 2022-01-31

### Changed

- ds4 - Fix for actions for multiple tokens - thanks Ghost

## [2.0.18] 2022-01-30

### Changed

- Od6s - Move vehicle actions to a separate category and adds resistance/shield rolls - thanks madseumas

## [2.0.17] 2022-01-29

### Changed

- pf2e - stop consuming ammunition twice

## [2.0.16] 2022-01-27

### Changed

- SWADE - Better handling of better rolls2 for SWADE rolls - thanks javierriveracastro

## [2.0.15] 2022-01-22

### Changed

- pf2e - actually fix npc saving throws part 3

## [2.0.14] 2022-01-21

### Changed

- sw5e - fixed action HUD for newer charaacters - thanks supervj

## [2.0.13] 2022-01-18

### Changed

- dnd4e - some minor bugfixes - thanks draconas

## [2.0.12] 2022-01-13

### Changed

- sw5e - major update and overhaul - thanks supervj
- localisation - updated french localisation - thanks Qaw

## [2.0.11] 2022-01-10

### Changed

- pf2e - actually fix npc saving throws part 2

## [2.0.10] 2022-01-07

### Changed

- cof - Handle capacities actions - thanks Qaw
- cthack - remove random console.log - thanks Qaw

## [2.0.9] 2022-01-02

### Changed

- Token Action HUD - italian localisation - thanks smoothingplane
- DnD4e - added a new system! - thank you draconas!!

## [2.0.8] 2022-01-02

### Changed

- pf2e - actually fix npc saving throws

## [2.0.7] 2021-12-29

### Changed

- pf2e - fix npc saving throws
- swade - preemplively adjust for a possible future change to power data structure

## [2.0.6] 2021-12-26

### Changed

- pf2e - fix save rolls

## [2.0.5] 2021-12-24

### Changed

- Token Action HUD - fix deprecation messages about pack.metadata.entity

## [2.0.4] 2021-12-22

### Changed

- SWADE - only throw one Benny

## [2.0.3] 2021-12-22

### Changed

- Token Action HUD - restored macro section functionality

## [2.0.2] 2021-12-17

### Changed

- Token Action HUD - adress breaking change in Keyboard API

## [2.0.1] 2021-12-14

### Changed

- Token Action HUD - first steps to V9 compatibility
- Od6s - add vehicle actions - thanks madseumas

## [1.3.29] 2021-11-28

### Changed

- pf2e - restore HUD NPC Strikes

## [1.3.28] 2021-11-27

### Changed

- swade - show special abilities in Edges/hindrances Tab
- pf2e - remove ammo information from combination weapons' melee strike

## [1.3.27] 2021-11-27

### Changed

- pf2e - add support for combination weapons

## [1.3.26] 2021-11-22

### Changed

- pf2e - fix PC HUD

## [1.3.25] 2021-11-22

### Changed

- TAH - fix Compendium Helper check for existing index - thanks In3luki

## [1.3.24] 2021-11-22

### Changed

- pf2e - add recovery Checks

## [1.3.23] 2021-11-21

### Changed

- pf2e - adjust heroPoint path

## [1.3.22] 2021-11-20

### Changed

- pf2e - adjust heroPoint path

## [1.3.21] 2021-11-19

### Changed

- cthack - use generic translations where possible - thanks QaW
- lancer - add missing await - thanks Purring Insanity
- pf1 - rework spellbook category - thanks dmrickey

## [1.3.18] 2021-11-03

### Changed

- forbidden-lands - added system to TAH (WIP) - thanks Sozin and aMediocreDad!

## [1.3.17] 2021-11-02

### Changed

- wfrp - sort subcategories alphabetically
- ds4 - fix localisation files
- rework - theoretically allow modules to create TAH Addins for systems
- pf2e - localize skills

## [1.3.16] 2021-10-18

### Changed

- pf2e - make two handed toggle less confusing (hopefully)
- pf2e - cantrips can no longer be eypended
- deprecation - removed deprecated hasPerm usage
- localisation - structured localisation files for my sanity

## [1.3.15] 2021-10-17

### Changed

- localisation - fixed en and fr localisation files - thanks Qaw

## [1.3.14] 2021-10-17

### Changed

- DS4 - add options to show target numbers thanks ghost91
- COF/COC - new systems added to the module - thanks Qaw

## [1.3.13] 2021-10-05

### Changed

- localisation - update french localisation thanks Qaw
- LANCER - performance and code clarity thanks purringInsanity

## [1.3.12] 2021-09-24

### Changed

- pf2 - allow bards to adjust focus points again
- pf2 - add two handed toggle to player actor HUDs
- kamigakari - update to respect control key on rolls - thanks ksx0330

## [1.3.11] 2021-09-20

### Changed

- ds4 - don't throw errors when no token is selected
- pf1 - don't fix what ain't broke

## [1.3.10] 2021-09-19

### Changed

- Token Action HUD - reduce minimum scale

## [1.3.9] 2021-09-19

### Changed

- Token Action HUD - Refactoring of several systems to avoid using deprecated getters.
- Token Action HUD - increase granularity of scaling and reduce minimum scale
- ds4 - added Dungeonslayers 4 system - thank you Ghost!
  * checks
  * Items (only weapons at the moment)
  * Spells

## [1.3.8] 2021-09-19

### Changed

- pf2e - don't break on unfilled preparable slots

## [1.3.7] 2021-09-19

### Changed

- pf2e - updated how spells are detected
- pf2e - removed option to roll spell attack or damage directly

## [1.3.6] 2021-09-12

### Changed

- Tagmar - fixed the implementation - thank you to marcoswalker
- LANCER - fixed rightclick for the inventory category - thanks PurringInsanity

## [1.3.5] 2021-09-02

### Changed

- Tagmar - added support the system - thank you to marcoswalker

## [1.3.4] 2021-09-02

### Changed

- d35e - added support for full attacks

## [1.3.3] 2021-09-02

### Changed

- added necessary files again

## [1.3.2] 2021-09-02

### Bugfix

- pf1 - sort conditions alphabetically
- dnd5e ItemMacro - clean up Code

### Changed

- remove unnecessary files from download

## [1.3.1] 2021-09-02

### Bugfix

- removed circular dependency
- keep Classnames in terser

## [1.3.0] 2021-08-31

### Changed

- Lancer system Update - thanks PurringInsanity
- symbaroum system update - thanks khaali
- added Rollup to project - BIG THANKS to pgrosslicht. This should increase resilience to certain CDN bugs and overall speed up loading times.

## [1.2.0] 2021-08-26

### Changed

- better rolls dnd5e - Removed handler since it's no longer necessary

## [1.1.22] 2021-08-20

### Changed

- kamigakari - system update - thanks ksx0330

## [1.1.21] 2021-08-06

### Changed

- localisation - new localisation for korean by drdwing

### Bugfix

- PF2e - restore focus point adjustments

## [1.1.20] 2021-07-26

### Changed

- dnd35e - sort skulls alphabetically for translations - thanks David

## [1.1.19] 2021-07-23

### Bugfix

- PF2e - Fix Chatcard created by spells

## [1.1.18] 2021-07-22

### Bugfix

- WFRP4e - updates for Version 4.0.2 and foundry 0.8.8 compatibility by Silentmark

## [1.1.17] 2021-07-17

### Bugfix

- SFRPG - restore spellbooks and fix deprecated calls

## [1.1.16] 2021-07-16

### Bugfix

- remove errors when closing or creating items in the sidebar

## [1.1.15] 2021-07-13

### Bugfix

- DnD5e Item Macro integration - execute the Item macro instead of throwing an error.

## [1.1.14] 2021-07-12

### Bugfix

- Update hooks so the HUD updates when changes happen to the cuttent actor

## [1.1.13] 2021-07-08

### Bugfix

- use actor.items.get instead of actor.getOwnedItems (deprecation)

### Changed

- PF1 add setting to hide disabled features

## [1.1.12] 2021-07-07

### Bugfix

- pf2e Fix HUD for Familiars that don't have a master

## [1.1.11] 2021-07-07

### Bugfix

- dnd3.5 Fix for skills by Rughalt
- LANCER fixes by PurringInsanity (System seems not to be up to date though)
- PF2e fix cantrip display for spont spellcasting

## [1.1.10] 2021-07-06

### Bugfix

- sfrpg show HUD for starships with weapons

## [1.1.7] 2021-07-04

### Bugfix

- PF2E Fix rolling saves with multiple actors
- PF2E Fix display of signature spells
- Fix Displaying HUD hovering close to the selected token setting

## [1.1.6] 2021-07-03

### Bugfix

- Pf2E Fix expending and regaining spell slots in pf2e thanks to Drental
- SWADE BR2 Update swade-br2sw from zk-sn

## [1.1.5] 2021-06-26

### Bugfix

- DND5e fixes for a variety of issues thanks to benbarbour

### Changed

- SW5e update thanks to jtljac

## [1.1.4] 2021-06-22

### Bugfix

- Fix call for token id resulting in error messages, thanks to jessev14

## [1.1.3] 2021-06-22

### Bugfix

- SWADE BR improvements thanks to zk-sn again

### Added

- Support for Kamigakari system thanks to ksx0330
- Alternative DND5e action list thanks to benbarbour

## [1.1.2] 2021-06-20

### Bugfix

- more PF2E fixes (spell cards), thanks to Drental

## [1.1.1] 2021-06-20

### Bugfix

- Pf2E thanks to Drental
- SWADE Better Rolls thanks to zk-sn

## [1.1.0] 2021-06-14

### Changed

- Added setting to set background color of HUD.

## [1.0.36] 2021-06-14

### Bugfix

- DND35 fix thanks to Rughalt

## [1.0.35] 2021-06-14

### Bugfix

- Update module.json to allow installs on 0.7.x - if the HUD doesn't work, please report the issue and consider downgrading temporarily to 1.0.19 until I sort my shit out.

## [1.0.34] 2021-06-12

### Bugfix

- DND5e - fingers crossed now supports 0.7 and 0.8.

## [1.0.33] 2021-06-11

### Changed

- Set minimum compatible core version to 0.8.0 for the moment, hopefully only temporary while I work shit out

## [1.0.32] 2021-06-11

### Bugfix

- DND5e - fix multiple token status toggles, thanks to benbarbour

## [1.0.31] 2021-06-09

### Bugfix

- Check for new location of packs and macros

## [1.0.30] 2021-06-08

### Bugfix

- Savage Worlds update for 0.8.6

## [1.0.29] 2021-06-08

### Bugfix

- DND5e - i'm an idiot, checking for tokenId in the wrong place

## [1.0.28] 2021-06-08

### Bugfix

- check for undefined tokens thanks to stwlam
- Symbaroum for 0.8 thanks to Khaali-dev

## [1.0.27] 2021-06-08

### Bugfix

- PF2E item.roll replaced with toChat

## [1.0.26] 2021-06-08

### Bugfix

- PF2E check for null value on containerId

## [1.0.25] 2021-06-08

### Changed

- DND5e remove all (most?) \_id references

## [1.0.24] 2021-06-08

### Changed

- ItemMacro - discontinue use of backwards compatibility function

## [1.0.23] 2021-06-08

### Bugfix

- PFE2 adjustments for 0.8.6

## [1.0.22] 2021-05-30

### Bugfix

- DND5e incorrectly hiding all actions when setting to hide longer actions was enabled

## [1.0.21] 2021-05-30

### Bugfix

- DND5e Managed to fuck up 0.8.5 and 0.7.10 at once, but fixed by p-becker

## [1.0.20] 2021-05-29

### Bugfix

- Demonlord - fix challenge rolls thanks to mpgenio

### Changed

- DND5e Add support for 0.8.5 (should not break 0.7.x but please let me know if it does)

## [1.0.19] 2021-05-28

### Bugfix

- PF2E Add support for heightened and signature spells thanks to Atraeus

### Added

- Add support for Better Rolls for SWADE2 thanks to zk-sn (famous director Zack Snyder, I assume)

## [1.0.18] 2021-05-26

### Bugfix

- PF2E Render effect switches for NPCs, thanks to Drental
- PF2E fix deprecated roll syntax, thanks to Drental
- WFRP fix error using unloaded ranged weapon, thanks to silentmark

### Changed

- Pf2E add translation to multiselect, thanks to Drental
- PF2E remove abilities from multiselect, thanks to Drental
- PF2E call macros by ID

## [1.0.17] 2021-05-11

### Bugfix

- WFRP fix for dodge skill thanks to silentmark
- Add missing comma in Spanish language file

### Added

- Cthulhu Hack thanks to Kristov

## [1.0.16] 2021-05-04

### Bugfix

- Various SotDL bugfixes thanks to patrickporto

### Added

- OpenD6 Space Support thanks to madseumas
- Alien RPG support thanks to pwatson100

### Changed

- Update to Spanish localization thanks to WallaceMcGregor
- Remove abilities from PF2 thanks to Drental
- Localize saves in PF2E thanks to Drental

## [1.0.15] 2021-04-18

### Added

- WFRP - Additional basic actions thanks to Marek

### Bugfix

- DnD35 - Bugfixes from Rughalt

## [1.0.14] 2021-04-13

### Added

- WFRP - Support for basic actions

## [1.0.13] 2021-04-13

### Added

- DnD35 - Order skills by name based on localization, thanks to Kaitiff

## [1.0.12] 2021-04-04

### Added

- Symbaroum - Support for Symbaroum thanks to Khaali-dev

## [1.0.11] 2021-04-03

### Bugfix

- PF2E - Add Take a Breather macro, thanks to JonWaterfall

## [1.0.10] 2021-03-28

### Bugfix

- PF2E Fix NPC saves thanks to itrase

## [1.0.9] 2021-03-17

### Bugfix

- SW5e fix for type error thanks to Zasshem

### Added

- Blades in the Dark support - Thanks to DarkWizarD24

## [1.0.8] 2021-03-17

### Changed

- PF2E - Show when no ammunition is chosen

## [1.0.7] 2021-03-17

### Changed

- PF2E - Show ammunition for strikes as an additional button that does nothing

## [1.0.6] 2021-03-16

### Added

- Start of DE localization thanks to ksingvo
- PF1E - support for BAB, Ranged, and Melee rolls

## [1.0.5] 2021-03-12

### Bugfix

- SW5e fix from baccalla death save roll

## [1.0.4] 2021-03-08

### Added

- Tormenta20 - support for Tormenta20 thanks to (mclemente)[https://github.com/mclemente]Show skills that do not require training

## [1.0.3] 2021-02-27

### Bugfix

- PF1 Show skills that do not require training

## [1.0.2] 2021-02-24

### Added

- Setting for marking 'active' buttons with an asterisk for a clearer indication that the button is active

## [1.0.1] 2021-02-24

### Changed

- PF2E Strikes now consume ammo if configured to do so in the sheet

## [1.0.0] 2021-02-23

### Note

- Getting tired of 0.10.\*

### Bugfix

- DnD5e - should no longer break when encountering custom skills.

### Changed

- PF1E untrained skills are no longer shown

## [0.10.37] 2021-02-21

### Bugfix

- PF2E spells correctly categorise by heightened spell level (if necessary)

## [0.10.36] 2021-02-20

### Added

- SW5e conditions thanks to Therasin/Zasshem

## [0.10.35] 2021-02-18

### Changed

- Add new options for the Item Macro to choose between keeping the original item, only the item macro item, or showing both.

## [0.10.34] 2021-02-18

### Added

- SW5e class features thanks to Therasin/Zasshem

## [0.10.33] 2021-02-06

### Added

- Option to toggle between drop-up and drop-down categories

## [0.10.32] 2021-02-06

### Added

- Added a scale slider to adjust the size of the HUD (thanks to Alexis-Grimm for the suggestion)

## [0.10.31] 2021-02-05

### Changed

- Extended Japanese localisation support thanks to touge

## [0.10.30] 2021-01-27

### Bugfix

- SFRPG fix crew actions

## [0.10.29] 2021-01-22

### Added

- Further changes to Starwars FFG thanks to zaborontest#0241

## [0.10.28] 2021-01-21

### Added

- Starwars FFG support thanks to zaborontest#0241

## [0.10.27] 2021-01-21

### Added

- Pf2e - Add active feats to actions as well

### Bugfix

- PF2e - Correct icon for actions, reactions, and free actions

## [0.10.26] 2021-01-21

### Added

- Pf2e - Effects Category

## [0.10.25] 2021-01-21

### Bugfix

- SWRPG - Fix shields category for starships

## [0.10.24] 2021-01-20

### Added

- Pf1 - Initiative roller, may not work currently, but waiting for a PF1 update

### Bugfix

- PF1 Readd missing inventory category

## [0.10.23] 2021-01-15

### Bugfix

- General - Update HUD if unselected character token is removed from scene and 'always show HUD' is enabled
- PF1 - Show correct charges for linked items

## [0.10.22] 2021-01-07

### Bugfix

- DND5e - Apparently only latest version has config values for attunement so add manual fallback value;

## [0.10.21] 2021-01-07

### Bugfix

- DND5e - Fix support for magic items with new attunement changes

## [0.10.20] 2021-01-04

### Added

- DND5e - Adds support for Obsidian 5e thanks to Avelyne#3141 (select Obsidian Character Sheets in the setting's HUD Roll Handler)

## [0.10.19] 2021-01-01

### Changed

- SWADE - Show all NPC items for categories not just equipped items.

## [0.10.18] 2020-01-01

### Bugfix

- PF2E - Include backpacks in containers

## [0.10.17] 2020-12-31

### Bugfix

- PF2E - Correct name of treat wounds macro

### Added

- PF2E - Mass rolling for perception and initiative

### Changed

- PF2E - Show contents of containers as separate subcategories

## [0.10.16] 2020-12-29

### Changed

- Pf2E - Hide unequipped items

## [0.10.15] 2020-12-29

### Changed

- D&D5e - Add event to death saving throw to overcome error thrown by MidiQoL

### Bugfix

- PF2E - Filter out unready strikes

## [0.10.14] 2020-12-21

### Bugfix

- D&D5e - Fixed concentration change that meant spells showing 0 uses

## [0.10.13] 2020-12-18

### Added

- D&D5e - CUB Conditions should now be overlayable

## [0.10.12] 2020-12-17

### Added

- D&D5e - Condition toggling for single and multiple tokens (this doesn't work correctly if there are multiple tokens sharing linked actor data, because it is toggled for each individually basically switching it on and off again repeatedly)

## [0.10.11] 2020-12-16

### Added

- PF2e - Rest utilities for multiple tokens if all tokens are characters
- PF2e - Skills for multiple tokens if skill is shared among all tokens

## [0.10.10] 2020-12-15

### Added

- PF2e - Ability and save support for multiple tokens at once

## [0.10.9] 2020-12-14

### Added

- SWADE - Support for GM Bennies
- SFRPG - Support for Starship Sheets

## [0.10.8] 2020-12-13

### Added

- SWADE - Support for SWADE

## [0.10.7] 2020-12-11

### Added

- D35E - Support for D&D 3.5 SRD thanks to Rughalt

## [0.10.6] 2020-12-09

### Added

- PF2E - Blind roll with ctrl click

## [0.10.5] 2020-12-09

### Added

- DND5e - Support for toggling active effects

## [0.10.4] 2020-12-09

### Added

- PF1 - Support for toggling conditions

## [0.10.3] 2020-12-07

### Bugfix

- PF2E - Passive actions should correctly show when setting is disabled

### Changed

- PF1E - swapped icons for immediate and swift actions

## [0.10.2] 2020-12-07

### Changed

- PF2E - Check for null actions just in cases

## [0.10.1] 2020-12-07

### Added

- PF2E - Added support for new NPC strikes.

## [0.10.0] 2020-12-03

### Changed

- DND5e - Removed inconsumables category and roll everything into consumables.

## [0.9.29] 2020-12-02

### Bugfix

- More attempts to improve async behaviour for custom subcategories

## [0.9.28] 2020-12-02

### Bugfix

- Forgot to await some calls when adding custom subcategories

## [0.9.27] 2020-11-30

### Bugfix

- Icon style overriding all icons, so specified inside TAH

## [0.9.26] 2020-11-29

### Changed

- Add background to active buttons to distinguish them during mouseover

## [0.9.25] 2020-11-27

### Changed

- PF2E - PC initiative label now reflects skill chosen
- PF2E - Toggles by default go in a separate category but there is a setting to place them above strikes.

## [0.9.24] 2020-11-27

### Changed

- Removed unnecessary setting for keeping categories open when clicked

## [0.9.23] 2020-11-25

### Added

- SotDL - Added attribute rolls for multiple token selection thanks to Xacus

## [0.9.22] 2020-11-25

### Added

- PF2E - Added subcategory for toggles under Strikes

## [0.9.21] 2020-11-24

### Changed

- Add multi rolling for initiative and update text on button

## [0.9.20] 2020-11-23

### Bugfix

- Again, categories should remain open if option is enabled

## [0.9.19] 2020-11-23

### Bugfix

- Click on category should only operate on title button not on empty space between actions

## [0.9.18] 2020-11-23

### Changed

- Category should no longer close when token is updated

## [0.9.17] 2020-11-23

### Changed/added

- Added option to keep categories open (if click-to-open is enabled) when an action is pressed, so categories don't have to be constantly reopened

## [0.9.16] 2020-11-21

### Bugfix

- DND Check for null combat

## [0.9.15] 2020-11-21

### Bugfix

- PF1 - Multi token saves now roll correctly.

## [0.9.14] 2020-11-21

### Changed

- DND5e - Restrict showing initative to current active encounter

## [0.9.13] 2020-11-21

### Added

- DND5e - Initiative rolls under Utilities

## [0.9.12] 2020-11-18

### Bugfix

- SFRPG - prevent HUD crashing when used with character with unnamed profession

## [0.9.11] 2020-11-17

### Added

- DungeonWorld support for special and uncategoriesd moves

## [0.9.10] 2020-11-17

### Bugfix

- PF1 Bugfix for subskills

## [0.9.9] 2020-11-16

### Added

- LANCER RPG - render item sheet with right click

## [0.9.8] 2020-11-16

### Bugfix

- LANCER RPG fix delimiter

## [0.9.7] 2020-11-16

### Added

- LANCER RPG support thanks to Khaos#6127.

## [0.9.6] 2020-11-14

### Bugfix

- PF1 - Non-GM players now see the unidentified item name in their HUD until item is identified.

## [0.9.5] 2020-11-14

### Bugfix

- Magic Items now correctly hide themselves if they do not meet attuned or equipped requirement.

## [0.9.4] 2020-11-14

### Bugfix

- Add some cursory checks to protect against tokens with no actors.

## [0.9.3] 2020-11-11

### Changed

- PF1E - Spontaneous spellbooks should no longer slots to be shown
- DND5e - consumables and items without an action (or the 'none' action) should also be filtered out of the HUD inventory.

## [0.9.2] 2020-11-11

### Added

- PF1E - added rolls for Concentration for spellbooks other than primary

## [0.9.1] 2020-11-11

### Bugfix

- PF2E - NPC skills should work again

### Added

- PF1E - added rolls for Concentration (uses primary caster level) under spells, Combat Maneuver Bonus under Attacks, and Defenses under Saves.

## [0.9.0] 2020-11-10

### Changed

- Refactored where systems store their action and roll handlers away from one blob class.

## [0.8.16] 2020-11-09

### Bugfix

- PF2E - Handling of lore skills has changed in PF2E API so that is now fixed

## [0.8.15] 2020-11-08

### Bugfix

- WFRP - show only equipped weapons for characters and fix spellDialog call

## [0.8.14] 2020-11-08

### Bugfix

- PF2E - Lore skills appeared twice

## [0.8.13] 2020-11-04

### Bugfix

- PF1 - Check for 'passive' feats

## [0.8.12] 2020-11-04

### Bugfix

- DND5e - Consume tip on action would show nothing if value was 0

## [0.8.11] 2020-11-04

### Changed

- Try to ensure only one category can be opened at a time

## [0.8.10] 2020-11-04

### Added

- Setting for click-to-open categories (that also need to be clicked to close) mainly for touch/tablet users

## [0.8.9] 2020-11-03

### Changed

- Filter for categories now only appears on right-click (not left-click)

## [0.8.8] 2020-11-02

### Bugfix

- DND5e - using wrong variable to look up skill names

## [0.8.7] 2020-11-02

### Bugfix

- DND5e - do not attempt to add skills or spells to a vehicle actor

## [0.8.6] 2020-11-02

### Added

- Chinese localization thanks to hmqgg
- Polish localization thanks to silentmark

## [0.8.5] 2020-11-02

### Bugfix

- PF1 - Custom skills that aren't subskills are now accounted for

## [0.8.4] 2020-11-01

### Changed

- PF1 - General improvements

## [0.8.3] 2020-10-30

### Removed

- PF1 rests - I'll reimplement it when I know how but for now better not to show it

## [0.8.2] 2020-10-30

### Added

- PF1 support - Early days, pretty rough and ready, but please provide feedback

## [0.8.1] 2020-10-22

### Bugfix

- DND5e/SW5e - During multi-select, tokens without actors would cause the multiselect to fail.

## [0.8.0] 2020-10-15

### Changed

- PF2E - Order of items, feats, and lore skills should now reflect sheet ordering.

## [0.7.20] 2020-10-15

### Added

- SFRPG - Add miscellaneous category and setting for unassigned feats.

## [0.7.19] 2020-10-14

### Added

- SotDL - Support for Shadow of the Demonlord, thanks to Xacus.

## [0.7.18] 2020-10-12

### Added

- SW5E - Support for Star Wars 5e

## [0.7.17] 2020-09-28

### Added

- Pf2e - Support for Familiars

## [0.7.16] 2020-09-22

### Bugfix

- Pf2e - Add action categories for exploration and downtime and add setting for ignoring passive actions (default: false)

## [0.7.15] 2020-09-22

### Bugfix

- SFRPG - recognise professions for skills

## [0.7.14] 2020-09-16

### Bugfix

- MagicItemExtender - embarrassingly failed to apply De Morgan's law properly when checking null inventory

## [0.7.13] 2020-09-16

### Bugfix

- PF2e - Something I don't understand with skill checks was failing

## [0.7.12] 2020-09-16

### Bugfix

- HUD would fail to load on characters where magic item was the only item and it had no activation cost.

## [0.7.11] 2020-09-15

### Bugfix

- Try to suppress worldtransform error (didn't do anything bad, was just annoying)

### Changed

- DND5e - if a token has 0 in a stat (e.g. vehicles in wisdom) then that save or ability will not be displayed while selected

## [0.7.10] 2020-09-15

### Bugfix

- DND5e - continue trying to fix multiple token selection.

## [0.7.9] 2020-09-14

### Bugfix

- DND5e - support for multiple tokens were not working when Item-Macro was active.

## [0.7.8] 2020-09-12

### Bugfix

- Forgot to add Item-Macro roll support, only added the actions.

## [0.7.7] 2020-09-12

### Changed

- Moved support for Item-Macro to all systems. Now conducts a generic check to see if the module is running.

## [0.7.6] 2020-09-10

### Nothing

- Trying to fix a bug but it has no effect.

## [0.7.5] 2020-09-10

### Bugfix

- DND5e consumables should no longer be shown twice, once in consumables and once in inconsumables

## [0.7.4] 2020-09-10

### Bugfix

- Brazilian Portuguese now correctly referenced in the module.json.

## [0.7.3] 2020-08-26

### Bugfix

- PF2E - Spell heightening wasn't working

## [0.7.2] 2020-08-26

### Bugfix

- PF2E - NPC strike bonus information should now calculate more correctly

## [0.7.1] 2020-08-26

### Changed

- The HUD can now be repositioned even when hovering is enabled.

## [0.7.0] 2020-08-25

### Bugfix

- Hopefully reduced chance of additional categories not being deleted properly

### Added

- DND5e - Added ability to select multiple tokens and roll checks and saves, as well as toggle their visibility (combat toggling will come later, at the moment there is a Foundry bug preventing its implementation)

## [0.6.14] 2020-08-23

### Bugfix

- Added further Korean localization

## [0.6.13] 2020-08-23

### Bugfix

- DND5e Magic Items: Don't show category if it is empty

## [0.6.12] 2020-08-19

### Bugfix

- WFRP: skill filter had disappeared with the addition of compendiums, so readding filter on skill subcategories

## [0.6.11] 2020-08-19

### Added

- DND5e: Added Midi QoL support via the Core Roller.

## [0.6.10] 2020-08-18

### Bugfix

- DungeonWorld GM compendiums were not being shown

## [0.6.9] 2020-08-17

### Added

- SFRPG: add additional information to items (capacity, uses, quantity, usages)
- SFRPG: add spell information (and setting to disable if desired)

## [0.6.8] 2020-08-17

### Added

- SFRPG: icons to distinguish non-action actions (if you have better icon suggestions, let me know)

## [0.6.7] 2020-08-17

### Added

- DND5e: icons to distinguish non-action actions

## [0.6.6] 2020-08-17

### Added

- PF2E: Add tracking for dying, wounded, and doomed in utility menu (left-click increments, right-click decrements)

## [0.6.5] 2020-08-16

### Added

- PF2E: Show action cost for spells (those with a cost of three actions or less)

### Changed

- HUD title should only be displayed for actors with actions (e.g., not loot or hazard tokens)

## [0.6.4] 2020-08-16

### Bugfixes

- Custom subcategories weren't clearing from the HUD properly

## [0.6.3] 2020-08-16

### Added

- Merged in further Korean localization thanks to drdwing

## [0.6.2] 2020-08-15

### Bugfixes

- WFRP: Hide 'blank' icon

## [0.6.0] 2020-08-15

### Bugfixes

- WFRP: Action List builder was breaking because it was missing reference to settings

## [0.6.0] 2020-08-15

### Bugfixes

- Probably the opposite, be careful updating and don't do it before a game.

### Added

- Icons for some abilities (Pf2e: action usage; DND5e: proficiency)
- Images for things that support images (can be disabled in settings)
- Ability to add new categories and subcategories, to use compendiums and macros (pretty experimental at this stage and totally unsortable)
- Other stuff

### Changed

- A lot of behind the scenes stuff. Please report any bugs.

## [0.5.24] 2020-08-13

### Bugfix

- HUD Title was display token's sheet's name not the token's name itself.

## [0.5.23] 2020-08-12

### Bugfix

- PF2E: NPCs with no strikes with additional effects weren't rendering HUD.

## [0.5.22] 2020-08-11

### Bugfix

- PF2E: NPCs without actions weren't rendering HUD

## [0.5.21] 2020-08-09

### Bugfix

- PF2E: Strikes with non-default MAPs had the wrong attack bonus shown.

## [0.5.20] 2020-08-06

### Added

- Setting for always showing HUD (show's user's assigned character) as long as token is somewhere in scene.
- Setting for displaying a HUD title, which by default is the token's alias.

## [0.5.19] 2020-08-06

### Added

- Japanese localization for DND5e and Pathfinder

## [0.5.18] 2020-08-04

### Bugfix

- Fix for Item-Macro token actors

## [0.5.17] 2020-08-01

### Bugfix

- Fixed bug where feats and spells weren't being correctly sent to Item Macro.

## [0.5.16] 2020-08-01

### Bugfix

- Fixed bug where filename in the wrong case caused error on case-sensitive filesystems.

## [0.5.15] 2020-08-01

### Added

- DND5e: support for [Kekilla's Item Macro module](https://github.com/Kekilla0/Item-Macro)

## [0.5.14] 2020-07-30

### Bugfix

-DND5e forgot to include shfitkey check in betterrolls item roll, which was causing error.

## [0.5.13] 2020-07-29

### Changed

- DND5e: removed right click for versatile ability in BetterRoll and Minor QoL handlers in favour of alt + right-click and ctrl + right-click to bring up damage and attack roll modals, respectively.

## [0.5.12] 2020-07-27

### Bugfix

- DND5e: fixed error for actors with magic item mod enabled but no magic items.

## [0.5.11] 2020-07-26

### Added

- Added further KO localization from drdwing

## [0.5.10] 2020-07-25

### Added

- Added missing method causing exception when checking compendiums

## [0.5.9] 2020-07-23

### Added

- French localization thanks to LeRatierBretonnien

## [0.5.8] 2020-07-23

### Changed

- PF2E moved hero points to top of utility category

## [0.5.7] 2020-07-23

### Added

- PF2E added utility category

## [0.5.6] 2020-07-23

### Added

- HUD should now try to resize itself if it has too many rows or columns, or hits the edge of the screen.

## [0.5.5] 2020-07-22

### Bugfix

- WFRP had misnamed method which was preventing loading of action list

### Added

- DND5e: added tools to inventory

## [0.5.4] 2020-07-19

### Added

- DND5e: Added a utility category (rests, death saves, toggles)

## [0.5.3] 2020-07-19

### Bugfix

- PF2E: Managed to break NPC actions

## [0.5.2] 2020-07-18

### Bugfix

- Misnamed method during update.

## [0.5.1] 2020-07-18

### Bugfix, naturally

- Fixed bug where third-party modules were not appearing because I was looking in the wrong place for the title

## [0.5.0] 2020-07-18

### Bugfix

- BetterRolls - alt key should now perform alt roll

### Added

- Add support for Simone's Magic Items module

### Changed

- PF2E - renamed feats to features

## [0.4.15] 2020-07-17

### Bugfix

- DND5e: Bug in showing combined ability/save checks
- Typo in Spanish localization

### Added

- SFRPG support: Thanks to Rainer#5041

## [0.4.14] 2020-07-16

### Bugfix

- Fix bug where HUD wouldn't appear for default token ownership, only explicit ownership.

## [0.4.13] 2020-07-15

### Bugfix

- DND5e: in some cases it seems spell slot information was null and it was causing the HUD to break

## [0.4.12] 2020-07-15

### Bugfix

- DND5e/BetterRolls - chose a better method to use on the BetterRoll API to roll Items

## [0.4.11] 2020-07-14

### Added

- DND5e - option to show empty items and spells
- PF2e - correctly label level 0 spells as cantrips, and remove [-] expend option from prepared cantrips

## [0.4.10] 2020-07-12

### Bugfix

- DND5e: Incorrectly named variable causing HUD to fail when abilities and saves combined.

## [0.4.9] 2020-07-12

### Bugfix

- DND5e: Incorrect comparison for spell uses caused spells with uses not to show.

## [0.4.8] 2020-07-12

### Added

- DND5e: Extended functionality of recharging '(recharge)' item on click to BetterRolls and MinorQOL roll handlers.

## [0.4.7] 2020-07-11

### Added

- PF2E: ability to expend prepared spells from HUD
- PF2E: ability to increase or decrease focus points and spell slots from HUD.

### Bugfix

- PF2e: Heightened spells now cast correctly from HUD generated spell cards
- PF2e: NPC strikes sometimes had wrong attack bonus displayed

## [0.4.6] 2020-07-11

### Bugfix

- User repositioning fix

## [0.4.5] 2020-07-10

### Changed

- Add some missing keys to localizations, just in English until translations are provided
- Update tagify

## [0.4.4] 2020-07-10

### Changed

- Make filter icon less intrusive when used

## [0.4.3] 2020-07-10

### Bugfix

- PF2E - fix rolling damage from PCs' strikes

## [0.4.2] 2020-07-10

### Added

- Merged improved pt-BR localization

## [0.4.1] 2020-07-10

### Bugfix

- Correct CSS

## [0.4.0] 2020-07-10

### Bugfix

- PF2e: NPC strike MAP was undefined when added

### Added

- Probably a few bugs.
- Beginnings of localization for Korean, Brazilian Portuguese, and Spanish.
- a filter manager should categories require filtering
- WFRP: filter manager implemented for skills (right-click on skills to bring up dialog)

### Changed

- Internally quite a bit, so please report any bugs and I'm sorry in advance.

## [0.3.5] 2020-07-04

### Added

- Added support for internationalization

## [0.3.4] 2020-07-05

### Bugfix

- DND5e: Fixed bug where resources were being incorrectly read

## [0.3.3] 2020-07-05

### Changed

- WFRP4e: Improved support and added more categories

## [0.3.2] 2020-07-04

### Bugfix

- PF2E: Actions weren't showing for PCs

### Added

- PF2E: setting between sending spell card to chat or using left and right click to roll attack and damage (with shift left-click and control right-click for bonus dialog)

## [0.3.1] 2020-07-02

### Bugfix

- PF2E: fix double minus in front of negative monster MAP
- DND5E: correctly allow cantrips through the nonpreparable filter

### Added

- Dungeon World: Support for PCs, NPCs, and GMs

### Changed

- Add transparent border to catalogue buttons to prevent movement (thanks to ZBell)
- PF2E: Improve MAP logic for PCs
- PF2E: re-add weapons to items until shift damage click is fixed.

## [0.3.0] 2020-07-01

### Changed

- PF2E - separated NPC and PC action list logic into their own classes.

## [0.2.10] 2020-07-01

### Bugfix

- Reorganised initialisation logic to prevent players having to deselec then reselect their token to see the HUD.

## [0.2.9] 2020-07-01

### Bugfix

- PF2E - iterating over some attributes caused the HUD to fail.

### Changed

- PF2E - improved support for spells

## [0.2.8] 2020-06-30

### Added

- Further support for PF2E including NPC attacks and spells organised by level and type

## [0.2.7] 2020-06-30

### Added

- PF2E support

## [0.2.6] 2020-06-28

### Bugfix

- Forgot to break switch for handlers manager.

## [0.2.5] 2020-06-28

### Added

- PF2E: Added first stage of implementation for Pathfinder 2E. A lot of things aren't implemented in PF2E yet, so this isn't quite as feature-rich as DND5e.

## [0.2.4] 2020-06-26

### Bugfix

- DND5e: all BetterRoll weapon attacks were going through rollItem not quickRoll, but only a right-click versatile attack should go via rollItem.

## [0.2.3] 2020-06-26

### Bugfix

- DND5e: Pact slots weren't being shared with other spell levels or vice-versa

### Changed

- DND5e: spells that are on a use-per-day/short-rest/etc. basis are now filtered out if they're expended.

## [0.2.2] 2020-06-25

### Bugfix

- Missed one of the ability check renames

## [0.2.1] 2020-06-25

### Changed

- Removed some excess logging.
- DND5e: Renamed Ability Tests to Ability Checks.
- DND5e: Add choice of showing VSM/C/R info next to spells.

## [0.2.0] 2020-06-25

### Added

- DND5e: add choice of showing all nonprepared spells (innate, pact, at-will, always prepared), or hiding based on their 'prepared'-ness.

## [0.1.20] 2020-06-25

### Bugfix

- Choice of roll handler was not sticking due to some poor logic.

### Changed

- Added some shadows to info fields on categories to make them more visible against similarly coloured backgrounds.

## [0.1.19] 2020-06-24

### Bugfix

- Default to the core role handler for each system if the third-party module is unavailable.
- DND5e: Fixed spell slot check. Now shows spells when there are higher-level slots available to upcast.
- DND5e: Don't display items with no quantity.

### Changed

- Tried to remove some unnecessary logging when debug mode enabled.
- Removed some cruft.

## [0.1.18] 2020-06-22

### Added

- DND5e - the order of feats and items now follows their draggable order in the inventory.

### Changed

- CSS - changed appearance of info next to subcategory name (currently only used to indicate spell slots).
- DND5e - spells should now be sorted by level and then alphabetically.

## [0.1.17] 2020-06-21

### Added

- MinorQOL & BetterRolls - added ability to right click weapons for versatile attack when one exists (right-click acts as normal click if item has no versatile property). Has a slight problem with BetterRolls which uses shift for advantage, because shift right click is hardcoded to bring up the context menu in some browsers, but I don't want to mess with BR's shift/ctrl/alt preferences.

### Changed

- Renamed some CSS classes because they were really long.
- Renamed consumables without charges to 'incomsumables'.
- Filtered consumables of type 'ammo' out of list, but their count should show in curly braces when assigned to a weapon.

## [0.1.16] 2020-06-20

### Changed

- Updated CSS for buttons because they were being overridden by the Alt5e sheet.

## [0.1.15] 2020-06-20

### Added

- Agnostic - basic hovering, adapted from Token Tooltip, borrowed from Kekilla's issues tracking
- DND5e - ability to abbreviate skills and abilities, suggested by Tercept
- DND5e - option to separate ability tests and saves, suggested by Tercept
- Changelog, we'll see how long I keep this up.
- Updated readme

### Changed

- DND5e roll handlers now extend the core DND5e roll handler rather than the base class
