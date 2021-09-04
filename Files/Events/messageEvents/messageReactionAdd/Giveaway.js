const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(reaction, user) {
		if (user.id == client.user.id) return;
		const guild = reaction.message.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.messageReactionAddGiveaway;
		const con = Constants.messageReactionAddGiveaway;
		let reqRole;
		let reqGuild;
		let requirement;
		let invitelink;
		const res = await ch.query('SELECT * FROM giveawaysettings WHERE messageid = $1;', [reaction.message.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			requirement = r.requirement;
			if (reaction.message.createdTimestamp > Date.now()-1000) {
				const DMchannel  = await client.users.cache.get(r.host).createDM().catch(() => {});
				if (DMchannel) client.ch.send(DMchannel, lan.warnedFast);
				const DMchannel2  = await user.createDM().catch(() => {});
				if (DMchannel2) client.ch.send(DMchannel2, lan.warnFast);
				reaction.users.remove(user).catch(() => {});
				return;
			}
			if (requirement) {
				if (requirement.includes('role')) {
					reqRole = guild.roles.cache.find(role => role.id === r.reqroleid);
				}
				if (requirement.includes('guild')) {
					reqGuild = client.guilds.cache.get(r.reqserverid); 
					invitelink = r.invitelink;
				}
			}
		}
		if (requirement) {
			let dmChannel;
			const embed = new Discord.MessageEmbed()
				.setAuthor(lan.author.name, Constants.standard.icon, Constants.standard.invite);
			if (requirement.includes('role')) {
				const member = await guild.members.fetch(user.id);
				if (member) {
					if(!member.roles.cache.has(reqRole.id)) {
						reaction.users.remove(user).catch(() => {});
						dmChannel = await user.createDM().catch(() => {});
						if (dmChannel) {
							embed
								.setTitle(lan.title.denied)
								.setURL(ch.stp(con.url, {reaction: reaction}))
								.setDescription(`${lan.description.rejectedText}(${ch.stp(con.url, {reaction: reaction})} "${lan.description.ClickText}")`)
								.setColor(con.color);
						}
					}
				}
			} else if (requirement.includes('guild')) {
				const member = await guild.members.fetch(user.id);
				if(!member) {
					dmChannel = await user.createDM().catch(() => {});
					if (dmChannel) {
						embed
							.setTitle(lan.title.accepted)
							.setDescription(`${lan.description.acceptedText} [${reqGuild.name}](${invitelink} "${lan.description.ClickText}").`)
							.setColor(guild.me.displayHexColor);
					}
				}
			}
			//if (embed.description) ch.send(dmChannel, embed);
		}
	}
};