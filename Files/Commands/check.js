const Discord = require('discord.js');

module.exports = {
	name: 'check',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		console.log(msg.args);
		const user = msg.args[0] ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')) : msg.author;
		const lan = msg.lan;
		const con = msg.client.constants.commands[this.name];

		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(lan.author, { target: user }), con.author.image, con.author.url)
			.addField(lan.banLoad, msg.client.constants.emotes.loading);

		let warns = 0;
		let mutes = 0;

		const res = await msg.client.ch.query('SELECT *, ROW_NUMBER() OVER () FROM warns WHERE userid = $1;', [user.id]);
		if (res && res.rowCount > 0) {
			if (res.rows.filter(row => row.type == 'Warn').length > 0) warns = res.rows.filter(row => row.type == 'Warn').length;
			if (res.rows.filter(row => row.type == 'Mute').length > 0) mutes = res.rows.filter(row => row.type == 'Mute').length;
		}
		embed.setDescription(`${msg.client.ch.stp(lan.text, {warns: `${warns}`, mutes: `${mutes}`})}`);

		const Warns = new Discord.MessageButton()
			.setCustomId('warns')
			.setLabel(lan.warns)
			.setStyle(warns > 0 ? 'primary' : 'secondary')
			.setDisabled(mutes == 0);
		const Mutes = new Discord.MessageButton()
			.setCustomId('mutes')
			.setLabel(lan.mutes)
			.setStyle(mutes > 0 ? 'primary' : 'secondary')
			.setDisabled(mutes == 0);

		const collector = m.createMessageComponentCollector({ time: 60000 });
		collector.on('collected', (click) => {
			Display(click.customId);
		});
		collector.on('end', (collected, reason) => {
			if (reason == 'time') msg.client.ch.collectorEnd(msg);
		});

		const m = await msg.client.ch.reply(msg, {embeds: [embed], components: msg.client.ch.buttonRower(Warns, Mutes)});

		const ban = await msg.guild.bans.fetch(user.id).catch(() => { });
		embed.fields = [];
		if (ban && ban.guild) embed.addField(msg.client.ch.stp(lan.banned, { target: user }), `${msg.language.reason}: \`\`\`${ban.reason}\`\`\``);
		else embed.addField('\u200b', `**${msg.client.ch.stp(lan.notbanned, { target: user })}**`);
		m.edit({embeds: [embed]});

		async function Display(id) {
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(lan.author, { target: user }), con.author.image, con.author.url)
				

		}

	}
};
