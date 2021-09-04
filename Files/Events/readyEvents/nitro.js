const Discord = require('discord.js');

module.exports = {
	async execute() {
		return;
		const { client } = require('../../BaseClient/DiscordClient');
		const ch = client.ch;
		const Logchannel = client.channels.cache.get('781724288830013481');
		let content = `${new Date(Date.now()).toLocaleString()}\n`;
		const result = await ch.query('SELECT * FROM nitrosettings;');
		if (result && result.rowCount > 0) {
			for (let j = 0; j < result.rowCount; j++) {
				const roleid = result.rows[j].boosterroleid;
				const guild = client.guilds.cache.get(result.rows[j].guildid);
				if (guild && guild.id) {
					const role = guild.roles.cache.get(roleid);
					if (role && role.id) {
						role.members.forEach(async (member) => {
							const res = await ch.query(`SELECT * FROM nitroboosters WHERE userid = '${member.user.id}' AND guildid = '${guild.id}';`);
							if (res.rowCount == 0) {
								ch.query(`INSERT INTO nitroboosters (guildid, userid, days, stillactive) VALUES ('${guild.id}', '${member.user.id}', '0', 'true');`);
								content += `ADDED to true = ${member.user.id} / ${member.user.username} - ${guild.id} / ${guild.name}\n`;
							} 
							if (res.rowCount !== 0) {
								ch.query(`UPDATE nitroboosters SET stillactive = 'true' WHERE userid = '${member.user.id}' AND guildid = '${guild.id}';`);
								content += `SET to true = ${member.user.id} / ${member.user.username} - ${guild.id} / ${guild.name} ;\n`;
							}
						});
					} else {
						const embed = new Discord.MessageEmbed()
							.setDescription(`Couldnt update users of guild \n${guild.name} / ${guild.id}\nSince Role with ID ${roleid} is inaccessible`)
							.setTimestamp()
							.setColor('RED');
						Logchannel.send(embed).catch(() => {});
					}
				}
			}
		}
		const res = await ch.query('SELECT * FROM nitroboosters;');
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rowCount; i++) {
				if (res.rows[i].stillactive == true) {
					const user = await client.users.fetch(res.rows[i].userid);
					const guild = client.guilds.cache.get(res.rows[i].guildid);
					if (guild && guild.id) {
						const member = await msg.guild.members.fetch(user.id);
						const language = await ch.languageSelector(guild);
						if (user && user.id) {
							content += `HANDLING = ${user.id} / ${user.username} - ${guild.id} / ${guild.name}\n`;
							const resS = await ch.query(`SELECT * FROM nitrosettings WHERE guildid = '${guild.id}';`);
							if (resS && resS.rowCount > 0) {
								const boosterroleid = resS.rows[0].boosterroleid;
								const boosterrole = guild.roles.cache.get(boosterroleid);
								const nitrologchannelid = resS.rows[0].nitrologchannelid;
								let NitroLogChannel;
								if (nitrologchannelid !== null) {
									NitroLogChannel = guild.channels.cache.get(nitrologchannelid);
								}
								const resR = await ch.query(`SELECT * FROM nitroroles WHERE guildid = '${guild.id}';`);
								if (resR.rowCount == 0) {
									if (member) {
										if (member.roles.cache.has(boosterrole.id)) {
											let Days = res.rows[i].days;
											Days++;
											ch.query(`UPDATE nitroboosters SET days = '${Days}' WHERE userid = '${user.id}' AND guildid = '${guild.id}';`);
											content += `UPDATED days = ${user.id} / ${user.username} - ${guild.id} / ${guild.name}\n`;
										} else {
											if (res.rows[i].stillactive == true) {
												ch.query(`UPDATE nitroboosters SET stillactive = 'false' WHERE userid = '${user.id}' AND guildid = '${guild.id}';`);
												content += `SET to false = ${user.id} / ${user.username} - ${guild.id} / ${guild.name} ;\n`;
											}
										}
									}
								} else if (resR.rowCount > 0) {
									if (member) {
										if (member.roles.cache.has(boosterrole.id)) {
											let Days = res.rows[i].days;
											Days++;
											ch.query(`UPDATE nitroboosters SET days = '${Days}' WHERE userid = '${user.id}' AND guildid = '${guild.id}';`);
											content += `UPDATED days = ${user.id} / ${user.username} - ${guild.id} / ${guild.name}\n`;
											for (let l = 0; l < resR.rowCount; l++) {
												if (res.rows[i].days > resR.rows[l].days) {
													const specialrole = guild.roles.cache.get(resR.rows[l].roleid);
													if (specialrole && specialrole.id) {
														if (member.roles.cache.has(boosterrole.id)) {
															if (!member.roles.cache.has(specialrole.id)) {
																//member.roles. add(specialrole).catch(() => {});
																const logembed = new Discord.MessageEmbed()
																	.setDescription(ch.stp(language.nitro.gotRole, {user: user, role: specialrole, days: resR.rows[l].days}))
																	.setTimestamp()
																	.setColor(guild.me.displayHexColor);
																if (NitroLogChannel) NitroLogChannel.send(logembed).catch(() => {});
															}
														}
													}
												}
											}
										} else {
											if (res.rows[i].stillactive == true) {
												ch.query(`UPDATE nitroboosters SET stillactive = 'false' WHERE userid = '${user.id}' AND guildid = '${guild.id}';`);
												content += `SET to false = ${user.id} / ${user.username} - ${guild.id} / ${guild.name} ;\n`;
											}
										}
									} else {
										ch.query(`UPDATE nitroboosters SET stillactive = 'false' WHERE userid = '${user.id}' AND guildid = '${guild.id}';`);
										content += `SET to false = ${user.id} / ${user.username} - ${guild.id} / ${guild.name} ;\n`;
									}
								}
							}
						}
					}
				}
			}
		}
		console.log(content);
		Logchannel.send('Finished Nitro Boosting - Check console at '+new Date(Date.now()).toLocaleString()).catch(() => {});
	}
};