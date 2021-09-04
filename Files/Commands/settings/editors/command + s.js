const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['command', 'commands'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered) {
		const isMany = msg.property.includes('s');
		let req = msg.client.commands;
		req = req.filter((command) => (!command.thisGuildOnly || command.thisGuildOnly.includes(msg.guild.id)) && command.perm !== 0);
		req = req.map(c => c.name);
		const options = [];
		req.forEach(cmd => {
			const command = msg.client.commands.get(cmd);
			options.push({label: cmd, description: command.aliases ? `${command.aliases.map(c => ` ${c}`)}` : null, value: cmd});
		});
		const take = [];
		for(let j = 0; j < 25 && j < options.length; j++) {take.push(options[j]);}
		embed.setDescription(`${AddRemoveEditView !== 'edit' ? msg.lan.otherEdits[AddRemoveEditView].name : msg.language.select[msg.property].desc}\n${AddRemoveEditView !== 'edit' ? msg.lan.otherEdits[AddRemoveEditView].process[i] : ''}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
		const menu = new Discord.MessageSelectMenu()
			.setCustomId('cmdmenu')
			.addOptions(take)
			.setMinValues(1)
			.setMaxValues(isMany ? take.length : 1)
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
		const row = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
		if (answer) answer.update({embeds: [embed], components: row}).catch(() => {});
		else if (msg.m) msg.m.edit({embeds: [embed], components: row}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: row});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		let interaction;
		const resolved = await new Promise((resolve,) => {
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) {
					resolve(false);
					return misc.aborted(msg, [messageCollector, buttonsCollector]);
				}
			});
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'cmdmenu') {
						clickButton.values.forEach(val => {
							isMany ? answered.push(val) : answered = val;
						});
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId('cmdmenu')
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(isMany ? take.length : 1)
							.setPlaceholder(msg.language.select[msg.property].select);
						const next = new Discord.MessageButton()
							.setCustomId('next')
							.setLabel(msg.language.next)
							.setDisabled(options.length < page*25+26 ? true : false)
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
							.setDescription(`${msg.language.select[msg.property].desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
							.addField(msg.language.selected, `${isMany ? answered.map(c => ` \`${c}\``) : answered} `);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					} else if (clickButton.customId == 'back') {
						messageCollector.stop();
						buttonsCollector.stop();
						resolve(false);
						if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return require('../multiRowManager').edit(msg, clickButton, {});					
					} else if (clickButton.customId == 'done') {
						messageCollector.stop();
						buttonsCollector.stop();
						interaction = clickButton;
						values[msg.property] = answered;
						resolve(true);
					} else if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
						let indexLast; let indexFirst;
						for (let j = 0; options.length > j; j++) {
							if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length-1)].value) indexLast = j;
							if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
						}
						take.splice(0, take.length);
						if (clickButton.customId == 'next') for (let j = indexLast+1; j < indexLast+26; j++) {if (options[j]) {take.push(options[j]);}}
						if (clickButton.customId == 'prev') for (let j = indexFirst-25; j < indexFirst; j++) {if (options[j]) {take.push(options[j]);}}
						let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
						clickButton.customId == 'next' ? page++ : page--;
						const menu = new Discord.MessageSelectMenu()
							.setCustomId(msg.property)
							.addOptions(take)
							.setMinValues(1)
							.setMaxValues(isMany ? take.length : 11)
							.setPlaceholder(msg.language.select[msg.property].select);
						const next = new Discord.MessageButton()
							.setCustomId('next')
							.setLabel(msg.language.next)
							.setDisabled(options.length < page*25+26 ? true : false)
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
						if (answered.length > 0) embed.addField(msg.language.selected, `${isMany ? answered.map(c => ` \`${c}\``) : answered} `);
						if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
						else next.setDisabled(false);
						if (page > 1) prev.setDisabled(false);
						else prev.setDisabled(true);
						const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
						clickButton.update({embeds: [embed], components: rows}).catch(() => {});
					}
				} else msg.client.ch.notYours(clickButton, msg);
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