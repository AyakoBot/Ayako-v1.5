const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'leaderboard',
	Category: 'Leveling',
	aliases: ['lvls', 'top', 'levels'],
	description: 'Display the Leveling leaderboard of the server',
	usage: 'h!leaderboard (amount of ranks to display)',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
		/* eslint-enable */
		const res = await pool.query(`SELECT * FROM levelserver WHERE guildid = '${msg.guild.id}'`);
		let content = '`Rank | Level |          XP | User`\n';
		const ownPos = [];
		res.rows.sort((a,b) => b.xp - a.xp);

		for (let i = 0; i < res.rowCount; i++) {
			let userid = res.rows[i].userid;
			const level = res.rows[i].level;
			const xp = Math.floor(res.rows[i].xp);
			const amount = 30;
			if (i < amount) {
				if (+i+1 < 10) {
					if (xp < 9 || xp == 9) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |           ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 99 || xp == 99) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |          ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 999 || xp == 999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |         ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 9999 || xp == 9999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |        ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 99999 || xp == 99999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |       ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 999999 || xp == 999999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |      ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 9999999 || xp == 9999999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |     ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 99999999 || xp == 99999999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |     ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 999999999 || xp == 999999999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |    ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 9999999999 || xp == 9999999999) {
						if (level < 9 || level == 9) {
							content += `\` ${+i+1}.  |     ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\` ${+i+1}.  |    ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\` ${+i+1}.  |   ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\` ${+i+1}.  |  ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\` ${+i+1}.  | ${level} |   ${xp} | \`<@${userid}>\n`;
						}
					}
				} else if (+i+1 > 9) {
					if (xp < 9 || xp == 9) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |           ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |           ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 99 || xp == 99) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |          ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |          ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 999 || xp == 999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |         ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |         ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 9999 || xp == 9999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |        ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |        ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 99999 || xp == 99999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |       ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |       ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 999999 || xp == 999999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |      ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |      ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 9999999 || xp == 9999999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |     ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 99999999 || xp == 99999999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |     ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |     ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 999999999 || xp == 999999999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |    ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |    ${xp} | \`<@${userid}>\n`;
						}
					} else if (xp < 9999999999 || xp == 9999999999) {
						if (level < 9 || level == 9) {
							content += `\`${+i+1}.  |     ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 99 || level == 99) {
							content += `\`${+i+1}.  |    ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 999 || level == 999) {
							content += `\`${+i+1}.  |   ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 9999 || level == 9999) {
							content += `\`${+i+1}.  |  ${level} |   ${xp} | \`<@${userid}>\n`;
						} else if (level < 99999 || level == 99999) {
							content += `\`${+i+1}.  | ${level} |   ${xp} | \`<@${userid}>\n`;
						}
					}
				}
			}
			if (res.rows[i].userid == msg.author.id) { 
				ownPos.pos = +i+1;
				ownPos.level = level;
				ownPos.xp = xp;
			}
		}
		await content;
		const leaderboard = new Discord.MessageEmbed()
			.setTitle('Leaderboard of '+msg.guild.name)
			.setColor('#b0ff00')
			.setDescription(content)
			.addField('Your Position', `Position: ${ownPos.pos} | Level: ${ownPos.level} | XP: ${ownPos.xp}`)
			.setTimestamp();
		msg.channel.send(leaderboard);

	}};