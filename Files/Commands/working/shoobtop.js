const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'shoobtop',
	ThisGuildOnly: ['298954459172700181'],
	description: 'Display the Shoob leaderboard of the server',
	usage: 'h!shoobtop (amount of ranks to display)',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permcards, errorchannelID) {
		/* eslint-enable */
		const res = await pool.query('SELECT * FROM shoob');
		let content = '`Rank | Cards | User`\n';
		let ownPosCards;
		let ownPosPos;
		res.rows.sort((a,b) => b.amount - a.amount);

		for (let i = 0; i < res.rowCount; i++) {
			let userid = res.rows[i].userid;
			const cards = res.rows[i].amount;
			const amount = 30;
			if (i < amount) {
				if (+i+1 < 10) {
					if (cards < 9 || cards == 9) {
						content += `\` ${+i+1}.  |     ${cards} | \`<@${userid}>\n`;
					} else if (cards < 99 || cards == 99) {
						content += `\` ${+i+1}.  |    ${cards} | \`<@${userid}>\n`;
					} else if (cards < 999 || cards == 999) {
						content += `\` ${+i+1}.  |   ${cards} | \`<@${userid}>\n`;
					} else if (cards < 9999 || cards == 9999) {
						content += `\` ${+i+1}.  |  ${cards} | \`<@${userid}>\n`;
					} else if (cards < 99999 || cards == 99999) {
						content += `\` ${+i+1}.  | ${cards} | \`<@${userid}>\n`;
					}
				} else if (+i+1 > 9) {
					if (cards < 9 || cards == 9) {
						content += `\`${+i+1}.  |     ${cards} | \`<@${userid}>\n`;
					} else if (cards < 99 || cards == 99) {
						content += `\`${+i+1}.  |    ${cards} | \`<@${userid}>\n`;
					} else if (cards < 999 || cards == 999) {
						content += `\`${+i+1}.  |   ${cards} | \`<@${userid}>\n`;
					} else if (cards < 9999 || cards == 9999) {
						content += `\`${+i+1}.  |  ${cards} | \`<@${userid}>\n`;
					} else if (cards < 99999 || cards == 99999) {
						content += `\`${+i+1}.  | ${cards} | \`<@${userid}>\n`;
					}
				}
			}
			if (userid == msg.author.id) { 
				ownPosPos = +i+1;
				ownPosCards = cards;
			}
		}
		await content;
		if (!ownPosPos) ownPosPos = 'Not Ranked';
		if (!ownPosCards) ownPosCards = '0';
		const leaderboard = new Discord.MessageEmbed()
			.setTitle('Leaderboard of '+msg.guild.name)
			.setColor('#b0ff00')
			.setDescription(content)
			.addField('Your Position', `Position: ${ownPosPos} | Cards: ${ownPosCards}`)
			.setTimestamp();
		msg.channel.send(leaderboard);

	}};