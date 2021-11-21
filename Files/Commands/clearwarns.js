const Discord = require('discord.js');

module.exports = {
	name: 'clearwarns',
	perm: 8192n,
	dm: false,
	takesFirstArg: true,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		const lan = msg.language.commands.clearwarns;
		const con = msg.client.constants.commands.clearwarns; 
		const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => { });
        
		const embed = new Discord.MessageEmbed()
			.setColor(con.loading);
		
		if (!user) {
			embed.setDescription(lan.noUser);
			embed.setColor(con.fail);
			return msg.client.ch.reply(msg, embed);
		}
		const res = await msg.client.ch.query('SELECT * FROM warns WHERE userid = $1 AND guildid = $2;', [user.id, msg.guild.id]);
		if (!res || res.rowCount == 0) {
			embed.setDescription(lan.noWarns);
			embed.setColor(con.fail);
			return msg.client.ch.reply(msg, embed);
		}
        
		embed.setDescription(msg.client.ch.stp(lan.sure, { user: user }));
		const yes = new Discord.MessageButton()
			.setCustomId('yes')
			.setLabel(msg.language.Yes)
			.setStyle('SUCCESS');
		const no = new Discord.MessageButton()
			.setCustomId('no')
			.setLabel(msg.language.No)
			.setStyle('DANGER');
		msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: msg.client.ch.buttonRower([[yes, no]]) });

		const collector = msg.channel.createMessageComponentCollector({time: 60000});
		collector.on('collect', async (button) => {
			if (button.user.id == msg.author.id) {
				if (button.customId == 'yes') {
					await msg.client.ch.query('DELETE FROM warns WHERE userid = $1 AND guildid = $2;', [user.id, msg.guild.id]);
					embed.setDescription(msg.client.ch.stp(lan.cleared, { user: user }));
					embed.setColor(con.success);
					msg.m.edit({embeds: [embed], components: []}).catch(() => {});
					log(msg, res, user, lan, con);
					collector.stop();
				} else if (button.customId == 'no') {
					embed.setDescription(lan.fail);
					embed.setColor(con.fail);
					msg.m.edit({ embeds: [embed], components: [] }).catch(() => { });
					collector.stop();
				}
			} else msg.client.ch.notYours(button, msg);
		});
		collector.on('end', (col, reason) => {
			if (reason === 'time') return msg.client.ch.collectorEnd(msg);
		});
	}
};

function log(msg, res, user, lan, con) {
	const logEmbed = new Discord.MessageEmbed()
		.setAuthor(msg.client.ch.stp(lan.log.author, {user: user}), con.log.image, msg.client.constants.standard.invite)
		.setColor(con.log.color)
		.setFooter(msg.client.ch.stp(lan.log.footer, { author: msg.author}));
	
	let description = null;
	for (let i = 0; i < res.rowCount; i++) {
		const r = res.rows[i];
		const msgLink = msg.client.ch.stp(lan.log.details, { link: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, { guildid: r.guildid, channelid: r.warnedinchannelid, msgid: r.msgid }) });
		logEmbed.addField(
			msg.client.ch.stp(lan.log.title, { type: res.rows[i].type, user: res.rows[i].warnedbyusername, channel: res.rows[i].warnedinchannelname }), 
			msg.client.ch.stp(lan.log.value, { time: `<t:${res.rows[i].dateofwarn.slice(0, -3)}:F> (<t:${res.rows[i].dateofwarn.slice(0, -3)}:R>)`, reason: res.rows[i].reason})
		);
		description !== null ? description += ` | ${msgLink}` : description = `${msgLink}`;
	}
	logEmbed.setDescription(description);
	if (msg.logchannels) msg.client.ch.send(msg.logchannels, logEmbed);
}