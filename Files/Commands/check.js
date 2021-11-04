const Discord = require('discord.js');

module.exports = {
	name: 'check',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		const user = msg.args[0] ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')) : msg.author;
		if (!user) return msg.client.ch.reply(msg, msg.language.noUser);
		const lan = msg.lan;
		const con = msg.client.constants.commands[this.name];

		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(lan.author, { target: user }), con.author.image, con.author.url)
			.addField(lan.banLoad, msg.client.constants.emotes.loading);

		let warns = 0;
		let mutes = 0;
		const options = {warns: new Array, mutes: new Array};

		const res = await msg.client.ch.query('SELECT *, ROW_NUMBER() OVER () FROM warns WHERE userid = $1;', [user.id]);
		if (res && res.rowCount > 0) {
			if (res.rows.filter(row => row.type == 'Warn').length > 0) warns = res.rows.filter(row => row.type == 'Warn').length;
			if (res.rows.filter(row => row.type == 'Mute').length > 0) mutes = res.rows.filter(row => row.type == 'Mute').length;
			res.rows.forEach(r => {
				const dateOfWarn = new Date(new Number(r.dateofwarn));
				if (r.type == 'Warn') options.warns.push({ label: `${msg.language.number}: ${r.row_number} | ${dateOfWarn.getDate()} ${msg.language.months[dateOfWarn.getMonth()]} ${dateOfWarn.getFullYear()}`, value: r.row_number });
				if (r.type == 'Mute') options.warns.push({ label: `${msg.language.number}: ${r.row_number} | ${dateOfWarn.getDate()} ${msg.language.months[dateOfWarn.getMonth()]} ${dateOfWarn.getFullYear()}`, value: r.row_number });
			});
		}
		const take = {warns: new Array, mutes: new Array};
		for (let j = 0; j < 25 && j < options.warns.length; j++) take.warns.push(options.warns[j]);
		for (let j = 0; j < 25 && j < options.mutes.length; j++) take.mutes.push(options.mutes[j]);
		const rawRows = new Array;

		if (take.mutes.length > 0) {
			const muteMenu = new Discord.MessageSelectMenu()
				.setCustomId('muteMenu')
				.addOptions(take.mutes)
				.setMinValues(1)
				.setMaxValues(take.mutes.length)
				.setPlaceholder(lan.selMutes);
			const muteNext = new Discord.MessageButton()
				.setCustomId('muteNext')
				.setLabel(msg.language.next)
				.setDisabled(options.mutes.length < 25 ? true : false)
				.setStyle('SUCCESS');
			const mutePrev = new Discord.MessageButton()
				.setCustomId('mutePrev')
				.setLabel(msg.language.prev)
				.setDisabled(true)
				.setStyle('DANGER');
			rawRows.push([muteMenu], [muteNext, mutePrev]);
		}
		if (take.warns.length > 0) {
			const warnMenu = new Discord.MessageSelectMenu()
				.setCustomId('warnMenu')
				.addOptions(take.warns)
				.setMinValues(1)
				.setMaxValues(take.warns.length)
				.setPlaceholder(lan.selWarns);
			const warnNext = new Discord.MessageButton()
				.setCustomId('warnNext')
				.setLabel(msg.language.next)
				.setDisabled(options.warns.length < 25 ? true : false)
				.setStyle('SUCCESS');
			const warnPrev = new Discord.MessageButton()
				.setCustomId('warnPrev')
				.setLabel(msg.language.prev)
				.setDisabled(true)
				.setStyle('DANGER');
			rawRows.push([warnMenu], [warnNext, warnPrev]);
		}
		const row = msg.client.ch.buttonRower(rawRows);

		embed.setDescription(`${msg.client.ch.stp(lan.text, { warns: `${warns}`, mutes: `${mutes}` })}`);
		msg.m = await msg.client.ch.reply(msg, { 
			embeds: [embed], 
			components: row
		});

		buttonHandler(msg);

		const ban = await msg.guild.bans.fetch(user.id).catch(() => { });
		embed.fields = [];
		if (ban && ban.guild) embed.addField(msg.client.ch.stp(lan.banned, { target: user }), `${msg.language.reason}: \`\`\`${ban.reason}\`\`\``);
		else embed.addField('\u200b', `**${msg.client.ch.stp(lan.notbanned, { target: user })}**`);
		msg.m.edit({embeds: [embed]});
	}
};

function buttonHandler(msg) {
	const collector = msg.m.createMessageComponentCollector({ time: 60000 });
	collector.on('collected', (click) => {
		console.log(click.customId);
	});
	collector.on('end', (collected, reason) => {
		if (reason == 'time') msg.m.edit({embeds: msg.m.embeds, components: []});
	});
}
 
