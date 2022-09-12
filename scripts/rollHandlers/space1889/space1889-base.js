import { RollHandler } from '../rollHandler.js';
import { Logger } from "../../logger.js";

export class RollHandlerBaseSpace1889 extends RollHandler
{
	constructor()
	{
		super();
	}

	async doHandleActionEvent(event, encodedValue)
	{
		let payload = encodedValue.split('|');

		if (payload.length !== 3)
		{
			super.throwInvalidValueErr();
		}

		let macroType = payload[0];
		let tokenId = payload[1];
		let actionId = payload[2];
		let actor = super.getActor(tokenId);

		if (tokenId === 'multi')
		{
			for (let t of canvas.tokens.controlled)
			{
				actor = super.getActor(t.id);
				await this._handleMacros(event, macroType, actor, actionId);
			}
		} else
		{
			await this._handleMacros(event, macroType, actor, actionId);
		}
	}

	async _handleMacros(event, macroType, actor, actionId)
	{
		switch (macroType)
		{
			case 'primary':
				this.executePrimary(event, actor, actionId);
				break;
			case 'secondary':
				this.executeSecondary(event, actor, actionId);
				break;
			case 'skill':
				this.executeSkill(event, actor, actionId);
				break;
			case 'specialization':
				this.executeSpecialization(event, actor, actionId);
				break;
			case 'talent':
				this.executeTalent(event, actor, actionId);
				break;
			case 'weapon':
				this.executeWeapon(event, actor, actionId);
				break;
			case 'manoeuvre':
				this.executeManoeuvre(event, actor, actionId);
				break;
			case 'defense':
				this.executeDefense(event, actor, actionId);
				break
			case 'damage':
				this.executeDamage(actor, actionId);
				break;
		}
	}

	executePrimary(event, actor, actionId)
	{
		actor.rollPrimary(actionId, event );
	}

	executeSecondary(event, actor, actionId)
	{
		actor.rollSecondary(actionId, event);
	}

	executeSkill(event, actor, actionId)
	{
		actor.rollSkill(actionId, event);
	}

	executeSpecialization(event, actor, actionId)
	{
		actor.rollSpecialization(actionId, event);
	}

	executeTalent(event, actor, actionId)
	{
		actor.rollTalent(actionId, event);
	}

	executeManoeuvre(event, actor, actionId)
	{
		actor.rollManoeuvre(actionId, event);
	}
		
	executeWeapon(event, actor, actionId)
	{
		actor.rollAttack(actionId, event);
	}

	executeDefense(event, actor, actionId)
	{
		actor.rollDefence(actionId, event);
	}

	executeDamage(actor, actionId)
	{
		actor.addDamage(actionId);
	}
}
