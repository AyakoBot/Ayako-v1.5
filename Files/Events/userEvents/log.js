const { client } = require('../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(oldUser, newUser) {
		const ch = client.ch;
		const Constants = client.constants;
		client.guilds.cache.forEach(async (guild) => {
			const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}';`);
			if (res && res.rowCount > 0) {
				const r = res.rows[0];
				const logchannel = client.channels.cache.get(r.userEvents);
				if (logchannel && logchannel.id) {
					const member = await ch.member(guild, newUser);
					if (member) {
						const language = await ch.languageSelector(guild);
						const lan = language.userUpdate;
						const con = Constants.userUpdate;
						const changedKey = [];
						const embed = new Discord.MessageEmbed()
							.setTimestamp()
							.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {user: newUser}))
							.setColor(con.color);
						if (oldUser.avatar !== newUser.avatar) {
							changedKey.push(language.avatar);
							newUser.wanted = 'avatar';
							const path = await ch.downloader(newUser, ch.displayAvatarURL(newUser));
							if (path) {
								const name = await ch.getName(path);
								embed.attachFiles([path]);
								embed.setThumbnail(`attachment://${name}`);
								embed.addField(language.avatar, lan.avatar);
							}
						}
						if (oldUser.username !== newUser.username) {
							changedKey.push(language.username);
							embed.addField(language.username, `${language.before}: \`${oldUser.username}\`\n${language.after}: \`${newUser.username}\``);
						}
						if (oldUser.discriminator !== newUser.discriminator) {
							changedKey.push(language.discriminator);
							embed.addField(language.discriminator, `${language.before}: \`${oldUser.discriminator}\`\n${language.after}: \`${newUser.discriminator}\``);
						}
						embed.setDescription(ch.stp(lan.description, {user: newUser})+changedKey.map(o => ` \`${o}\``));
						if (embed.fields.length > 0) ch.send(logchannel, embed);
					}
				}
			}
		});
	}
};