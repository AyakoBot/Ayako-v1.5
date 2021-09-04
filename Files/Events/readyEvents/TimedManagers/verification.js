const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute() {
		const res = await client.ch.query('SELECT * FROM verification WHERE active = $1 AND kicktof = $1;', [true]);
		if (res && res.rowCount > 0) {
			res.rows.forEach((r) => {
				const guild = client.guilds.cache.get(r.guildid);
				if (guild) {
					const unverifiedRole = guild.roles.cache.get(r.pendingrole);
					if (unverifiedRole) {
						unverifiedRole.members.forEach(async (member) => {
							if (member.joinedTimestamp < (+Date.now() - (r.kickafter * 60000))) {
								if (member.kickable) {
									const language = await client.ch.languageSelector(guild);
									const lan = language.verification;
									const embed = new Discord.MessageEmbed()
										.setDescription(client.ch.stp(lan.kickMsg, {guild: guild}))
										.setColor(client.constants.mod.kickAdd.color);
									const DM = await member.user.createDM().catch(() => {});
									if (DM) await client.ch.send(DM, {embeds: [embed]});
									member.kick({reason: lan.kickReason}).catch(() => {});
								}
							}
						});
					}
				}
			});
		}
	}
};