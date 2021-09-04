const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['string'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.lan.edit[msg.assigner].answers}\n${msg.lan.edit[msg.assigner].recommended}`);
		const button = new Discord.MessageButton()
			.setCustomId('back')
			.setLabel(msg.language.back)
			.setEmoji(msg.client.constants.emotes.back)
			.setStyle('DANGER');
		const rows = msg.client.ch.buttonRower([button]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});				
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		let interaction;
		const resolved = await new Promise((resolve,) => {
			messageCollector.on('collect', (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
					messageCollector.stop();
					buttonsCollector.stop();
					message.delete().catch(() => {});
					if (srmEditing[0] == 'words') {
						const answered = message.content.toLowerCase().split(/#+/);
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
					} else {
						const answered = message.content;
						values[msg.assigner] = answered;
					}
					resolve(true);
				}
			});
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'back') {
						buttonsCollector.stop();
						messageCollector.stop();
						interaction = clickButton;
						resolve(false);
						if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return require('../multiRowManager').edit(msg, clickButton, {});					
					}
				} else msg.client.ch.notYours(clickButton);
			});
			buttonsCollector.on('end', (collected, reason) => {
				if (reason == 'time') {
					msg.client.ch.collectorEnd(msg);
					resolve(false);
				}
			});
		});
		if (resolved) return ['repeater', msg, i+1, embed, values, interaction, AddRemoveEditView, fail, srmEditing, comesFromSRM];
		else return null;
	}
};