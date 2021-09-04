const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const ch = client.ch;
		const Constants = client.constants;
		const res = await ch.query('SELECT * FROM giveawaysettings;');
		if (res && res.rowCount > 0) {
			res.rows.forEach(async (row) => {
				const r = row;
				const guild = client.guilds.cache.get(r.guildid);
				if (guild && guild.id) {
					const language = await ch.languageSelector(guild);
					const channel = client.channels.cache.get(r.channelid);
					if (channel && channel.id) {
						let description;
						if (r.requirement == 'role') {
							description = ch.stp(language.ready.giveaway.description.role, { desc: r.description, role: guild.roles.cache.get(r.reqroleid) });
						} else if (r.requirement == 'guild') {
							if (r.invitelink) {
								description = ch.stp(language.ready.giveaway.description.guild.withInvite, {desc: r.description, servername: client.guilds.cache.get(r.reqserverid) ? client.guilds.cache.get(r.reqserverid).name : language.unknown, invitelink: r.invitelink});
							} else {
								description = ch.stp(language.ready.giveaway.description.guild.withInvite, {desc: r.description, servername: client.guilds.cache.get(r.reqserverid) ? client.guilds.cache.get(r.reqserverid).name : language.unknown});
							}
						} else {
							description = r.description;
						}
						const winnercount = r.winnercount;
						const endat = r.endat;
						const ended = r.ended;
						let abort = false;
						if (endat < Date.now() && ended == false) {
							const msg = await channel.messages.fetch(r.messageid).catch(() => {});
							if (msg && msg.id) {
								const reaction = msg.reactions.cache.find(r => r.emoji.name === '🎉');
								let users;
								if (reaction) {
									users = await reaction.users.fetch();
									users = users											
										.filter(u => u.bot === false)
										.filter(async u => await guild.members.fetch(u.id));
									if (r.requirement) {
										if (r.requirement == 'role') {
											const role = guild.roles.cache.get(r.reqroleid);
											if (role && role.id) {
												users = users.filter(async u => (await msg.guild.members.fetch(u.id)).roles.cache.has(role.id));
											} else {
												const embed = new Discord.MessageEmbed()
													.setDescription(description)
													.setTimestamp(new Date(+endat).toUTCString())
													.setColor(guild.me.displayHexColor)
													.setAuthor(language.ready.giveaway.name, Constants.standard.image, Constants.standard.link)
													.setFooter(language.ready.giveaway.endedAt)
													.addField(language.ready.giveaway.roleInaccessible, '\u200b');
												msg.edit(embed).catch(() => {});
												ch.query('UPDATE giveawaysettings SET ended = $1 WHERE messageid = $2;', [true, msg.id]);
												return;
											}
										}
										if (r.requirement == 'guild') {
											const reqGuild = client.guilds.cache.get(r.reqserverid);
											if (reqGuild && reqGuild.id) {
												users = users.filter(async u => await guild.members.fetch(u.id));
											} else {
												const embed = new Discord.MessageEmbed()
													.setDescription(description)
													.setTimestamp(new Date(+endat).toUTCString())
													.setColor(guild.me.displayHexColor)
													.setAuthor(language.ready.giveaway.name, Constants.standard.image, Constants.standard.link)
													.setFooter(language.ready.giveaway.endedAt)
													.addField(language.ready.giveaway.leftServer, '\u200b');
												msg.edit(embed).catch(() => {});
												ch.query('UPDATE giveawaysettings SET ended = $1 WHERE messageid = $2;', [true, msg.id]);
												return;
											}
										}
									}
									users = users
										.random(winnercount)
										.filter(u => u)
										.map(async u => await msg.guild.members.fetch(u.id));
								}
								if (abort == false) {
									const embed = new Discord.MessageEmbed()
										.setDescription(description)
										.setTimestamp(new Date(+endat).toUTCString())
										.setColor(guild.me.displayHexColor)
										.setAuthor(language.ready.giveaway.name, Constants.standard.image, Constants.standard.link)
										.setFooter(language.ready.giveaway.endedAt);
									if(users && users.length > 0) {
										embed.addField(language.ready.giveaway.winners, users.map(w => `<@${w.id}>`).join(', '));
										const winnerembed = new Discord.MessageEmbed()
											.setColor(guild.me.displayHexColor)
											.setDescription(description)
											.setFooter(language.ready.giveaway.endAt)
											.setTimestamp(new Date(+endat).toUTCString());
										ch.send(channel, ch.stp(language.ready.giveaway.congraz, {usermap: users.map(w => `<@${w.id}>`)}), winnerembed);
									} else {
										embed.addField(language.ready.giveaway.noparticipants, '\u200b');
									}
									msg.edit(embed).catch(() => {});
								}
								ch.query('UPDATE giveawaysettings SET ended = $1 WHERE messageid = $2;', [true, r.messageid]);
							}
						} else if (endat > Date.now() && ended == false) {
							const msg = await channel.messages.fetch(r.messageid).catch(() => {});
							if (msg && msg.id) {
								const timeleft = moment.duration(+endat - Date.now()).format(`D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`);
								const giveawayEmbed = new Discord.MessageEmbed()
									.setColor(guild.me.displayHexColor)
									.setAuthor(language.ready.giveaway.name, Constants.standard.image, Constants.standard.link)
									.setDescription(`\u200b${description}`)
									.addField(language.ready.giveaway.guide, ch.stp(language.ready.giveaway.remaining, {timeleft: timeleft}))
									.setFooter(`\u200b${winnercount}`+language.ready.giveaway.winners)
									.setTimestamp(new Date(+endat).toUTCString());
								msg.edit(giveawayEmbed).catch(() => {});
							}
						}
					}
				}
			});
		}
	}
};