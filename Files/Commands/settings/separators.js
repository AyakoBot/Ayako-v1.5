const Discord = require('discord.js');

module.exports = {
	perm: 268435456n,
	type: 2,
	async exe(msg) {
		let res = await msg.client.ch.query(`SELECT * FROM roleseparator WHERE guildid = '${msg.guild.id}';`);
		const roleCheck = await checker(msg, res);
		if (roleCheck) res = await msg.client.ch.query(`SELECT * FROM roleseparator WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.list) return this.list(msg, res);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			const embed = new Discord.MessageEmbed()
				.setDescription(msg.client.ch.stp(msg.lan.list.name, {prefix: msg.client.constants.standard.prefix}))
				.setColor(msg.client.constants.commands.settings.color)
				.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
			if (res && res.rowCount > 0) {
				for (let i = 0; i < res.rowCount; i++) {
					const r = res.rows[i];
					embed.addField(msg.language.number+` \`${i}\``, `${msg.lan.stoprole}:${r.stoprole ? `<@&${r.stoprole}>` : msg.language.none}\n${msg.lan.separator}:${r.separator ? `<@&${r.separator}>` : msg.language.none}`);
				}
			}
			if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix})+'\n'+msg.client.ch.stp(msg.lan.list.name, {prefix: msg.client.constants.standard.prefix}));
			msg.m ? msg.m.edit(embed) : msg.client.ch.reply(msg, embed);
			const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 30000});
			if (!collected || !collected.first()) return;
			else {
				const answer = collected.first().content.toLowerCase();
				if (answer.includes(msg.language.list)) this.list(msg, res, answer);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) {
					if (answer == msg.language.edit) this.edit(msg);
				}
			}
		}
	},
	async edit(msg) {
		msg.lan2 = msg.lan.edit;
		const res = await msg.client.ch.query(`SELECT * FROM roleseparator WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+`__\n\n**${msg.client.ch.stp(msg.lan2.remove.name, {trigger: msg.lan.edit.remove.trigger.map(e => `\`${e}\``), amount: '-'})}**`)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			if (res && res.rowCount > 0) {
				for (let i = 0; i < res.rowCount; i++) {
					const r = res.rows[i];
					embed.addField(msg.language.number+` \`${i}\``, `${msg.lan.stoprole}:\n${r.stoprole ? `<@&${r.stoprole}> / \`${r.stoprole}\`` : msg.language.none}\n${msg.lan.separator}:\n${r.separator ? `<@&${r.separator}> / \`${r.separator}\`` : msg.language.none}`);
				}
			}
			const m = await msg.client.ch.reply(msg, embed);
			let collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
			if (!collected.first()) return;
			const editAnswers = {}; 
			let answer = collected.first().content.toLowerCase();
			for (let i = 0; i < Object.keys(msg.lan.edit).length; i++) {
				const name = Object.getOwnPropertyNames(msg.lan.edit);
				if (name[i] !== 'author' && name[i] !== 'howToEdit') {
					editAnswers[name[i]] = msg.lan.edit[name[i]].trigger;
					for (let j = 0; j < Object.keys(editAnswers[name[i]]).length; j++) {editAnswers[name[i]][j] = editAnswers[name[i]][j].replace(/`/g, '');}
				}
			}
			for (let i = 0; i < Object.keys(editAnswers).length; i++) {
				const name = Object.getOwnPropertyNames(editAnswers);
				if (editAnswers[name[i]].includes(answer)) {
					collected.first().delete().catch(() => {});
					const editEmbed = new Discord.MessageEmbed()
						.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
						.addField(msg.language.commands.settings.valid, msg.lan2[name[i]].answers);
					if (msg.lan2[name[i]].recommended) editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan.edit[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**\n\n'+msg.lan2[name[i]].recommended);
					else editEmbed.setDescription('**'+msg.client.ch.stp(msg.lan.edit[name[i]].name, {trigger: msg.lan2[name[i]].trigger.map(e => `\`${e}\``), amount: '-'})+'**');
					await m.edit(editEmbed).catch(() => {});
					collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
					if (!collected.first()) return;
					answer = collected.first().content.toLowerCase();
					if (msg.client.constants.commands.settings.edit.separators[name[i]] == 'name') {
						collected.first().delete().catch(() => {});
						const endEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}))								
							.addField(msg.lan.block, r[name[i]] && r[name[i]] !== [] ? `${r[name[i]].map(word => ` \`${word}\``)}`.length > 0 ? `${r[name[i]].map(word => `\`${word}\``)}`.replace(/\n/g, '') : msg.language.none : msg.language.none);
						m.edit(endEmbed).catch(() => {});
						const index = msg.args.indexOf(msg.language.edit);
						msg.args.splice(index, 1);
						msg.m = m;
						setTimeout(() => {this.exe(msg);}, 5000);
					} 
				} 
			}
		} else this.setup(msg);
	},
	async notValid(msg, m, name) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.edit.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.notValid)
			.addField(msg.language.commands.settings.valid, msg.lan2[name].answers)
			.setFooter(msg.lan.pleaseRestart);
		msg.client.ch.reply(m, embed);
	},
	async list(msg, res, answer) {
		msg.lan2 = msg.lan.list; let nr;
		answer ? nr = answer.split(/ +/)[1] : nr = msg.args[2];
		const embed = new Discord.MessageEmbed()
			.setColor(msg.client.constants.commands.settings.color)
			.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rowCount; i++) {
				if (i == nr) {
					const r = res.rows[i];
					const stopRole = msg.guild.roles.cache.get(r.stoprole);
					const separator = msg.guild.roles.cache.get(r.separator);
					const roles = [];
					if (stopRole) msg.guild.roles.cache.forEach((role) => { stopRole.rawPosition > separator.rawPosition ? separator.rawPosition < role.rawPosition && stopRole.rawPosition > role.rawPosition ? roles.push(role) : separator.rawPosition > role.rawPosition && stopRole.rawPosition < role.rawPosition ? roles.push(role) : '' : '';});
					else msg.guild.roles.cache.forEach((role) => {separator.rawPosition < role.rawPosition ? roles.push(role) : '';});
					roles.sort((a,b) => b.rawPosition - a.rawPosition);
					embed.setDescription(`**${msg.lan2.separatorRole}**: ${separator}\n**${msg.lan2.stopRole}**: ${stopRole ? stopRole : msg.language.none}\n\n**${msg.lan2.affectedRoles}**:\n${roles.map(r => ` ${r}`)}`);
				}
			}
		}
		if (nr > res.rowCount-1) embed.setDescription(msg.lan2.notExistent);
		msg.client.ch.reply(msg, embed);
	}
};

async function checker(msg, res) {
	const sepend = [];
	const stopend = [];
	res.rows.forEach(row => {
		const sep = msg.guild.roles.cache.get(row.separator);
		const stop = msg.guild.roles.cache.get(row.stoprole);
		if (!sep || !sep.id) sepend.push(row.separator);
		if (!stop || !stop.id) stopend.push(row.stoprole);	
	});
	for (const s of sepend) {await msg.client.ch.query(`DELETE FROM roleseparator WHERE guildid = '${msg.guild.id}' AND separator = '${s}';`);}
	for (const s of sepend) {await msg.client.ch.query(`DELETE FROM roleseparator WHERE guildid = '${msg.guild.id}' AND stoprole = '${s}';`);}
	if (sepend.length > 0 || stopend.length > 0) return true;
	else return false;
}