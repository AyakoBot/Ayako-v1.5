const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async execute(msg) {
		const take = {warns: [], mutes: []};
		const options = {warns: [], mutes: []};
		const mutePage = 1;
		const warnPage = 1;
		const answered = { warns: [], mutes: [] };


		const rawRows = [];
		if (take.mutes.length > 0) {
			const muteMenu = new Discord.MessageSelectMenu()
				.setCustomId('muteMenu')
				.addOptions(take.mutes)
				.setMinValues(1)
				.setMaxValues(take.mutes.length)
				.setPlaceholder(msg.lan.selMutes);
			const muteNext = new Discord.MessageButton()
				.setCustomId('muteNext')
				.setLabel(msg.language.next)
				.setDisabled(options.mutes.length < mutePage * 25 + 26 ? true : false)
				.setStyle('SUCCESS');
			const mutePrev = new Discord.MessageButton()
				.setCustomId('mutePrev')
				.setLabel(msg.language.prev)
				.setDisabled(mutePage == 1 ? true : false)
				.setStyle('DANGER');
			rawRows.push([muteMenu], [muteNext, mutePrev]);
			if (mutePage >= Math.ceil(+options.mutes.length / 25)) muteNext.setDisabled(true);
			else muteNext.setDisabled(false);
			if (mutePage > 1) mutePrev.setDisabled(false);
			else mutePrev.setDisabled(true);
		}
		if (take.warns.length > 0) {
			const warnMenu = new Discord.MessageSelectMenu()
				.setCustomId('warnMenu')
				.addOptions(take.warns)
				.setMinValues(1)
				.setMaxValues(take.warns.length)
				.setPlaceholder(msg.lan.selWarns);
			const warnNext = new Discord.MessageButton()
				.setCustomId('warnNext')
				.setLabel(msg.language.next)
				.setDisabled(options.warns.length < warnPage * 25 + 26 ? true : false)
				.setStyle('SUCCESS');
			const warnPrev = new Discord.MessageButton()
				.setCustomId('warnPrev')
				.setLabel(msg.language.prev)
				.setDisabled(warnPage == 1 ? true : false)
				.setStyle('DANGER');
			rawRows.push([warnMenu], [warnNext, warnPrev]);
			if (warnPage >= Math.ceil(+options.warns.length / 25)) warnNext.setDisabled(true);
			else warnNext.setDisabled(false);
			if (warnPage > 1) warnPrev.setDisabled(false);
			else warnPrev.setDisabled(true);
		}
		if (take.warns.length > 0 || take.mutes.length > 0) {
			const done = new Discord.MessageButton()
				.setCustomId('done')
				.setLabel(msg.language.done)
				.setStyle('DEFAULT');
			if (answered.warns.length > 0 || answered.mutes.length > 0) done.setDisabled(false);
			else done.setDisabled(true);
			rawRows.push([done]);
		}
		const rows = msg.client.ch.buttonRower(rawRows);
		msg.client.ch.reply(msg, {content: 'a', components: rows});
	}
};