const Discord = require('discord.js');
const cooldown = new Set();  
const cooldownServer = new Set();

module.exports = {
	async execute(msg) {
		if (!msg.author) return;
		if (msg.author.bot) return;
		if (msg.channel.type == 'dm') return;
		const language = await msg.client.ch.languageSelector(msg.guild);
		const resG = await msg.client.ch.query(`SELECT * FROM levelglobal WHERE userid = '${msg.author.id}';`);
		if (resG && resG.rowCount > 0) {
			const resSpam = await msg.client.ch.query(`SELECT * FROM antilevelspam WHERE userid = '${msg.author.id}';`);
			if (resSpam && resSpam.rowCount > 0) {
				if (msg.content.replace(/'/g, '').replace('`', '') == resSpam.rows[0].message) return;
			}
			const user = msg.client.users.cache.get(resG.rows[0].userid);
			const curXP = resG.rows[0].xp;
			const curLvL = resG.rows[0].level;
			let votegain;
			if (resG.rows[0].votegain == null) votegain = 1;
			else votegain = resG.rows[0].votegain;
			if (user && user.id) {
				if (!cooldown.has(msg.author.id)) {
					cooldown.add(msg.author.id);
					if (resSpam) {
						if (resSpam.rows[0]) msg.client.ch.query(`UPDATE antilevelspam SET message = '${msg.content.replace(/'/g, '').replace('`', '')}' WHERE userid = '${msg.author.id}';`);
						else msg.client.ch.query(`INSERT INTO antilevelspam (userid, message) VALUES ('${msg.author.id}', '${msg.content.replace(/'/g, '').replace('`', '')}');`);
					} else msg.client.ch.query(`INSERT INTO antilevelspam (userid, message) VALUES ('${msg.author.id}', '${msg.content.replace(/'/g, '').replace('`', '')}');`);
					setTimeout(() => {
						cooldown.delete(msg.author.id);
					}, 60000);
					const newXP = Math.floor(Math.random() * 10 + 10) * +votegain;
					const XP = +curXP + +newXP;
					await msg.client.ch.query(`UPDATE levelglobal SET xp = '${XP}' WHERE userid = '${user.id}';`);
					const newLevel = +curLvL + 1;
					const neededXP = 5 / 6 * +newLevel * (2 * +newLevel * +newLevel + 27 * +newLevel + 91);
					if (+XP > +neededXP) {
						await msg.client.ch.query(`UPDATE levelglobal SET level = '${newLevel}' WHERE userid = '${user.id}';`);
					}
				}
			}
		} else msg.client.ch.query(`INSERT INTO levelglobal(userid, xp, level) VALUES ('${msg.author.id}', '1', '0');`).catch(() => {});
		const resS = await msg.client.ch.query(`SELECT * FROM levelsettings WHERE guildid = '${msg.guild.id}';`);
		let settings;
		if (resS && resS.rowCount > 0) settings = resS.rows[0];
		else {
			settings = [];
			settings.disabled = false;
			settings.xpgain = 1;
			settings.blchannelid = [];
			settings.lvlupmode = 'silent';
		}
		if (settings.disabled == true) return;
		if (settings.disabled == false) {
			if (settings.blchannelid) {
				if (settings.blchannelid.includes(msg.channel.id)) return;
			}
			if (!cooldownServer.has(msg.author.id)) {
				cooldownServer.add(msg.author.id);
				setTimeout(() => {
					cooldownServer.delete(msg.author.id);
				}, 60000);
				const result = await msg.client.ch.query(`SELECT * FROM levelserver WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
				if (result && result.rowCount > 0) {
					const member = await msg.client.ch.member(msg.guild, msg.author);
					if (result.rows[0].blroleid) {
						for (const id of [...result.rows[0].blroleid.entries()]) {
							const role = msg.guild.roles.cache.get(id);
							if (!role) {
								result.rows[0].blroleid.splice(result.rows[0].blroleid.indexOf(id), 1);
								msg.client.ch.query(`UPDATE levelserver SET blroleid = ARRAY[${result.rows[0].blroleid}] WHERE guildid = '${msg.guild.id}';`);
							} else if (member.roles.cache.has(role.id)) return;
						}
					}
					const curXP = result.rows[0].xp;
					const curLvL = result.rows[0].level;
					let multiplier;
					const mRes = await msg.client.ch.query(`SELECT * FROM levelmultiroles WHERE guildid = '${msg.guild.id}';`);
					if (mRes && mRes.rowCount > 0) {
						mRes.rows.forEach(async row => {
							const role = msg.guild.roles.cache.get(row.role);
							if (!role) return msg.client.ch.query(`DELETE FROM levelmultiroles WHERE guildid = '${msg.guild.id}' AND roleid = '${row.roleid}';`);
							else {
								if (member && member.roles.cache.has(role.id)) multiplier + row.multiplier;
							}
						});
					}
					const newXP = Math.floor(Math.random() * 10 + 15) * +settings.xpgain * multiplier ? multiplier : 1;
					const XP = +curXP + +newXP;
					await msg.client.ch.query(`UPDATE levelserver SET xp = '${XP}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
					const newLevel = +curLvL + 1;
					const neededXP = 5 / 6 * +newLevel * (2 * +newLevel * +newLevel + 27 * +newLevel + 91);
					if (+XP > +neededXP) {
						await msg.client.ch.query(`UPDATE levelserver SET level = '${newLevel}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
						if (newLevel == 1) { 
							if (settings.lvlupmode == 'reactions') {
								const LevelUpEmbed = new Discord.MessageEmbed()
									.setAuthor(msg.client.ch.stp(language.commands.leveling.levelUp.author, {user: msg.author, level: newLevel}), msg.client.ch.displayAvatarURL(msg.author))
									.setTimestamp()
									.setDescription(msg.client.ch.stp(language.commands.leveling.levelUp.description, {emote1: msg.client.constants.emotes.ayakoPeek, emote2: msg.client.constants.emotes.up}))
									.setColor(msg.guild.me.displayHexColor)
									.setFooter(language.commands.leveling.levelUp.footer);
								const m = await msg.client.ch.send(msg.channel, LevelUpEmbed);
								setTimeout(() => {m.delete().catch(() => {});}, 10000);
								msg.react(msg.client.emotes.ayakoPeekID).catch(() => {});
								msg.react(msg.client.emotes.up).catch(() => {});
								setTimeout(() => {msg.reactions.removeAll().catch(() => {}); }, 10000);  
							}
						}
						if (newLevel % 10 == 0) {
							if (settings.lvlupmode == 'reactions') {
								const LevelUpEmbed = new Discord.MessageEmbed()
									.setAuthor(msg.client.ch.stp(language.commands.leveling.levelUp.author, {user: msg.author, level: newLevel}), msg.client.ch.displayAvatarURL(msg.author))
									.setTimestamp()
									.setColor(msg.guild.me.displayHexColor)
									.setFooter(language.commands.leveling.levelUp.footer);
								const m = await msg.client.ch.send(msg.channel, LevelUpEmbed);
								setTimeout(() => {m.delete().catch(() => {});}, 10000);							
							}
						} else {
							let leveluptext = msg.client.ch.stp(language.commands.leveling.levelUp.author, {user: msg.author, level: newLevel});
							if (result.rows[0].text) leveluptext = result.rows[0].text.replace('{user}', `${msg.author}`).replace('{level}', `${newLevel}`).replace('/u2b', '\'');
							if (settings.lvlupmode == 'reactions') {
								msg.react(msg.client.emotes.ayakoPeekID).catch(() => {});
								msg.react(msg.client.emotes.up).catch(() => {});
								setTimeout(function(){  msg.reactions.removeAll().catch(() => {}); }, 10000);  
							} else if (settings.lvlupmode == 'messages') {
								const embed = new Discord.MessageEmbed()
									.setAuthor(`${leveluptext}`, msg.client.ch.displayAvatarURL(msg.author))
									.setColor(msg.guild.me.displayHexColor);
								let channel;
								if (settings.lvlupchannel) {
									channel = msg.client.channels.cache.get(settings.lvlupchannel);
									if (!channel) channel = msg.channel;
								} else channel = msg.channel;
								msg.client.ch.send(msg.channel, `${msg.author}`, embed).catch(() => {});
							}
						}
						const resR = await msg.client.ch.query(`SELECT * FROM levelroles WHERE guildid = '${msg.guild.id}' AND level < '${+newLevel + 1}';`);
						if (resR && resR.rowCount > 0) {
							for (let i = 0; i < resR.rowCount; i++) {
								const role = msg.guild.roles.cache.find(role => role.id === resR.rows[i].roleid);
								if (!msg.guild.member(msg.author).roles.cache.has(role.id)) msg.guild.member(msg.author).roles.add(role).catch(() => {});
							}
						}
					}
				} else {
					const newXP = Math.floor(Math.random() * 10 + 15);
					await msg.client.ch.query(`INSERT INTO levelserver(guildid, userid, xp, level) VALUES ('${msg.guild.id}', '${msg.author.id}', '${newXP}', '0');`);
				}
			}
		}
	}
};