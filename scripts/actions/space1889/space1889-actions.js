import { ActionHandler } from "../actionHandler.js";
import * as settings from "../../settings.js";
import { Logger } from "../../logger.js";

export class ActionHandlerSpace1889 extends ActionHandler
{
	constructor(filterManager, categoryManager)
	{
		super(filterManager, categoryManager);
	}


	doBuildActionList(token, multipleTokens)
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
			this.i18n("tokenactionhud.attributes"),
			this._abilities(actor, tokenId)
		);

		this._combineCategoryWithList(
			result,
			this.i18n("tokenactionhud.skills"),
			this._skills(actor, tokenId)
		);

		if (actor.talents.find(e => e.data.isRollable) != undefined)
		{
			this._combineCategoryWithList(
				result,
				this.i18n("tokenactionhud.talents"),
				this._talants(actor, tokenId)
			)
		}

		this._combineCategoryWithList(
			result,
			this.i18n("tokenactionhud.attack"),
			this._attacks(actor, tokenId)
		);


		this._combineCategoryWithList(
			result,
			this.i18n("tokenactionhud.defenses"),
			this._defenses(actor, tokenId)
		);

		this._combineCategoryWithList(
			result,
			this.i18n("tokenactionhud.damage"),
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
		if (actor.type != 'creature')
		{
			this._addEntry(tokenId, this.i18n('SPACE1889.Block') + ' (' + actor.system.block.value + ')', 'block', type, category);
			this._addEntry(tokenId, this.i18n('SPACE1889.Parry') + ' (' + actor.system.parry.value + ')', 'parry', type, category);
			this._addEntry(tokenId, this.i18n('SPACE1889.Evasion') + ' (' + actor.system.evasion.value + ')', 'evasion', type, category);
		}

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

		for (const skill of actor.skills)
		{
			this._addEntry(tokenId, this.i18n(skill.data.nameLangId) + ' (' + skill.data.rating.toString() + ')', skill.data.id, 'skill', category);

			for (const spezi of actor.speciSkills)
			{
				if (spezi.data.underlyingSkillId == skill.data.id)
					this._addEntry(tokenId, this.i18n(spezi.data.nameLangId) + ' (' + spezi.data.rating.toString() + ')', spezi.data.id, 'specialization', category);
			}
		}

		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.skills'), category);

		return result;
	}


	_attacks(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('attacks');
		let category = this.initializeEmptySubcategory();

		for (const weapon of actor.weapons)
		{
			this._addEntry(tokenId, weapon.name + ' (' + weapon.data.attack.toString() + ')', weapon.data.id, 'weapon', category);
		}

		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attack'), category);

		return result;
	}


	_talants(actor, tokenId)
	{
		let result = this.initializeEmptyCategory('talents');
		let category = this.initializeEmptySubcategory();

		for (const talent of actor.talents)
		{
			if (talent.data.isRollable)
				this._addEntry(tokenId, this.i18n(talent.data.nameLangId), talent.data.id, 'talent', category);
		}

		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.talents'), category);

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
		const abilities = actor.system.abilities;
		let result = this.initializeEmptyCategory('abilities');

		let actions = Object.entries(game.space1889.config.abilities).map((e) =>
		{
			if (abilities[e[0]].value === 0) return;

			let name = this.i18n(e[1]) + '(' + abilities[e[0]].total.toString() + ')';

			let encodedValue = ['primary', tokenId, e[0]].join(this.delimiter);

			return { name: name, id: e[0], encodedValue: encodedValue};
		});

		let abilityCategory = this.initializeEmptySubcategory();
		abilityCategory.actions = actions.filter((a) => !!a);
		this._addEntry(tokenId, this.i18n('SPACE1889.SecondaryAttributePer') + ' (' + actor.system.secondaries.perception.total.toString() + ')', 'perception', 'secondary', abilityCategory);

		this._combineSubcategoryWithCategory(result, this.i18n('SPACE1889.AbilityPl'), abilityCategory);

		return result;
	}

}
