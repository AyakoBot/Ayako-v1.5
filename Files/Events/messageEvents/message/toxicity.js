const regex = new RegExp('/[^ w]+/', 'g');
const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		if (!msg.channel) return;
		if (!msg.channel.type || msg.channel.type == 'dm') return;
		if (!msg.author || msg.author.bot) return;
		const member = await msg.client.ch.member(msg.guild, msg.author);
		if (member.permissions.has(8n)) return;
		const result = await msg.client.ch.query(`SELECT * FROM blacklist WHERE guildid = '${msg.guild.id}';`);
		if (result && result.rowCount > 0) {
			if (result.rows[0].active == false) return;
			const args = msg.content.split(/ +/);
			let words = [];
			if (result.rows[0].words) {
				const blwords = result.rows[0].words.split(/, +/g);
				for (let i = 0; i < args.length; i++) {
					const argr = `${args[i]}`.replace(regex, '');
					if (blwords.includes(argr.toLowerCase())) {
						if (`${blwords[i]}` !== '') words.push(argr.toLowerCase());
					}
				}
				if (!words[0]) return;
				console.log(words);
				await msg.delete().catch(() => {});
				const language = await msg.client.ch.languageSelector(msg.guild);
				const m = await msg.client.ch.send(msg.channel, msg.client.ch.stp(language.commands.toxicityCheck.warning, {user: msg.author}));
				if (m) setTimeout(() => {m.delete().catch(() => {});}, 10000);
				const embed = new Discord.MessageEmbed()
					.setAuthor(msg.client.constants.standard.image, language.commands.toxicityCheck.author, msg.client.constants.standard.invite)
					.setDescription(msg.client.ch.stp(language.commands.toxicityCheck.info, {guild: msg.guild})+words.map(w => `\`${w}\``))
					.setColor(msg.client.constants.commands.toxicityCheck);
				const DMchannel = await msg.author.createDM().catch(() => {});
				if (DMchannel) msg.client.ch.send(DMchannel, embed);
				const res = await msg.client.ch.query(`SELECT * FROM toxicitycheck WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
				let amount;
				if (res && res.rowCount > 0) {
					msg.client.ch.query(`UPDATE toxicitycheck SET amount = '${+res.rows[0].amount + 1}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
					amount = res.rows[0].amount;
				} else {
					msg.client.ch.query(`INSERT INTO toxicitycheck (guildid, userid, amount) VALUES ('${msg.guild.id}', '${msg.author.id}', '1');`);
					amount = 0;
				}
				amount++;
				if (result.rows[0].warntof == true) {
					if (amount == +result.rows[0].warnafteramount) { 
						const reason = language.commands.toxicityCheck.warnReason;
						msg.client.emit('warnAdd', msg.client.user, msg.author, reason, msg);
					}
				}
				if (result.rows[0].mutetof == true) {
					if (amount % +result.rows[0].muteafteramount == 0) {
						if (amount == +result.rows[0].warnafteramount) return;
						const reason = language.commands.toxicityCheck.warnReason;
						msg.client.emit('tempmuteAdd', msg.client.user, msg.author, reason, msg, msg.client.ch.ms('1h'));
					}
				}
			}
		}
	}
};