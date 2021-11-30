const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
	perm: 32n,
	async execute(msg) {
		const res = await msg.client.ch.query(`SELECT * FROM interactions WHERE guildid = '${msg.guild.id}';`);
		if (msg.args[1] && msg.args[1].toLowerCase() === msg.language.edit && msg.member.permissions.has(new Discord.Permissions(this.perm))) this.edit(msg);
		else {
			if (res && res.rowCount > 0) {
				let r = res.rows[0];
				const embed = new Discord.MessageEmbed()
					.setDescription('**'+msg.lan.block+'**\n'+(r.block && r.block.length ? `${r.block.map(b => ` \`${b}\``)}`.length ? `${r.block.map(b => ` \`${b}\``)}` : msg.language.none : msg.language.none))
					.addFields(
						{name: msg.lan.size, value: `${r.size ? msg.client.constants.emotes.small+' '+msg.lan.small : msg.client.constants.emotes.big+' '+msg.lan.big}`, inline: false},
					)
					.setColor(msg.client.constants.commands.settings.color)
					.setAuthor(msg.lan.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite);
				if (msg.member.permissions.has(new Discord.Permissions(this.perm))) embed.setDescription(msg.client.ch.stp(msg.lan.howToEdit, {prefix: msg.client.constants.standard.prefix})+'\n\n**'+msg.lan.block+'**\n'+(r.block && r.block.length ? `${r.block.map(b => ` \`${b}\``)}`.length ? `${r.block.map(b => ` \`${b}\``)}` : msg.language.none : msg.language.none));
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
		const res = await msg.client.ch.query(`SELECT * FROM interactions WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			let r = res.rows[0];
			const embed = new Discord.MessageEmbed()
				.setDescription('__'+msg.lan2.howToEdit+'__\n\n'+msg.client.ch.stp(msg.lan2.block.name, {trigger: msg.lan2.block.trigger.includes('`') ? msg.lan2.block.trigger : msg.lan2.block.trigger.map(f => `\`${f}\``)})+'\n'+(r.block && r.block.length ? `${r.block.map(b => ` \`${b}\``)}`.length ? `${r.block.map(b => ` \`${b}\``)}` : msg.language.none : msg.language.none))
				.addFields(
					{name: msg.client.ch.stp(msg.lan2.size.name, {trigger: msg.lan2.size.trigger.includes('`') ? msg.lan2.size.trigger : msg.lan2.size.trigger.map(f => `\`${f}\``)}), value: `${r.size ? msg.client.constants.emotes.small+' '+msg.lan.small : msg.client.constants.emotes.big+' '+msg.lan.big}`, inline: false},
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
					let collected = await msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 60000});
					if (!collected.first()) return;
					answer = collected.first().content.toLowerCase();
					if (msg.client.constants.commands.settings.edit.interactions[name[i]] == 'boolean') {
						const boolAnswer = answer == msg.lan.big ? true : answer == msg.lan.small ? false : undefined;
						if (boolAnswer == undefined) this.notValid(msg, collected.first(), name[i]);
						else {
							collected.first().delete().catch(() => {});
							const editedEmbed = new Discord.MessageEmbed()
								.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
								.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading})+'\n\n'+msg.client.ch.stp(msg.lan.edited, {edited: msg.client.ch.stp(msg.lan.edit[name[i]].name.replace(/\*/g, ''), {trigger: msg.lan.edit[name[i]].trigger.map(e => `${e}`), amount: '-'})}))
								.addField(msg.lan.oldValue, `${r[name[i]]}`)
								.addField(msg.lan.newValue, answer);
							m.edit({embeds: [editedEmbed]}).catch(() => {});
							msg.client.ch.query(`UPDATE interactions SET ${name[i]} = ${answer} WHERE guildid = '${msg.guild.id}';`);
							const index = msg.args.indexOf(msg.language.edit);
							msg.args.splice(index, 1);
							msg.m = m;
							setTimeout(() => {this.execute(msg);}, 1000);
						}
					} else if (msg.client.constants.commands.settings.edit.interactions[name[i]] == 'string') {
						const interactionFiles = fs.readdirSync('./Files/Commands/interactions').filter(file => file.endsWith('.js'));
						const interactions = new Discord.Collection();
						for (const file of interactionFiles) {
							const interactionsFile = require(`../interactions/${file}`);
							interactionsFile.name = file.replace('.js', '');
							interactions.set(interactionsFile.name, interactionsFile);
						}
						const args = answer.split(/ +/);
						const files = [];
						const newWords = [];
						args.forEach((arg) => {
							const file = interactions.get(arg) || interactions.find(cmd => cmd.aliases && cmd.aliases.includes(answer));
							if (!file) return this.notValid(msg, m, name[i]);
							else {
								files.push(file);
								if (r.block && r.block.length && r.block.includes(arg)) r.block.splice(`'${r.block.indexOf(arg)}'`, 1);
								else newWords.push(`'${arg}'`);
							}
						});
						if (files.length < 1) return this.notValid(msg, m, name[i]);
						if (r.block) for (let i = 0; i < r.block.length; i++) {if (!r.block[i].startsWith('\'') && !r.block[i].endsWith('\'')) r.block[i] = `'${r.block[i]}'`;}
						if (r.block && r.block.length) r.block = r.block.concat(newWords);
						else r.block = newWords;
						if (r.block.length) msg.client.ch.query(`UPDATE interactions SET ${name[i]} = ARRAY[${r.block}] WHERE guildid = '${msg.guild.id}';`);
						else msg.client.ch.query(`UPDATE interactions SET ${name[i]} = null WHERE guildid = '${msg.guild.id}';`);
						collected.first().delete().catch(() => {});
						const endEmbed = new Discord.MessageEmbed()
							.setAuthor(msg.lan2.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
							.setDescription(msg.client.ch.stp(msg.lan.done, {loading: msg.client.constants.emotes.loading}))								
							.addField(msg.lan.block, `${r[name[i]] && r[name[i]] !== [] ? `${r[name[i]].map(word => ` \`${word}\``)}`.length ? `${r[name[i]].map(word => `\`${word}\``)}`.replace(/\n/g, '') : msg.language.none : msg.language.none}`);
						m.edit({embeds: [endEmbed]}).catch(() => {});
						const index = msg.args.indexOf(msg.language.edit);
						msg.args.splice(index, 1);
						msg.m = m;
						setTimeout(() => {this.execute(msg);}, 1000);
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
			await msg.client.ch.query(`INSERT INTO interactions (guildid, size) VALUES ('${msg.guild.id}', true);`);
			collected.first().delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.lan.setup.author, msg.client.constants.emotes.settingsLink, msg.client.constants.standard.invite)
				.setDescription(msg.client.ch.stp(msg.lan.setup.done, {loading: msg.client.constants.emotes.loading}));
			msg.m.edit({embeds: [endEmbed]}).catch(() => {});
			setTimeout(() => {this.execute(msg);}, 1000);
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