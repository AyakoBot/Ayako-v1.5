const Discord = require('discord.js');

module.exports = {
	perm: 268435456n,
	type: 2,
	async exe(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM autorole WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const rolecheck = await rolechecker(msg, res);
				if (rolecheck) r = (await msg.client.ch.query(`SELECT * FROM autorole WHERE guildid = '${msg.guild.id}';`)).rows[0];
				const embed = new Discord.MessageEmbed()
					.addFields(
						{name: msg.lan.autorole, value: `${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`, inline: false},
						{name: msg.lan.botRole, value: `${r.botroleid && r.botroleid !== [] ? `${r.botroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.botroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
						{name: msg.lan.userRole, value: `${r.userroleid && r.userroleid !== [] ? `${r.userroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.userroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
						{name: msg.lan.allRole, value: `${r.allroleid && r.allroleid !== [] ? `${r.allroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.allroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					)
					.setColor(msg.client.constants.commands.settings.color)
					.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix}));
				msg.m ? msg.m.edit({embeds: [embed]}) : msg.client.ch.reply(msg, embed);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) {
					const collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 30000});
					if (!collected || !collected.first()) return;
					else {
						const answer = collected.first().content.toLowerCase();
						if (answer == msg.language.edit) this.edit(msg);
					}
				}
			} else this.setup(msg);
		}
	},
	async edit(msg) {
		msg.lan2 = msg.lan.edit;
		const res = await msg.client.ch.query(`SELECT * FROM autorole WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const rolecheck = await rolechecker(msg, res);
			if (rolecheck) r = (await msg.client.ch.query(`SELECT * FROM autorole WHERE guildid = '${msg.guild.id}';`)).rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__')
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.active.name, {trigger: msg.lan2.active.trigger.includes('`') ? msg.lan2.active.trigger : msg.lan2.active.trigger.map(f => `\`${f}\``)}), value: `${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.botroleid.name, {trigger: msg.lan2.botroleid.trigger.includes('`') ? msg.lan2.botroleid.trigger : msg.lan2.botroleid.trigger.map(f => `\`${f}\``)}), value: `${r.botroleid && r.botroleid !== [] ? `${r.botroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.botroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.userroleid.name, {trigger: msg.lan2.userroleid.trigger.includes('`') ? msg.lan2.userroleid.trigger : msg.lan2.userroleid.trigger.map(f => `\`${f}\``)}), value: `${r.userroleid && r.userroleid !== [] ? `${r.userroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.userroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
					{name: msg.client.ch.stp(msg.lan2.allroleid.name, {trigger: msg.lan2.allroleid.trigger.includes('`') ? msg.lan2.allroleid.trigger : msg.lan2.allroleid.trigger.map(f => `\`${f}\``)}), value: `${r.allroleid && r.allroleid !== [] ? `${r.allroleid.map(id => ` <@&${id}>`)}`.length > 0 ? r.allroleid.map(id => ` <@&${id}>`) : msg.language.none : msg.language.none}`, inline: false},
				)
				.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setFooter(msg.lan2.howToEdit);
			const m = await msg.client.ch.reply(msg, embed);
			let collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
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
					m.edit({embeds: [editEmbed]}).catch(() => {});
					collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
					if (!collected.first()) return;
					answer = collected.first().content.toLowerCase();
					if (msg.client.constants.commands.settings.edit.autorole[name[i]] == 'boolean') {
						const boolAnswer = answer == 'true' ? true : answer == 'false' ? false : undefined;
						if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
						else {
							collected.first().delete().catch(() => {});
							const editedEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
								.addField(msg.lan.oldValue, `${r[name[i]]}`)
								.addField(msg.lan.newValue, answer);
							m.edit({embeds: [editedEmbed]}).catch(() => {});
							msg.client.ch.query(`UPDATE autorole SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							msg.m = m;
							setTimeout(() => {this.exe(msg);}, 3000);
						}
					} else if (msg.client.constants.commands.settings.edit.autorole[name[i]] == 'mention') {
						const args = answer.split(/ +/);
						const got = []; const fail = [];
						await Promise.all(args.map(async raw => {
							const id = raw.replace(/\D+/g, '');
							const request = await msg.guild.roles.fetch(id);
							if (!request || !request.id) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.no}`);
							else {
								if (request.guild !== msg.guild) fail.push(`\`${raw}\` ${msg.lan.edit[name[i]].fail.wrongGuild}`);
								else got.push(id);
							}
						}));
						collected.first().delete().catch(() => {});
						const endEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}));
						if (got.length > 0) endEmbed.addField(msg.language.finished, `${got.map(a => a)}`);
						if (fail.length > 0) endEmbed.addField(msg.language.failed, `${fail.map(a => a)}`);
						m.edit({embeds: [endEmbed]}).catch(() => {});
						if (got.length > 0) {
							got.forEach(id => { 
								if (r[name[i]] && r[name[i]].includes(id)) {
									const index = r[name[i]].indexOf(id);
									r[name[i]].splice(index, 1);
								} else if (r[name[i]] && r[name[i]].length > 0) r[name[i]].push(id);
								else r[name[i]] = [id];
							});
							if (r[name[i]].length > 0) msg.client.ch.query(`UPDATE autorole SET ${name[i]} = ARRAY[${r[name[i]]}] WHERE guildid = '${msg.guild.id}';`);
							else msg.client.ch.query(`UPDATE autorole SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							msg.m = m;
							setTimeout(() => {this.exe(msg);}, 3000);
						}
					}
				} 
			}
		} else this.setup(msg);
	},
	async setup(msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.setup.question)
			.addField(msg.language.commands.settings.valid, msg.lan.setup.answers);
		msg.m = await msg.client.ch.reply(msg, embed);
		let collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
		if (!collected.first()) return;
		const answer = collected.first().content.toLowerCase();
		if (answer == msg.language.yes) {
			await msg.client.ch.query(`INSERT INTO autorole (guildid, active) VALUES ('${msg.guild.id}', true);`);
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(msg.lan.setup.done, {loading: msg.client.constants.emotes.loading}));
			msg.m.edit({embeds: [endEmbed]}).catch(() => {});
			setTimeout(() => {this.exe(msg);}, 3000);
		} else if (answer == msg.language.no) {
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.lan.setup.abort);
			msg.m.edit({embeds: [endEmbed]}).catch(() => {});
		}
	},
	async notValid(msg, m, name) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.edit.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
			.setDescription(msg.lan.notValid)
			.addField(msg.language.commands.settings.valid, msg.lan2[name].answers)
			.setFooter(msg.lan.pleaseRestart);
		msg.client.ch.reply(m, embed);
	}
};

async function rolechecker(msg, res) {
	const r = res.rows[0];
	const answers = [];
	if (!r.botroleid || r.botroleid.length < 0) answers.push(false);
	else {
		r.botroleid.forEach((roleid) => {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role) {
				const index = r.botroleid.indexOf(roleid);
				if (index > -1) r.botroleid.splice(index, 1);
				if (r.botroleid.length == 0) msg.client.ch.query(`UPDATE autorole SET botroleid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE autorole SET botroleid = ARRAY[${r.botroleid}] WHERE guildid = '${msg.guild.id}';`);
				answers.push(true);
			} else if (role && role.id) answers.push(false);
		});
	}
	if (!r.userroleid || r.userroleid.length < 0) answers.push(false);
	else {
		r.userroleid.forEach((roleid) => {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role) {
				const index = r.userroleid.indexOf(roleid);
				if (index > -1) r.userroleid.splice(index, 1);
				if (r.userroleid.length == 0) msg.client.ch.query(`UPDATE autorole SET userroleid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE autorole SET userroleid = ARRAY[${r.userroleid}] WHERE guildid = '${msg.guild.id}';`);
				answers.push(true);
			} else if (role && role.id) answers.push(false);
		});
	}
	if (!r.allroleid || r.allroleid.length < 0) answers.push(false);
	else {
		r.allroleid.forEach((roleid) => {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role) {
				const index = r.allroleid.indexOf(roleid);
				if (index > -1) r.allroleid.splice(index, 1);
				if (r.allroleid.length == 0) msg.client.ch.query(`UPDATE autorole SET allroleid = null WHERE guildid = '${msg.guild.id}';`);
				else msg.client.ch.query(`UPDATE autorole SET allroleid = ARRAY[${r.allroleid}] WHERE guildid = '${msg.guild.id}';`);
				answers.push(true);
			} else if (role && role.id) answers.push(false);
		});
	}
}