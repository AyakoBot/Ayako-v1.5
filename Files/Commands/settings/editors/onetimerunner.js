const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['onetimerunner'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered) {
		const yes = new Discord.MessageButton()
			.setCustomId('yes')
			.setLabel(msg.language.Yes)
			.setStyle('SUCCESS');
		const no = new Discord.MessageButton()
			.setCustomId('no')
			.setLabel(msg.language.No)
			.setStyle('SECONDARY');
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
			.setDescription(`${msg.language.select[msg.property].select}\n\n${msg.language.select[msg.property].desc}`);
		const rows = msg.client.ch.buttonRower([[yes, no], [back]]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		let interaction;
		const resolved = await new Promise((resolve,) => {
			buttonsCollector.on('collect', async (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'yes') {
						await clickButton.deferReply();
						messageCollector.stop();
						buttonsCollector.stop();
						require('../../../Events/guildEvents/guildMemberUpdate/separator').oneTimeRunner(msg, embed, clickButton);
					} else if (clickButton.customId == 'back' || clickButton.customId == 'no') {
						msg.property = undefined;
						messageCollector.stop();
						buttonsCollector.stop();
						interaction = clickButton;
						resolve(false);
						if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return require('../multiRowManager').edit(msg, clickButton, {});					
					}
				} else msg.client.ch.notYours(clickButton, msg);
			});
			messageCollector.on('collect', async (message) => {
				if (msg.author.id == message.author.id) {
					if (message.content == msg.language.cancel) {
						resolve(false);
						return misc.aborted(msg, [messageCollector, buttonsCollector]);
					}
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