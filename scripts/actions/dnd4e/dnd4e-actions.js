import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { Logger } from "../../logger.js";

export class ActionHandlerDnD4e extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    doBuildActionList(token, multipleTokens) {
        if (token) {
            return this._buildSingleTokenList(token);
        } else if (multipleTokens) {
            return this._buildMultipleTokenList();
        }
        return this.initializeEmptyActionList();
    }

    buildUpgradeAnnouncement() {
        const list = this.initializeEmptyActionList();
        const cats = this.initializeEmptyCategory("blank");
        cats.name = "You must upgrade 4E System to at least 0.2.62"
        list.categories.push(cats)
        return list
    }

    async _buildSingleTokenList(token) {
        if(!game.dnd4eBeta.tokenBarHooks) {
            return this.buildUpgradeAnnouncement();
        }
        const list = this.initializeEmptyActionList();
        list.tokenId = token?.id;
        list.actorId = token?.actor?.id;
        if (!list.tokenId || !list.actorId) {
            return list;
        }

        if (settings.get("showHudTitle")) {
            list.hudTitle = token.data?.name;
        }

        const cats = await this._buildCategories(token);
        cats
            .flat()
            .filter((c) => c)
            .forEach((c) => {
                this._combineCategoryWithList(list, c.name, c);
            });

        return list;
    }

    _buildCategories(token) {
        return [
            this._buildAbilitiesCategory(token),
            this._buildSkillsCategory(token),
            this._buildPowersCategory(token),
            this._buildFeaturesCategory(token),
            this._buildItemssCategory(token),
            this._buildConditionsCategory(token),
            this._buildUtilityCategory(token),
        ];
    }

    _buildAbilitiesCategory(token) {
        const actor = token.actor;
        const abilities = actor.data.data.abilities;

        return this._getAbilityList(
            token.id,
            abilities,
            "abilities",
            this.i18n("tokenactionhud.abilities"),
            "ability"
        );
    }

    _buildMultipleTokenList() {
        if(!game.dnd4eBeta.tokenBarHooks) {
            return this.buildUpgradeAnnouncement();
        }
        const list = this.initializeEmptyActionList();
        list.tokenId = "multi";
        list.actorId = "multi";

        const allowedTypes = ["Player Character","NPC"];
        let actors = canvas.tokens.controlled
            .map((t) => t.actor)
            .filter((a) => allowedTypes.includes(a.data.type));

        const tokenId = list.tokenId;

        this._addMultiSkills(list, tokenId);

        let abilitiesTitle = this.i18n("tokenactionhud.abilities");
        this._addMultiAbilities(
            list,
            tokenId,
            "abilities",
            abilitiesTitle,
            "ability"
        );

        if (settings.get("showConditionsCategory"))
            this._addMultiConditions(list, tokenId);

        this._addMultiUtilities(list, tokenId, actors);

        return list;
    }

    /** POWERs **/
    _buildFeaturesCategory(token) {
        const actor = token.actor;
        const tokenId = token.id;

        let result = this.initializeEmptyCategory("Features");
        result.name = this.i18n("DND4EBETA.Features");

       const features = {
            raceFeats: { label: "DND4EBETA.FeatRace", items: [], dataset: {type: "raceFeats"} },
            classFeats: { label: "DND4EBETA.FeatClass", items: [], dataset: {type: "classFeats"} },
            pathFeats: { label: "DND4EBETA.FeatPath", items: [], dataset: {type: "pathFeats"} },
            destinyFeats: { label: "DND4EBETA.FeatDestiny", items: [], dataset: {type: "destinyFeats"} },
            feat: { label: "DND4EBETA.FeatLevel", items: [], dataset: {type: "feat"} },
            ritual: { label: "DND4EBETA.FeatRitual", items: [], dataset: {type: "ritual"} }
        };

        actor.data.items.forEach((item) => {
            if (Object.keys(features).includes(item.data.type)) {
                features[item.data.type].items.push(item)
            }
        })

        Object.entries(features).map((e) => {
            const subCat = this._buildFeatureSubCategory(actor, e[1].items, tokenId)
            this._combineSubcategoryWithCategory(result, this.i18n(e[1].label), subCat);
        });

        return result;
    }

    _buildFeatureSubCategory(actor, features, tokenId) {
        const macroType = "feature"
        const result = this.initializeEmptySubcategory();
        features.forEach((item) => {
            const encodedValue = [macroType, tokenId, item.id].join(this.delimiter);
            const action = {
                name: item.data.name,
                id: item.id,
                encodedValue: encodedValue,
                img: this._getImage(item)
            };
            result.actions.push(action)
        })
        return result;
    }


    /** Inventory **/
    _buildItemssCategory(token) {
        const actor = token.actor;
        const tokenId = token.id;

        let result = this.initializeEmptyCategory("Inventory");
        result.name = this.i18n("DND4EBETA.Inventory");

        const filterObject = {}
        settings.get("equipmentCategoryList").split(',').forEach((str) => {
            if (str.trim()) {
                filterObject[str.trim()] = true
            }
        });

        const items = {
            weapon: { label: "DND4EBETA.ItemTypeWeaponPl", items: []},
            equipment: { label: "DND4EBETA.ItemTypeEquipmentPl", items: []},
            consumable: { label: "DND4EBETA.ItemTypeConsumablePl", items: [], subcategories: {}, subcategoryField: "consumableType"},
            tool: { label: "DND4EBETA.ItemTypeToolPl", items: []},
            backpack: { label: "DND4EBETA.ItemTypeContainerPl", items: []},
            loot: { label: "DND4EBETA.ItemTypeLootPl", items: []},
        };

        Object.entries(game.dnd4eBeta.config.consumableTypes).forEach((e) => {
            const subCat = { label: e[1], items : [] }
            items.consumable.subcategories[e[0]] = subCat
        });

        actor.data.items.forEach((item) => {
            if (Object.keys(items).includes(item.data.type)) {
                const menuItem = items[item.data.type]
                if (menuItem.subcategories && menuItem.subcategoryField) {
                    if (item.data.data[menuItem.subcategoryField]) {
                        const subCat = item.data.data[menuItem.subcategoryField]
                        if (menuItem.subcategories[subCat]) {
                            menuItem.subcategories[subCat].items.push(item)
                            return;
                        }
                    }
                }
                menuItem.items.push(item)
            }
        })

        const filterOff = Object.keys(filterObject).length === 0
        Object.entries(items).map((e) => {
            if (filterOff || filterObject[e[0]]) {
                const subCat = this._buildItemSubCategory(actor, e[1].items, tokenId, e[1].subcategories, filterObject)
                this._combineSubcategoryWithCategory(result, this.i18n(e[1].label), subCat);
            }
        });

        return result;
    }


    _buildItemSubCategory(actor, items, tokenId, subcategories, filterObject) {
        const macroType = "inventory"
        const result = this.initializeEmptySubcategory();
        items.forEach((item) => {
            const encodedValue = [macroType, tokenId, item.id].join(this.delimiter);
            const action = {
                name: item.data.name,
                id: item.id,
                encodedValue: encodedValue,
                img: this._getImage(item)
            };
            if (settings.get("hideUnequippedInventory")) {
                if (!item.data.data.equipped) {
                    return;
                }
            }
            if (settings.get("hideQuantityZero")) {
                if (item.data.data.quantity < 1) {
                    return;
                }
            }

            result.actions.push(action)
        })

        if (subcategories) {
            const filterOff = Object.keys(filterObject).length === 0

            Object.entries(subcategories).map((e) => {
                if (filterOff || filterObject[e[0]]) {
                    const subCat = this._buildItemSubCategory(actor, e[1].items, tokenId, e[1].subcategories, filterObject)
                    this._combineSubcategoryWithCategory(result, this.i18n(e[1].label), subCat);
                }
            });
        }

        return result;
    }


    /** @private */
    _buildPowersCategory(token) {
        const actor = token.actor;
        const tokenId = token.id;

        let allPowers = actor.data.items.filter((item) => item.data.type === "power")

        let result = this.initializeEmptyCategory("Powers");
        result.name = this.i18n("DND4EBETA.Powers");

        // powerGroupType is not initalised by default
        let groupType = this._getDocumentData(actor).powerGroupTypes
        if (!groupType) {
            actor.data.data.powerGroupTypes = "usage"
            groupType = "usage"
        }
        const groupings = game.dnd4eBeta.tokenBarHooks.generatePowerGroups(actor)

        let groupField = "useType"

        switch (groupType) {
            case "action" : groupField = "actionType"
                break;
            case "type" : groupField = "powerType"
                break;
            default: break;
        }

        // original I had a neat solution doing filtering when building the subcategory, but this did not get things that did not fall into categories and instead got "other"
        if (!groupings.other) {
            groupings.other = { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} }
        }

        allPowers.forEach(power => {
            const key = this._getDocumentData(power)[groupField]
            if (groupings[key]) {
                groupings[key].items.push(power)
            }
            else {
                groupings.other.items.push(power)
            }
        })

        Object.entries(groupings).map((e) => {
            const subCat = this._buildPowerSubCategory(actor, e[1].items, tokenId)
            this._combineSubcategoryWithCategory(result, this.i18n(e[1].label), subCat);
        });

        return result;
    }

    _buildPowerSubCategory(actor, powerList, tokenId) {
        const macroType = "power"
        const result = this.initializeEmptySubcategory();
        let powers = powerList

        if(settings.get("hideUsedPowers")) {
            powers = powers.filter((power) => {
                const data = this._getDocumentData(power)
                return data.useType === "recharge" || game.dnd4eBeta.tokenBarHooks.isPowerAvailable(actor, power)
            })
        }
        else {
            // need to poke this to force the available boolean correctly for recharge powers
            powers.forEach((power) => {
                game.dnd4eBeta.tokenBarHooks.isPowerAvailable(actor, power)
            })
        }

        const colour = settings.get("forcePowerColours")
        powers.forEach((item) => {
                const encodedValue = [macroType, tokenId, item.id].join(this.delimiter);
                const action = {
                    name: item.data.name,
                    id: item.id,
                    encodedValue: encodedValue,
                    img: this._getImage(item)
                };
                if (colour) {
                    action.cssClass = `force-ability-usage--${this._getDocumentData(item).useType}`
                }
                result.actions.push(action)
            })
        return result;
    }

    /** @private */
    _buildSkillsCategory(token) {
        const actor = token.actor;
        if (actor.data.type === "vehicle") return;

        const skills = actor.data.data.skills;

        let result = this.initializeEmptyCategory("skills");
        result.name = this.i18n("tokenactionhud.skills");
        let macroType = "skill";

        let abbr = settings.get("abbreviateSkills");

        let skillsActions = Object.entries(skills)
            .map((e) => {
                try {
                    let skillId = e[0];
                    let name = abbr ? skillId : game.dnd4eBeta.config.skills[skillId];
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    let encodedValue = [macroType, token.id, e[0]].join(this.delimiter);
                    let icon = this._getProficiencyIcon(skills[skillId].value);
                    return {
                        name: name,
                        id: e[0],
                        encodedValue: encodedValue,
                        icon: icon,
                    };
                } catch (error) {
                    Logger.error(e);
                    return null;
                }
            })
            .filter((s) => !!s);
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n("tokenactionhud.skills");
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

        return result;
    }

    _addMultiSkills(list, tokenId) {
        let result = this.initializeEmptyCategory("skills");
        let macroType = "skill";

        let abbr = settings.get("abbreviateSkills");

        let skillsActions = Object.entries(game.dnd4eBeta.config.skills).map((e) => {
            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            return { name: name, id: e[0], encodedValue: encodedValue };
        });
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n("tokenactionhud.skills");
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);
        this._combineCategoryWithList(list, skillsTitle, result, true);
    }

    /** @private */
    _getAbilityList(tokenId, abilities, categoryId, categoryName, macroType) {
        let result = this.initializeEmptyCategory(categoryId);
        result.name = categoryName;

        let abbr = settings.get("abbreviateSkills");

        let actions = Object.entries(game.dnd4eBeta.config.abilities).map((e) => {
            if (abilities[e[0]].value === 0) return;

            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            let icon;
            if (categoryId === "checks") icon = "";
            else icon = this._getProficiencyIcon(abilities[e[0]].proficient);

            return { name: name, id: e[0], encodedValue: encodedValue, icon: icon };
        });
        let abilityCategory = this.initializeEmptySubcategory();
        abilityCategory.actions = actions.filter((a) => !!a);

        this._combineSubcategoryWithCategory(result, categoryName, abilityCategory);

        return result;
    }

    _addMultiAbilities(list, tokenId, categoryId, categoryName, macroType) {
        let cat = this.initializeEmptyCategory(categoryId);

        let abbr = settings.get("abbreviateSkills");

        let actions = Object.entries(game.dnd4eBeta.config.abilities).map((e) => {
            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);

            return { name: name, id: e[0], encodedValue: encodedValue };
        });
        let abilityCategory = this.initializeEmptySubcategory();
        abilityCategory.actions = actions;

        this._combineSubcategoryWithCategory(cat, categoryName, abilityCategory);
        this._combineCategoryWithList(list, categoryName, cat, true);
    }

    /** @private */
    _buildUtilityCategory(token) {
        const actor = token.actor;

        let result = this.initializeEmptyCategory("utility");
        result.name = this.i18n("tokenactionhud.utility");
        let macroType = "utility";

        let utility = this.initializeEmptySubcategory();

        this._addIntiativeSubcategory(macroType, result, token.id);
        let healDialogValue = [macroType, token.id, "healDialog"].join(
            this.delimiter
        );
        utility.actions.push({
            id: "heal",
            encodedValue: healDialogValue,
            name: this.i18n("DND4EBETA.Healing"),
        });

        let saveValue = [macroType, token.id, "save"].join(
            this.delimiter
        );
        utility.actions.push({
            id: "save",
            encodedValue: saveValue,
            name: this.i18n("DND4EBETA.SavingThrow"),
        });
        let saveDialogValue = [macroType, token.id, "saveDialog"].join(
            this.delimiter
        );
        utility.actions.push({
            id: "saveDialog",
            encodedValue: saveDialogValue,
            name: this.i18n("Show Save Dialog"),
        });

        this._combineSubcategoryWithCategory(
            result,
            this.i18n("tokenactionhud.utility"),
            utility
        );

        return result;
    }

    /** @private */
    _buildEffectsCategory(token) {
        let result = this.initializeEmptyCategory("effects");
        result.name = this.i18n("tokenactionhud.effects");
        this._addEffectsSubcategories(token.actor, token.id, result);
        return result;
    }

    /** @private */
    _buildConditionsCategory(token) {
        if (!settings.get("showConditionsCategory")) return;
        let result = this.initializeEmptyCategory("conditions");
        result.name = this.i18n("tokenactionhud.conditions");
        this._addConditionsSubcategory(token.actor, token.id, result);
        return result;
    }

    /** @private */
    _addEffectsSubcategories(actor, tokenId, category) {
        const macroType = "effect";

        const effects =
            "find" in actor.effects.entries ? actor.effects.entries : actor.effects;

        let tempCategory = this.initializeEmptySubcategory();
        let passiveCategory = this.initializeEmptySubcategory();

        effects.forEach((e) => {
            const effectData = this._getDocumentData(e);
            const name = effectData.label;
            const encodedValue = [macroType, tokenId, e.id].join(this.delimiter);
            const cssClass = effectData.disabled ? "" : "active";
            const image = effectData.icon;
            let action = {
                name: name,
                id: e.id,
                encodedValue: encodedValue,
                img: image,
                cssClass: cssClass,
            };

            e.isTemporary
                ? tempCategory.actions.push(action)
                : passiveCategory.actions.push(action);
        });

        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.temporary"),
            tempCategory
        );
        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.passive"),
            passiveCategory
        );
    }

    /** @private */
    _addMultiConditions(list, tokenId) {
        const category = this.initializeEmptyCategory("conditions");
        const macroType = "condition";

        const availableConditions = CONFIG.statusEffects.filter(
            (condition) => condition.id !== ""
        );
        const actors = canvas.tokens.controlled
            .filter((t) => !!t.actor)
            .map((t) => t.actor);

        if (!availableConditions) return;

        let conditions = this.initializeEmptySubcategory();

        availableConditions.forEach((c) => {
            const name = this.i18n(c.label);
            const encodedValue = [macroType, tokenId, c.id].join(this.delimiter);
            const cssClass = actors.every((actor) => {
                const effects =
                    "some" in actor.effects.entries
                        ? actor.effects.entries
                        : actor.effects;
                effects.some((e) => e.data.flags.core?.statusId === c.id);
            })
                ? "active"
                : "";
            const image = c.icon;
            const action = {
                name: name,
                id: c.id,
                encodedValue: encodedValue,
                img: image,
                cssClass: cssClass,
            };

            conditions.actions.push(action);
        });

        const conName = this.i18n("tokenactionhud.conditions");
        this._combineSubcategoryWithCategory(category, conName, conditions);
        this._combineCategoryWithList(list, conName, category);
    }

    /** @private */
    _addConditionsSubcategory(actor, tokenId, category) {
        const macroType = "condition";

        const availableConditions = CONFIG.statusEffects.filter(
            (condition) => condition.id !== ""
        );

        if (!availableConditions) return;

        let conditions = this.initializeEmptySubcategory();

        availableConditions.forEach((c) => {
            const name = this.i18n(c.label);
            const encodedValue = [macroType, tokenId, c.id].join(this.delimiter);
            const effects =
                "some" in actor.effects.entries ? actor.effects.entries : actor.effects;
            const cssClass = effects.some((e) => e.data.flags.core?.statusId === c.id)
                ? "active"
                : "";
            const image = c.icon;
            const action = {
                name: name,
                id: c.id,
                encodedValue: encodedValue,
                img: image,
                cssClass: cssClass,
            };

            conditions.actions.push(action);
        });

        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.conditions"),
            conditions
        );
    }

    /** @private */
    _addIntiativeSubcategory(macroType, category, tokenId) {
        const combat = game.combat;
        let combatant, currentInitiative;
        if (combat) {
            combatant = combat.combatants.find((c) => c.tokenId === tokenId);
            currentInitiative = combatant?.initiative;
        }

        let initiative = this.initializeEmptySubcategory();

        let initiativeValue = [macroType, tokenId, "initiative"].join(
            this.delimiter
        );
        let initiativeName = `${this.i18n("tokenactionhud.rollInitiative")}`;

        let initiativeAction = {
            id: "rollInitiative",
            encodedValue: initiativeValue,
            name: initiativeName,
        };

        if (currentInitiative) initiativeAction.info1 = currentInitiative;
        initiativeAction.cssClass = currentInitiative ? "active" : "";

        initiative.actions.push(initiativeAction);

        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.initiative"),
            initiative
        );
    }

    /** @private */
    _addMultiIntiativeSubcategory(macroType, tokenId, category) {
        const combat = game.combat;

        let initiative = this.initializeEmptySubcategory();

        let initiativeValue = [macroType, tokenId, "initiative"].join(
            this.delimiter
        );
        let initiativeName = `${this.i18n("tokenactionhud.rollInitiative")}`;

        let initiativeAction = {
            id: "rollInitiative",
            encodedValue: initiativeValue,
            name: initiativeName,
        };

        let isActive;
        if (combat) {
            let tokenIds = canvas.tokens.controlled.map((t) => t.id);
            let tokenCombatants = tokenIds.map((id) =>
                combat.combatants.find((c) => c.tokenId === id)
            );
            isActive = tokenCombatants.every((c) => !!c?.initiative);
        }

        initiativeAction.cssClass = isActive ? "active" : "";

        initiative.actions.push(initiativeAction);

        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.initiative"),
            initiative
        );
    }

    /** @private */
    _addMultiUtilities(list, tokenId, actors) {
        let category = this.initializeEmptyCategory("utility");
        let macroType = "utility";

        this._addMultiIntiativeSubcategory(macroType, tokenId, category);

        let rests = this.initializeEmptySubcategory();
        let utility = this.initializeEmptySubcategory();

        if (actors.every((a) => a.data.type === "character")) {
            let shortRestValue = [macroType, tokenId, "shortRest"].join(
                this.delimiter
            );
            rests.actions.push({
                id: "shortRest",
                encodedValue: shortRestValue,
                name: this.i18n("tokenactionhud.shortRest"),
            });
            let longRestValue = [macroType, tokenId, "longRest"].join(this.delimiter);
            rests.actions.push({
                id: "longRest",
                encodedValue: longRestValue,
                name: this.i18n("tokenactionhud.longRest"),
            });

            let inspirationValue = [macroType, tokenId, "inspiration"].join(
                this.delimiter
            );
            let inspirationAction = {
                id: "inspiration",
                encodedValue: inspirationValue,
                name: this.i18n("tokenactionhud.inspiration"),
            };
            inspirationAction.cssClass = actors.every(
                (a) => a.data.data.attributes?.inspiration
            )
                ? "active"
                : "";
            utility.actions.push(inspirationAction);
        }

        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.rests"),
            rests
        );
        this._combineSubcategoryWithCategory(
            category,
            this.i18n("tokenactionhud.utility"),
            utility
        );
        this._combineCategoryWithList(
            list,
            this.i18n("tokenactionhud.utility"),
            category
        );
    }

    _getImage(item) {
        let result = "";
        if (settings.get("showIcons")) result = item.data.img ?? "";

        return !result?.includes("icons/svg/mystery-man.svg") ? result : "";
    }

    _filterExpendedItems(items) {
        if (settings.get("showEmptyItems")) return items;

        return items.filter((i) => {
            const iData = this._getDocumentData(i);
            let uses = iData.uses;
            // Assume something with no uses is unlimited in its use.
            if (!uses) return true;

            // if it has a max but value is 0, don't return.
            if (uses.max > 0 && !uses.value) return false;

            return true;
        });
    }

    /** @private */
    _getProficiencyIcon(level) {
        const icons = {
            0: "",
            0.5: '<i class="fas fa-adjust"></i>',
            5: '<i class="fas fa-check"></i>',
            8: '<i class="fas fa-check-double"></i>',
        };
        return icons[level];
    }

    _getDocumentData(entity) {
        return entity.data.data ?? entity.data;
    }
}
