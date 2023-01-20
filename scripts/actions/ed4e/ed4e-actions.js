import {ActionHandler} from "../actionHandler.js";
import * as settings from "../../settings.js";
import {Logger} from "../../logger.js";

export class ActionHandlerED4e extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }


    doBuildActionList(token, multipleTokens) {
        if (token) {
            return this._buildSingleTokenList(token);
        } else if (multipleTokens) {
            return this._buildMultipleTokenList();
        }
        return this.initializeEmptyActionList();
    }

    async _buildSingleTokenList(token) {
        const list = this.initializeEmptyActionList();
        list.tokenId = token?.id;
        list.actorId = token?.actor?.id;
        if (!list.tokenId || !list.actorId) {
            return list;
        }

        if (settings.get('showHudTitle')) {
            list.hudTitle = token.name;
        }

        const cats = await this._buildCategories(token);
        cats.flat().filter(c => c).forEach(c => {
            this._combineCategoryWithList(list, c.name, c);
        });

        return list;
    }

    _buildCategories(token) {
        let generalCat = this._buildGeneralCategory(token);
        let favoriteCat = this._buildFavoritesCategory(token);
        let talentCat = this._buildTalentsCategory(token);
        let matrixCat = this._buildMatrixCategory(token);
        let skillCat = this._buildSkillsCategory(token);
        let itemsCat = this._buildItemsCategory(token);
        let attacksCategory = this._buildAttacksCategory(token);
        let powersCat = this._buildCreaturePowersCategory(token);
        let maneuversCat = this._buildCreatureManeuversCategory(token);
        let combatCat = this._buildCombatCategory(token);
        return [
            generalCat,
            favoriteCat,
            talentCat,
            matrixCat,
            skillCat,
            attacksCategory,
            powersCat,
            maneuversCat,
            itemsCat,
            // this._buildEffectsCategory(token),
            combatCat
            // this._buildUtilityCategory(token),
        ]
    }

    _buildGeneralCategory(token) {
        if (!settings.get("showGeneral")) return;

        const actor = token.actor;
        //if (['pc', 'npc'].indexOf(actor.type) < 0) return;
        const isCreature = ['creature'].indexOf(actor.type) === 0;

        const attributeProperties = [
            "earthdawn.d.dexterity",
            "earthdawn.s.strength",
            "earthdawn.t.toughness",
            "earthdawn.p.perception",
            "earthdawn.w.willpower",
            "earthdawn.c.charisma",
        ]

        let attributeActions = attributeProperties.map( e => {
                return {
                    name: this.i18n(e), // localize in system
                    id: null,
                    encodedValue: ["attribute", token.id, e].join(this.delimiter),
                }
            }
        ).filter(s => !!s); // filter out nulls

        let attributeCat = this.initializeEmptySubcategory();
        attributeCat.actions = attributeActions;

        let otherCat = this.initializeEmptySubcategory();
        otherCat.actions = [
            {
                name: this.i18n("earthdawn.r.recovery"),
                id: null,
                encodedValue: ["recovery", token.id, "recovery"].join(this.delimiter),
            },
        ];
        if (!isCreature) {
            otherCat.actions.push(
                {
                    name: this.i18n("earthdawn.n.newDay"),
                    id: null,
                    encodedValue: ["newday", token.id, "newday"].join(this.delimiter),
                },
                {
                    name: this.i18n("earthdawn.h.halfMagic"),
                    id: null,
                    encodedValue: ["halfmagic", token.id, "halfmagic"].join(this.delimiter),
                }
            )
        }


        const mapPropToActionID = {
            "earthdawn.u.useKarma": "usekarma"
        }

        const systemProperties = [
            "earthdawn.u.useKarma"
        ]
        let systemActions = systemProperties.map( e => {
                return {
                    name: this.i18n(e), // localize in system
                    id: null,
                    encodedValue: ["toggle", token.id, mapPropToActionID[e]].join(this.delimiter),
                    cssClass: actor.data["usekarma"] === "true" ? 'active' : ''
                }
            }
        ).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let systemCat = this.initializeEmptySubcategory();
        systemCat.actions = systemActions;

        let result = this.initializeEmptyCategory('general');
        result.name = this.i18n("tokenActionHud.general");

        this._combineSubcategoryWithCategory(result, this.i18n("earthdawn.a.attributes"), attributeCat);
        this._combineSubcategoryWithCategory(result, this.i18n("earthdawn.o.other"), otherCat);
        if (!isCreature) {
            this._combineSubcategoryWithCategory(result, this.i18n("tokenActionHud.ed4e.systems"), systemCat);
        }

        return result;
    }

    _buildFavoritesCategory(token) {
        if (!settings.get("showFavorites")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.type) < 0) return;

        const favoriteItems = actor.items.filter( e=> e.system.favorite === "true");

        let result = this.initializeEmptyCategory('favorites');
        result.name = this.i18n("earthdawn.h.hotlist");

        let favoriteActions = favoriteItems.map(e => {
            try {
                let itemID = e.id;
                let macroType = e.type.toLowerCase();
                let name = e.name;
                if (e.system.hasOwnProperty("ranks")) {
                    name += " (" + e.system.ranks + ")";
                }
                let encodedValue = [macroType, token.id, itemID].join(this.delimiter);
                return {name: name, id: itemID, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let favoritesCategory = this.initializeEmptySubcategory();
        favoritesCategory.actions = favoriteActions;

        let favoritesTitle = this.i18n("earthdawn.h.hotlist");
        this._combineSubcategoryWithCategory(result, favoritesTitle, favoritesCategory);

        return result;
    }

    _buildTalentsCategory(token) {
        if (!settings.get("showTalents")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.type) < 0) return;

        const talents = actor.items.filter( e=> e.type === 'talent');

        // get list of talents

        let result = this.initializeEmptyCategory('talents');
        result.name = this.i18n("earthdawn.t.talents");
        let macroType = 'talent';

        let talentActions = talents.map(e => {
            try {
                let talentId = e.id;
                let name = e.name + " (" + e.system.ranks + ")";
                let encodedValue = [macroType, token.id, talentId].join(this.delimiter);
                return {name: name, id: talentId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let talentsCategory = this.initializeEmptySubcategory();
        talentsCategory.actions = talentActions;

        let talentsTitle = this.i18n("earthdawn.t.talents");
        this._combineSubcategoryWithCategory(result, talentsTitle, talentsCategory);

        return result;
    }

    _buildMatrixCategory(token) {
        if (
            (!settings.get("showMatrices"))
            || !(token.actor.items.find(e => e.type==='spellmatrix'))
        ) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.type) < 0) return;

        const matrices = actor.items.filter(e=> e.type === 'spellmatrix');
        if (matrices.length < 1) return;

        let result = this.initializeEmptyCategory('matrix');
        result.name = this.i18n("earthdawn.m.matrixes");

        matrices.forEach(e => {
            try {
                let matrixSubCategory = this.initializeEmptySubcategory();
                let matrixId = e.id;

                matrixSubCategory.actions = [
                    {
                        name: this.i18n("earthdawn.a.attune"),
                        id: matrixId,
                        encodedValue: ['matrixAttune', token.id, matrixId].join(this.delimiter),
                    },
                    {
                        name: this.i18n("earthdawn.m.matrixWeaveRed"),
                        id: matrixId,
                        encodedValue: ['matrixWeave', token.id, matrixId].join(this.delimiter),
                    },
                    {
                        name: this.i18n("earthdawn.m.matrixCastRed"),
                        id: matrixId,
                        encodedValue: ['matrixCast', token.id, matrixId].join(this.delimiter),
                    },
                    {
                        name: this.i18n("earthdawn.m.matrixClearRed"),
                        id: matrixId,
                        encodedValue: ['matrixClear', token.id, matrixId].join(this.delimiter),
                    },
                ]

                let name_subcat = e.system.currentspell ? `${e.system.currentspell} (${e.system.totalthreads}/${e.system.threadsrequired})` : e.name;

                this._combineSubcategoryWithCategory(
                    result,
                    name_subcat,
                    matrixSubCategory
                );
            } catch (error) {
                Logger.error(e);
                throw error;
            }
        });

        return result;
    }

    _buildSkillsCategory(token) {
        if (!settings.get("showSkills")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.type) < 0) return;

        const skills = actor.items.filter( e=> e.type === 'skill');

        // get list of talents

        let result = this.initializeEmptyCategory('skills');
        result.name = this.i18n("earthdawn.s.skills");
        let macroType = 'skill';

        let skillActions = skills.map(e => {
            try {
                let skillId = e.id;
                let name = e.name + " (" + e.system.ranks + ")";
                let encodedValue = [macroType, token.id, skillId].join(this.delimiter);
                return {name: name, id: skillId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillActions;

        let skillsTitle = this.i18n("earthdawn.s.skills");
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

        return result;
    }

    _buildItemsCategory(token) {
        if (!settings.get("showInventory")) return;

        const actor = token.actor;
        const tokenId = token.id;

        if (['pc', 'npc'].indexOf(actor.type) < 0) return;

        let macroType = 'inventory';

        // get list of items

        let validItems = actor.items.filter(i => ['weapon', 'armor', 'shield', 'equipment'].indexOf(i.type) > -1);

        let weapons = validItems.filter(i => (i.type === 'weapon'));
        let weaponActions = weapons.map(w => this._buildItem(tokenId, actor, macroType, w))
            .sort((a,b) => a.name.localeCompare(b.name));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;

        let armors = validItems.filter(i => (i.type === 'armor'));
        let armorActions = armors.map(w => this._buildItem(tokenId, actor, macroType, w))
            .sort((a,b) => a.name.localeCompare(b.name));
        let armorsCat = this.initializeEmptySubcategory();
        armorsCat.actions = armorActions;

        let shields = validItems.filter(i => (i.type === 'shield'));
        let shieldActions = shields.map(w => this._buildItem(tokenId, actor, macroType, w))
            .sort((a,b) => a.name.localeCompare(b.name));
        let shieldCat = this.initializeEmptySubcategory();
        shieldCat.actions = shieldActions;

        let equipment = validItems.filter(i => i.type === 'equipment');
        let equipmentActions = equipment.map(e => this._buildItem(tokenId, actor, macroType, e))
            .sort((a,b) => a.name.localeCompare(b.name));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;

        // make categories

        let weaponsTitle = this.i18n("earthdawn.w.weapons");
        let armorsTitle = this.i18n("earthdawn.a.armors");
        let shieldsTitle = this.i18n("earthdawn.s.shields");
        let equipmentTitle = this.i18n("earthdawn.e.equipment")

        let result = this.initializeEmptyCategory('inventory');
        result.name = this.i18n("earthdawn.i.inventory");

        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
        this._combineSubcategoryWithCategory(result, armorsTitle, armorsCat);
        this._combineSubcategoryWithCategory(result, shieldsTitle, shieldCat);
        this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);

        return result;
    }

    _buildItem(tokenId, actor, macroType, item) {
        const itemId = item.id ?? item._id;
        let encodedValue = [macroType, tokenId, itemId].join(this.delimiter);
        let img = this._getImage(item);
        let action = { name: item.name, id: itemId, encodedValue: encodedValue, img: img};
        if (['weapon', 'armor', 'shield'].indexOf(item.type) >= 0) {
            action['cssClass'] = item.system.worn === true ? 'active' : '';
        }
        return action;
    }

    _buildCombatCategory(token) {
        if (!settings.get("showCombat")) return;

        let actor = token.actor;

        // top category
        let result = this.initializeEmptyCategory("combat");
        result.name = this.i18n("earthdawn.c.combat")

        // weapons
        let weapons = actor.items.filter(i => i.type === "weapon" && i.system.worn);
        let weaponActions = weapons.map(w => this._buildItem(token.id, actor, "weaponAttack", w))
            .sort((a,b) => a.name.localeCompare(b.name));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
        this._combineSubcategoryWithCategory(result, `${this.i18n("earthdawn.w.weapons")} ${this.i18n("earthdawn.a.attack")}`, weaponsCat);

        // tactics
        const tacticsProperties = [
            "earthdawn.c.combatOptionsAggressive",
            "earthdawn.c.combatOptionsDefensive",
            "earthdawn.c.combatModifierHarried",
            "earthdawn.c.combatModifierKnockedDown"
        ]

        const mapPropToActionID = {
            "earthdawn.c.combatOptionsAggressive": "tactics.aggressive",
            "earthdawn.c.combatOptionsDefensive": "tactics.defensive",
            "earthdawn.c.combatModifierHarried": "tactics.harried",
            "earthdawn.c.combatModifierKnockedDown": "tactics.knockeddown",
        }

        let tacticsActions = tacticsProperties.map( e => {
                return {
                    name: this.i18n(e), // localize in system
                    id: null,
                    encodedValue: ['toggle', token.id, mapPropToActionID[e]].join(this.delimiter),
                    cssClass: actor.system.tactics[mapPropToActionID[e].split(".")[1]] === true ? 'active' : ''
                }
            }
        ).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let tacticsCat = this.initializeEmptySubcategory();
        tacticsCat.actions = tacticsActions;

        this._combineSubcategoryWithCategory(result, `${this.i18n("earthdawn.o.option")} & ${this.i18n("earthdawn.m.modifier")}`, tacticsCat);

        // actions
        let actionsCat = this.initializeEmptySubcategory();
        actionsCat.actions = [
            {
                name: this.i18n("earthdawn.t.takeDamage"),
                id: null,
                encodedValue: ["takedamage", token.id, "takedamage"].join(this.delimiter),
            },
            {
                name: this.i18n("earthdawn.c.combatOptionsKnockdownTest"),
                id: null,
                encodedValue: ["knockdowntest", token.id, "knockdowntest"].join(this.delimiter),
            },
            {
                name: this.i18n("earthdawn.c.combatOptionsJumpUp"),
                id: null,
                encodedValue: ["jumpup", token.id, "jumpup"].join(this.delimiter),
            },
        ];
        this._combineSubcategoryWithCategory(result, this.i18n("earthdawn.a.actions"), actionsCat);

        return result;
    }

    _buildAttacksCategory(token) {
        const actor = token.actor;
        if (['creature'].indexOf(actor.type) < 0) return;

        const attacks = actor.items.filter( e=> e.system.powerType === 'Attack');

        let result = this.initializeEmptyCategory('attacks');
        result.name = this.i18n("earthdawn.a.attacks");
        let macroType = 'attack';

        let attackActions = attacks.map(e => {
            try {
                let attackId = e.id;
                let name = e.name;
                let encodedValue = [macroType, token.id, attackId].join(this.delimiter);
                return {name: name, id: attackId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let attackCategory = this.initializeEmptySubcategory();
        attackCategory.actions = attackActions;

        let attacksTitle = this.i18n("earthdawn.a.attack");
        this._combineSubcategoryWithCategory(result, attacksTitle, attackCategory);

        return result;
    }

    _buildCreaturePowersCategory(token) {
        const actor = token.actor;
        if (['creature'].indexOf(actor.type) < 0) return;

        const powers = actor.items.filter( e=> e.system.powerType === 'Power');

        let result = this.initializeEmptyCategory('powers');
        result.name = this.i18n("earthdawn.p.powers");
        let macroType = 'power';

        let powerActions = powers.map(e => {
            try {
                let powerId = e.id;
                let name = e.name;
                let encodedValue = [macroType, token.id, powerId].join(this.delimiter);
                return {name: name, id: powerId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let powersCategory = this.initializeEmptySubcategory();
        powersCategory.actions = powerActions;

        let powerTitle = this.i18n("earthdawn.p.power");
        this._combineSubcategoryWithCategory(result, powerTitle, powersCategory);

        return result;
    }

    _buildCreatureManeuversCategory(token) {
        const actor = token.actor;
        if (['creature'].indexOf(actor.type) < 0) return;

        const maneuvers = actor.items.filter( e=> e.system.powerType === 'Maneuver');

        let result = this.initializeEmptyCategory('maneuvers');
        result.name = this.i18n("earthdawn.m.maneuvers");
        let macroType = 'maneuver';

        let maneuverActions = maneuvers.map(e => {
            try {
                let maneuverId = e.id;
                let name = e.name;
                let encodedValue = [macroType, token.id, maneuverId].join(this.delimiter);
                return {name: name, id: maneuverId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let maneuverCategory = this.initializeEmptySubcategory();
        maneuverCategory.actions = maneuverActions;

        let maneuverTitle = this.i18n("earthdawn.m.maneuver");
        this._combineSubcategoryWithCategory(result, maneuverTitle, maneuverCategory);

        return result;
    }

    _getEntityData(entity) {
        // return entity.data.data ?? entity.data;
        return entity;
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }
}