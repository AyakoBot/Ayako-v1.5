const Discord = require('discord.js');
const misc = require('../misc.js');

module.exports = {
	key: ['user', 'users'],
	async exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.language.select.users.select}`);
		const DANGER = new Discord.MessageButton()
			.setCustomId('back')
			.setLabel(msg.language.back)
			.setEmoji(msg.client.constants.emotes.back)
			.setStyle('DANGER');
		const rows = msg.client.ch.buttonRower([DANGER]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		let interaction;
		const resolved = await new Promise((resolve,) => {
			messageCollector.on('collect', async (message) => {
				if (message.author.id == msg.author.id) {
					if (message.content == msg.language.cancel) {
						resolve(false);
						return misc.aborted(msg, [messageCollector, buttonsCollector]);
					}
					message.delete().catch(() => {});
					const args = message.content.split(/ +/);
					let answered = [];
					await Promise.all(args.map(async raw => {
						const id = raw.replace(/\D+/g, '');
						const request = await msg.client.users.fetch(id).catch(() => {});
						if ((!request || !request.id) && (!values[msg.assigner] || (values[msg.assigner] && !values[msg.assigner].includes(id)))) fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
						else answered.push(id);
					}));
					message.delete().catch(() => {});
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
			buttonsCollector.on('collect', (clickButton) => {
				if (clickButton.user.id == msg.author.id) {
					if (clickButton.customId == 'back') {
						buttonsCollector.stop();
						messageCollector.stop();
						resolve(false);
						if (comesFromSRM) return require('../singleRowManager').redirecter(msg, clickButton, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
						else return require('../multiRowManager').edit(msg, clickButton, {});
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
		if (resolved) return ['repeater', msg, i+1, embed, values, interaction, AddRemoveEditView, fail, srmEditing, comesFromSRM];
		else return null;
	}
};