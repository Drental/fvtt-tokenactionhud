import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { Logger } from "../../logger.js";

export class ActionHandlerSpace1889 extends ActionHandler
{
	constructor(categoryManager)
	{
		super(categoryManager);
	}


	buildSystemActions(actionList, character, subcategoryIds)
	{
		let result = this.initializeEmptyActionList();
		if (!token)
			return result;

		let tokenId = token.id;
		result.tokenId = tokenId;
		let actor = token.actor;
		if (!actor)
			return result;

		result.actorId = actor.id;

		this._combineCategoryWithList(
			result,
			this.i18n("tokenActionHud.attributes"),
			this._abilities(actor, tokenId)
		);

		this._combineCategoryWithList(
			result,
			this.i18n("tokenActionHud.skills"),
			this._skills(actor, tokenId)
		);

		if (actor.system.talents.find(e => e.system.isRollable) !== undefined)
		{
			this._combineCategoryWithList(
				result,
				this.i18n("tokenActionHud.talents"),
				this._talants(actor, tokenId)
			)
		}

		if (actor.type == 'vehicle')
		{
			this._combineCategoryWithList(
				result,
				this.i18n("SPACE1889.VehicleManoeuvre"),
				this._manoeuvre(actor, tokenId)
			)
		}

		this._combineCategoryWithList(
			result,
			this.i18n("tokenActionHud.attack"),
			this._attacks(actor, tokenId)
		);


		this._combineCategoryWithList(
			result,
			this.i18n("tokenActionHud.defenses"),
			this._defenses(actor, tokenId)
		);

		this._combineCategoryWithList(
			result,
			this.i18n("tokenActionHud.damage"),
			this._damage(actor, tokenId)
		)

		if (settings.get("showHudTitle")) result.hudTitle = token.name;

		return result;
	}


	_defenses(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('defenses');
		const type = 'defense';

		let category = this._addEntry(tokenId, this.i18n('SPACE1889.SecondaryAttributeDef') + ' (' + actor.system.secondaries.defense.total + ')', 'defense', type);
		if (!['creature','vehicle'].includes(actor.type))
		{
			this._addEntry(tokenId, this.i18n('SPACE1889.Block') + ' (' + actor.system.block.value + ')', 'block', type, category);
			this._addEntry(tokenId, this.i18n('SPACE1889.Parry') + ' (' + actor.system.parry.value + ')', 'parry', type, category);
			this._addEntry(tokenId, this.i18n('SPACE1889.Evasion') + ' (' + actor.system.evasion.value + ')', 'evasion', type, category);
		}
		if (actor.type !=='vehicle')
			this._addEntry(tokenId, this.i18n('SPACE1889.ActiveDefense') + ' (' + actor.system.secondaries.defense.activeTotal + ')', 'activeDefense', type, category);
			
		this._addEntry(tokenId, this.i18n('SPACE1889.PassiveDefense') + ' (' + actor.system.secondaries.defense.passiveTotal + ')', 'passiveDefense', type, category);
		this._addEntry(tokenId, this.i18n('SPACE1889.TalentVolleAbwehr') + ' (' + (actor.system.secondaries.defense.total+4) + ')', 'totalDefense', type, category);

		this._combineSubcategoryWithCategory(result, this.i18n('SPACE1889.SecondaryAttributeDef'), category);

		return result;
	}


	_addEntry(tokenId, label, actionId, type, category)
	{
		if (!category) category = this.initializeEmptySubcategory();

		category.actions.push({
			name: label,
			encodedValue: [type, tokenId, actionId].join(this.delimiter),
		});
		return category
	}


	_skills(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('skills');
		let category = this.initializeEmptySubcategory();

		for (const skill of actor.system.skills)
		{
			this._addEntry(tokenId, skill.system.label + ' (' + skill.system.rating.toString() + ')', skill.system.id, 'skill', category);

			for (const spezi of actor.system.speciSkills)
			{
				if (spezi.system.underlyingSkillId == skill.system.id)
					this._addEntry(tokenId, spezi.system.label + ' (' + spezi.system.rating.toString() + ')', spezi.system.id, 'specialization', category);
			}
		}

		this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.skills'), category);

		return result;
	}


	_attacks(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('attacks');
		let category = this.initializeEmptySubcategory();

		for (const weapon of actor.system.weapons)
		{
			this._addEntry(tokenId, weapon.name + ' (' + weapon.system.attack.toString() + ')', weapon.system.id, 'weapon', category);
		}

		this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.attack'), category);

		return result;
	}


	_talants(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('talents');
		let category = this.initializeEmptySubcategory();

		for (const talent of actor.system.talents)
		{
			if (talent.system.isRollable)
				this._addEntry(tokenId, talent.system.label, talent.system.id, 'talent', category);
		}

		this._combineSubcategoryWithCategory(result, this.i18n('tokenActionHud.talents'), category);

		return result;
	}

	_manoeuvre(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('manoeuvre');
		let category = this.initializeEmptySubcategory();
		if ('vehicle' == actor.type)
		{
			let actions = Object.entries(game.space1889.config.vehicleManoeuvres).map((e) =>
			{
				let name = this.i18n(e[1]);
				let encodedValue = ['manoeuvre', tokenId, e[0]].join(this.delimiter);
				return { name: name, id: e[0], encodedValue: encodedValue};
			});
			category.actions = actions.filter((a) => !!a);
		}

		this._combineSubcategoryWithCategory(result, this.i18n('SPACE1889.VehicleManoeuvre'), category);
		
		return result;
	}

	_damage(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('damage');

		let category = this._addEntry(tokenId, this.i18n('SPACE1889.Lethal'), 'lethal', 'damage');
		this._addEntry(tokenId, this.i18n('SPACE1889.NonLethal'), 'nonLethal', 'damage', category);

		this._combineSubcategoryWithCategory(result, this.i18n('SPACE1889.AddDamage'), category);

		return result;
	}

	_abilities(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('abilities');
		let abilityCategory = this.initializeEmptySubcategory();
		
		const abilities = actor.system.abilities;
		if (abilities !== undefined && actor.type !=='vehicle')
		{
			let actions = Object.entries(game.space1889.config.abilities).map((e) =>
			{
				if (abilities[e[0]].value === 0) return;
				let name = this.i18n(e[1]) + '(' + abilities[e[0]].total?.toString() + ')';
				let encodedValue = ['primary', tokenId, e[0]].join(this.delimiter);
				return { name: name, id: e[0], encodedValue: encodedValue};
			});
			abilityCategory.actions = actions.filter((a) => !!a);
			this._addEntry(tokenId, this.i18n('SPACE1889.SecondaryAttributePer') + ' (' + actor.system.secondaries.perception.total?.toString() + ')', 'perception', 'secondary', abilityCategory);
		}		
		this._combineSubcategoryWithCategory(result, this.i18n('SPACE1889.AbilityPl'), abilityCategory);

		return result;
	}

}
