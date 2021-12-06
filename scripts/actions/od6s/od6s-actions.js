import {ActionHandler} from "../actionHandler.js";

export class ActionHandlerOD6S extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
        let result = this.initializeEmptyActionList();

        if (!token) return result;

        result.tokenId = token.id;

        let actor = token.actor;

        if (!actor) return result;
        if (actor.type === 'starship' || actor.type === 'vehicle') return result;

        result.actorId = actor.id;

        //let inventoryCategory = this._buildInventoryCategory(actor, tokenId);
        let combatCategory = this._buildCombatActionsCategory(actor, result.tokenId);
        let attributeCategory = this._buildAttributesCategory(
            actor,
            result.tokenId,
            "attributes"
        );
        let skillCategory = this._buildSkillsCategory(actor, result.tokenId, "skills");

        //this._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), inventoryCategory); // combines the inventory category with the list with the title given by the second argument.
        this._combineCategoryWithList(
            result,
            game.i18n.localize("OD6S.COMBAT"),
            combatCategory
        );
        this._combineCategoryWithList(
            result,
            game.i18n.localize("OD6S.ATTRIBUTES"),
            attributeCategory
        );
        this._combineCategoryWithList(
            result,
            game.i18n.localize("OD6S.SKILLS"),
            skillCategory
        );

        return result;
    }

    _buildCombatActionsCategory(actor, tokenId) {
        let macroType = "action";
        let result = this.initializeEmptyCategory("combatactions");
        let items = actor.items;

        const resistanceTypes = ["pr", "er"];
        let resistances = [];
        for (let r of resistanceTypes) {
            let name = game.i18n.localize(actor.data.data[r].label);
            let encodedValue = [macroType, tokenId, r].join(this.delimiter);
            resistances.push({name: name, id: r, encodedValue: encodedValue});
        }
        let resistancesSubcategory = this.initializeEmptySubcategory();
        resistancesSubcategory.actions = resistances;
        this._combineSubcategoryWithCategory(
            result,
            game.i18n.localize("OD6S.RESISTANCE"),
            resistancesSubcategory
        );

        let weapons = items
            .filter((i) => i.data.type === "weapon")
            .sort((a, b) => a.name.localeCompare(b.name));
        let meleeWeapons = items
            .filter(
                (i) => i.data.type === "weapon" && i.data.data.subtype === "Melee"
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .valueOf();
        let weaponActions = this._produceMap(tokenId, weapons, macroType);
        let weaponsSubcategory = this.initializeEmptySubcategory();
        weaponsSubcategory.actions = weaponActions;
        this._combineSubcategoryWithCategory(
            result,
            game.i18n.localize("OD6S.WEAPONS"),
            weaponsSubcategory
        );

        let combatActions = [];
        for (let action in game.od6s.config.actions) {
            if (game.od6s.config.actions[action].rollable) {
                let name = game.i18n.localize(game.od6s.config.actions[action].name);
                let encodedValue = [
                    macroType,
                    tokenId,
                    game.od6s.config.actions[action].type,
                ].join(this.delimiter);
                combatActions.push({
                    name: name,
                    id: action,
                    encodedValue: encodedValue,
                });
                if (name === game.i18n.localize("OD6S.ACTION_PARRY")) {
                    for (let weapon = 0; weapon < meleeWeapons.length; weapon++) {
                        const name =
                            game.i18n.localize("OD6S.ACTION_PARRY") +
                            " (" +
                            meleeWeapons[weapon].data.name +
                            ")";
                        const encodedValue = [
                            "parry",
                            tokenId,
                            meleeWeapons[weapon].id,
                        ].join(this.delimiter);
                        combatActions.push({
                            name: name,
                            encodedValue: encodedValue,
                            id: meleeWeapons[weapon].id,
                        });
                    }
                }
            }
        }

        let actionsSubcategory = this.initializeEmptySubcategory();
        actionsSubcategory.actions = combatActions;
        this._combineSubcategoryWithCategory(
            result,
            game.i18n.localize("OD6S.ACTIONS"),
            actionsSubcategory
        );

        if (actor.getFlag('od6s', 'crew')) {
            let vehicleWeaponsSubcategory = this.initializeEmptySubcategory();
            vehicleWeaponsSubcategory.actions = this._produceMap(tokenId,
                actor.data.data.vehicle.vehicle_weapons,
                macroType);
            this._combineSubcategoryWithCategory(
                result,
                game.i18n.localize("OD6S.VEHICLE_WEAPON"),
                vehicleWeaponsSubcategory
            );


            let vehicleActions = [];
            for (let action in game.od6s.config.vehicle_actions) {
                if (game.od6s.config.vehicle_actions[action].rollable) {
                    let name = '';
                    if (action === 'sensors') {
                        if (game.settings.get('od6s', 'sensors')) {
                            for (let type in actor.data.data.vehicle.sensors.types) {
                                name = game.i18n.localize(game.od6s.config.vehicle_actions[action].name) + ": " +
                                    game.i18n.localize(actor.data.data.vehicle.sensors.types[type].label);
                                let encodedValue = [
                                    macroType,
                                    tokenId,
                                    game.od6s.config.vehicle_actions[action].type + type
                                ].join(this.delimiter);
                                vehicleActions.push({
                                    name: name,
                                    id: action,
                                    encodedValue: encodedValue,
                                });
                            }
                        }
                    } else {
                        name = game.i18n.localize(game.od6s.config.vehicle_actions[action].name);
                        let encodedValue = [
                            macroType,
                            tokenId,
                            game.od6s.config.vehicle_actions[action].type,
                        ].join(this.delimiter);
                        vehicleActions.push({
                            name: name,
                            id: action,
                            encodedValue: encodedValue,
                        });
                    }
                }
            }

            let vehicleActionsSubcategory = this.initializeEmptySubcategory();
            vehicleActionsSubcategory.actions = vehicleActions;
            this._combineSubcategoryWithCategory(
                result,
                game.i18n.localize("OD6S.VEHICLE_ACTIONS"),
                vehicleActionsSubcategory
            );
        }
        return result;
    }

    _buildAttributesCategory(actor, tokenId, categoryName) {
        let macroType = "attribute";
        let result = this.initializeEmptyCategory("attributes");
        let attributes = actor.data.data.attributes;

        let actions = Object.entries(attributes).map((e) => {
            if (e[1].score === 0) return;
            let name = game.od6s.config.attributes[e[0]].name;
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            return {name: name, id: e[0], encodedValue: encodedValue};
        });

        let attributesCategory = this.initializeEmptySubcategory();
        attributesCategory.actions = actions.filter((a) => !!a);
        this._combineSubcategoryWithCategory(
            result,
            categoryName,
            attributesCategory
        );
        return result;
    }

    _buildSkillsCategory(actor, tokenId, categoryName) {
        let macroType = "skill";
        let result = this.initializeEmptyCategory(categoryName);
        let items = actor.items;
        let skills = items.filter(
            (i) => i.data.type === "skill" || i.data.type === "specialization"
        );
        skills.sort((a, b) => a.name.localeCompare(b.name));
        let skillActions = this._produceMap(tokenId, skills, macroType);
        let skillsSubcategory = this.initializeEmptySubcategory();
        skillsSubcategory.actions = skillActions;
        this._combineSubcategoryWithCategory(
            result,
            categoryName,
            skillsSubcategory
        );
        return result;
    }

    /** @private */
    _produceMap(tokenId, itemSet, macroType) {
        return itemSet
            .filter((i) => !!i)
            .map((i) => {
                let encodedValue = [macroType, tokenId, i.id].join(
                    this.delimiter
                );
                return {name: i.name, encodedValue: encodedValue, id: i.id};
            });
    }
}
