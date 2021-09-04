const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['number'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered) {
		const req = [];
		for (let i = 0; i < 9999; i++) {req.push(i);}
		const options = [];
		req.forEach(r => {
			options.push({label: `${r}`, value: `${r}`});
		});
		const take = [];
		for(let j = 0; j < 25 && j < options.length; j++) {take.push(options[j]);}
		const menu = new Discord.MessageSelectMenu()
			.setCustomId(msg.property)
			.addOptions(take)
			.setMinValues(1)
			.setMaxValues(msg.property.includes('s') ? take.length : 1)
			.setPlaceholder(msg.language.select[msg.property].select);
		const next = new Discord.MessageButton()
			.setCustomId('next')
			.setLabel(msg.language.next)
			.setDisabled(options.length < 26 ? true : false)
			.setStyle('SUCCESS');
		const prev = new Discord.MessageButton()
			.setCustomId('prev')
			.setLabel(msg.language.prev)
			.setDisabled(true)
			.setStyle('DANGER');
		const done = new Discord.MessageButton()
			.setCustomId('done')
			.setLabel(msg.language.done)
			.setDisabled(true)
			.setStyle('PRIMARY');
		const back = new Discord.MessageButton()
			.setCustomId('back')
			.setLabel(msg.language.back)
			.setEmoji(msg.client.constants.emotes.back)
			.setStyle('DANGER');
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
		const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		let interaction;
		const resolved = await new Promise((resolve,) => {
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
						let indexLast; let indexFirst;
						for (let j = 0; options.length > j; j++) {
							if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length-1)].value) indexLast = j;
							if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
						}
						take.splice(0, take.length);
						if (clickButton.customId == 'next') for (let j = indexLast+1; j < indexLast+26; j++) {if (options[j]) {take.push(options[j]);}}
						if (clickButton.customId == 'prev') for (let j = indexFirst-25; j < indexFirst; j++) {if (options[j]) {take.push(options[j]);}}
						let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
						clickButton.customId == 'next' ? page++ : page--;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(msg.property.includes('s') ? take.length : 1)
							.setPlaceholder(msg.language.select[msg.property].select);
						const next = new Discord.MessageButton()
							.setCustomId('next')
							.setLabel(msg.language.next)
							.setStyle('SUCCESS');
						const prev = new Discord.MessageButton()
							.setCustomId('prev')
							.setLabel(msg.language.prev)
							.setDisabled(page == 1 ? true : false)
							.setStyle('DANGER');
						const done = new Discord.MessageButton()
							.setCustomId('done')
							.setLabel(msg.language.done)
							.setStyle('PRIMARY');
						const back = new Discord.MessageButton()
							.setCustomId('back')
							.setLabel(msg.language.back)
							.setEmoji(msg.client.constants.emotes.back)
							.setStyle('DANGER');
						if (answered.length > 0) done.setDisabled(false);
						else done.setDisabled(true);
						const embed = new Discord.MessageEmbed()
							.setAuthor(
								msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
								msg.client.constants.emotes.settingsLink, 
								msg.client.constants.standard.invite
							)
							.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
						if (answered.length > 0) embed.addField(msg.language.selected, `${answered} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'done') {
						if (answered.length > 0) values[msg.assigner] = answered;
						messageCollector.stop('finished');
						buttonsCollector.stop('finished');
						interaction = clickButton;
						resolve(true);
					} else if (clickButton.customId == msg.property) {
						let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
						answered = clickButton.values[0];
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(msg.property.includes('s') ? take.length : 1)
							.setPlaceholder(msg.language.select[msg.property].select);
						const next = new Discord.MessageButton()
							.setCustomId('next')
							.setLabel(msg.language.next)
							.setStyle('SUCCESS');
						const prev = new Discord.MessageButton()
							.setCustomId('prev')
							.setLabel(msg.language.prev)
							.setDisabled(page == 1 ? true : false)
							.setStyle('DANGER');
						const done = new Discord.MessageButton()
							.setCustomId('done')
							.setLabel(msg.language.done)
							.setStyle('PRIMARY');
						const back = new Discord.MessageButton()
							.setCustomId('back')
							.setLabel(msg.language.back)
							.setEmoji(msg.client.constants.emotes.back)
							.setStyle('DANGER');
						if (answered.length > 0) done.setDisabled(false);
						else done.setDisabled(true);
						page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
						const embed = new Discord.MessageEmbed()
							.setAuthor(
								msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
								msg.client.constants.emotes.settingsLink, 
								msg.client.constants.standard.invite
							)
							.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						msg.property = undefined;
						messageCollector.stop();
						buttonsCollector.stop();
						interaction = clickButton;
						resolve(false);
						if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return require('../multiRowManager').edit(msg, clickButton, {});					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) {
						resolve(false);
						return misc.aborted(msg, [messageCollector, buttonsCollector]);
					}
					message.delete().catch(() => {});
					if (isNaN(parseInt(message.content))) {
						resolve(false);
						return misc.notValid(msg);
					}
					answered = message.content.replace(/\D+/g, '').split(/ +/);
					if (answered.length > 0) {
						if (Array.isArray(answered)) {
							answered.forEach(id => { 
								if (values[msg.assigner] && values[msg.assigner].includes(id)) {
									const index = values[msg.assigner].indexOf(id);
									values[msg.assigner].splice(index, 1);
								} else if (values[msg.assigner] && values[msg.assigner].length > 0) values[msg.assigner].push(id);
								else values[msg.assigner] = [id];
							});
						} else values[msg.assigner] = answered;	
					}
					messageCollector.stop();
					buttonsCollector.stop();
					resolve(true);
				}
			});
			buttonsCollector.on('end', (collected, reason) => {
				if (reason == 'time') {
					msg.client.ch.collectorEnd(msg);
					resolve(false);
				}
			});	
		});
		if (resolved) return ['repeater', msg, i+1, embed, values, interaction, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered];
		else return null;
	}
};