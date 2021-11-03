const Discord = require('discord.js');

module.exports = {
	name: 'check',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		const user = msg.args[0] ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => { }) : msg.author;
		const lan = msg.lan;
		const con = msg.client.constants.commands[this.name];

		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(lan.author, { target: user }), con.author.image, con.author.url)
			.addField(lan.banLoad, msg.client.constants.emotes.loading);

		let warns = 0;
		let mutes = 0;

		const res = await msg.client.ch.query('SELECT *, ROW_NUMBER() OVER () FROM warns;');
		if (res && res.rowCount > 0) warns = res.rows.filter(row => row.type == 'Warn').length, mutes = res.rows.filter(row => row.type == 'Mute').length;

		embed.setDescription(`${msg.client.ch.stp(lan.warns, {warns: warns})}\n${msg.client.ch.stp(lan.mutes, {mutes: mutes})}`);

		const m = await msg.client.ch.reply(msg, embed);
		const ban = await msg.guild.bans.fetch(user.id).catch(() => { });
		embed.fields = [];
		if (ban && ban.guild) embed.addField(msg.client.ch.stp(lan.banned, { target: user }), `${msg.language.reason}: \`\`\`${ban.reason}\`\`\``);
		else embed.addField(msg.client.ch.stp(lan.notbanned, { target: user }), '\u200b');
		m.edit({embeds: [embed]});
	}
};