const Discord = require('discord.js');
const Settings = require('../settings');
const misc = require('./misc');

module.exports = {
	async execute(msg, answer) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.lanSettings.setup.author, 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(msg.client.ch.stp(msg.lanSettings.setup.question, {type: msg.lan.type}))
			.addField(
				msg.language.commands.settings.valid, 
				msg.lanSettings.setup.answers
			);
		const yes = new Discord.MessageButton()
			.setCustomId('yes')
			.setLabel(msg.language.Yes)
			.setStyle('SUCCESS');
		const no = new Discord.MessageButton()
			.setCustomId('no')
			.setLabel(msg.language.No)
			.setStyle('DANGER');
		const rows = msg.client.ch.buttonRower([yes,no]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else if (msg.m) await msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: rows});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id) {
				if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
				if (message.content == msg.language.yes) yesFunc(message, null);
				else if (message.content == msg.language.no) noFunc(message, null);
				else return misc.notValid(msg);
				buttonsCollector.stop();
				messageCollector.stop();
			}
		});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'yes') yesFunc(null, clickButton);
				else if (clickButton.customId == 'no') noFunc(null, clickButton);
				else return misc.notValid(msg);
				buttonsCollector.stop();
				messageCollector.stop();
			} else msg.client.ch.notYours(clickButton, msg);
		});
		buttonsCollector.on('end', (collected, reason) => {
			if (reason == 'time') msg.client.ch.collectorEnd(msg);
		});
		async function yesFunc(message, clickButton) {
			msg.client.constants.commands.settings.setupQueries[msg.file.name].cols.forEach((names, index) => {
				const values = [], cols = names, vals = msg.client.constants.commands.settings.setupQueries[msg.file.name].vals[index];
				vals.forEach(val => {
					if (typeof(val) == 'string') values.push(msg.client.ch.stp(val, {msg: msg}));
					else values.push(val);
				});
				let valDeclaration = '';
				for (let i = 0; i < values.length; i++) valDeclaration += `$${i+1}, `;
				valDeclaration = valDeclaration.slice(0, valDeclaration.length-2);
				msg.client.ch.query(`INSERT INTO ${msg.client.constants.commands.settings.tablenames[msg.file.name][index]} (${cols}) VALUES (${valDeclaration});`, values);
			});
			if (message) message.delete().catch(() => {});
			Settings.edit(msg, msg.file, clickButton);
		}
		async function noFunc(message, clickButton) {
			if (message) message.delete().catch(() => {});
			const endEmbed = new Discord.MessageEmbed()
				.setAuthor(
					msg.lanSettings.setup.author, 
					msg.client.constants.emotes.settingsLink,
					msg.client.constants.standard.invite
				)
				.setDescription(msg.lanSettings.setup.abort);
			if (clickButton) clickButton.update({embeds: [endEmbed], components: []}).catch(() => {});
			else msg.m.edit({embeds: [endEmbed], components: []}).catch(() => {});
		}
	}
};