const Discord = require('discord.js');

module.exports = {
	async execute(member, user) {
		const client = user.client;
		const ch = client.ch;
		const Constants = client.constants;
		const res = await ch.query('SELECT * FROM giveawaysettings WHERE reqserverid = $1;', [member.guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const channel = client.channels.cache.get(r.channelid);
			if (channel) {
				const m = await channel.messages.fetch(r.messageid);
				let allReactions = m.reactions;
				if (allReactions) {
					allReactions = allReactions.cache.first();
					if (allReactions) {
						allReactions = allReactions.users.cache.map(u => u.id);
						if (allReactions.includes(user.id)) {
							const guild = client.guilds.cache.get(r.guildid);
							const language = await ch.languageSelector(guild);
							const lan = language.guildMemberAddGiveaway;
							const DM = user.createDM().catch(() => {});
							const embed = new Discord.MessageEmbed()
								.setAuthor(ch.stp(lan.author.title, {member: member}), Constants.standard.image, Constants.standard.invite)
								.setDescription(ch.stp(lan.description, {guild: guild, channel: channel, message: m}))
								.setColor(Constants.standard.color);
							ch.send(DM, embed);
						}
					}
				}
			}
		}
	}
};