import {ActionHandler} from "../../core/actions/actionHandler.js";

export class ActionHandlerOD6S extends ActionHandler {
    constructor(categoryManager) {
        super(categoryManager);
    }

    /** @override */
    async buildSystemActions(actionList, character, subcategoryIds) {
        let result = this.initializeEmptyActionList();

        if (!token) return result;

        result.tokenId = token.id;

        let actor = token.actor;

        if (!actor) return result;
        if (actor.type === 'container') return result;

        result.actorId = actor.id;

        if (actor.type !== 'vehicle' && actor.type !== 'starship') {
            let combatCategory = this._buildCombatActionsCategory(actor, result.tokenId);

            let vehicleCategory = this._buildVehicleCategory(actor, result.tokenId);

            let attributeCategory = this._buildAttributesCategory(
                actor,
                result.tokenId,
                "attributes"
            );

            let skillCategory = this._buildSkillsCategory(actor, result.tokenId, "skills");

            this._combineCategoryWithList(
                result,
                game.i18n.localize("OD6S.COMBAT"),
                combatCategory
            );

            this._combineCategoryWithList(
                result,
                game.i18n.localize("OD6S.VEHICLE"),
                vehicleCategory
            )

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
        }

        if (isNewerVersion(game.system.version, "0.2.4")) {
            if (actor.type === 'vehicle' || actor.type === 'starship') {
                if (actor.system.crewmembers.length > 0) {
                    for (let i of actor.system.crewmembers) {
                        let crewMember = await game.od6s.getActorFromUuid(i.uuid);
                        if(crewMember.testUserPermission(game.user, "OWNER")) {
                            let category = this._buildVehicleCategory(crewMember, crewMember.uuid, 'crew');
                            this._combineCategoryWithList(result, crewMember.name, category);
                        }
                    }
                }
            }
        }

        return result;
    }

    _buildCombatActionsCategory(actor, tokenId) {
        let actionType = "action";
        let result = this.initializeEmptyCategory("combatactions");
        let items = actor.items;

        const resistanceTypes = ["pr", "er"];
        let resistances = [];
        for (let r of resistanceTypes) {
            let name = game.i18n.localize(actor.data[r].label);
            let encodedValue = [actionType, tokenId, r].join(this.delimiter);
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
            .filter((i) => i.type === "weapon" && i.system.equipped.value)
            .sort((a, b) => a.name.localeCompare(b.name));
        let meleeWeapons = items
            .filter(
                (i) => i.type === "weapon" && i.system.subtype === "Melee" && i.system.equipped.value)
            .sort((a, b) => a.name.localeCompare(b.name))
            .valueOf();
        let weaponActions = this._produceMap(tokenId, weapons, actionType);
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
                    actionType,
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

        return result;
    }

    _buildVehicleCategory(actor, tokenId, categoryName) {
        let actionType;
        if (categoryName === 'crew') {
            actionType = "crew";
        } else {
            actionType = "action";
        }

        let result = this.initializeEmptyCategory("vehicleactions");

        if (actor.getFlag('od6s', 'crew')) {
            if (isNewerVersion(game.system.version, "0.1.14")) {
                let resistances = [];
                let name;

                if (actor.system.vehicle.type === "vehicle") {
                    name = game.i18n.localize(game.od6s.config.vehicleToughnessName);
                } else {
                    name = game.i18n.localize(game.od6s.config.starshipToughnessName);
                }
                let encodedValue = [actionType, tokenId, "vehicletoughness"].join(this.delimiter);
                resistances.push({name: name, id: "vehicletoughness", encodedValue: encodedValue});

                if (actor.system.vehicle.shields.value > 0) {
                    for (let arc in actor.system.vehicle.shields.arcs) {
                        let name = game.i18n.localize(actor.system.vehicle.shields.arcs[arc].label) +
                            " " + game.i18n.localize('OD6S.SHIELDS');
                        let encodedValue = [
                            actionType,
                            tokenId,
                            "vehicleshields" + arc
                        ].join(this.delimiter);
                        resistances.push({name: name, id: "vehicletoughness", encodedValue: encodedValue});
                    }
                }

                let vehicleResistanceSubcategory = this.initializeEmptySubcategory();
                vehicleResistanceSubcategory.actions = resistances;
                this._combineSubcategoryWithCategory(
                    result,
                    game.i18n.localize("OD6S.RESISTANCE"),
                    vehicleResistanceSubcategory
                );
            }


            let vehicleWeaponsSubcategory = this.initializeEmptySubcategory();
            vehicleWeaponsSubcategory.actions = this._produceMap(tokenId,
                actor.system.vehicle.vehicle_weapons.filter(i => i.system.equipped.value),
                actionType);
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
                            for (let type in actor.system.vehicle.sensors.types) {
                                name = game.i18n.localize(game.od6s.config.vehicle_actions[action].name) + ": " +
                                    game.i18n.localize(actor.system.vehicle.sensors.types[type].label);
                                let encodedValue = [
                                    actionType,
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
                            actionType,
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
        let actionType = "attribute";
        let result = this.initializeEmptyCategory("attributes");
        let attributes = actor.system.attributes;

        let actions = Object.entries(attributes).map((e) => {
            if (e[1].score === 0) return;
            let name = game.od6s.config.attributes[e[0]].name;
            let encodedValue = [actionType, tokenId, e[0]].join(this.delimiter);
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
        let actionType = "skill";
        let result = this.initializeEmptyCategory(categoryName);
        let items = actor.items;
        let skills = items.filter(
            (i) => i.type === "skill" || i.type === "specialization"
        );
        skills.sort((a, b) => a.name.localeCompare(b.name));
        let skillActions = this._produceMap(tokenId, skills, actionType);
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
    _produceMap(tokenId, itemSet, actionType) {
        return itemSet
            .filter((i) => !!i)
            .map((i) => {
                let encodedValue = [actionType, tokenId, i.id].join(
                    this.delimiter
                );
                return {name: i.name, encodedValue: encodedValue, id: i.id};
            });
    }
}
