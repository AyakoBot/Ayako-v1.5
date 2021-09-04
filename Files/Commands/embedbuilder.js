const Discord = require('discord.js');

module.exports = {
	name: 'embedbuilder',
	perm: 2048n,
	dm: true,
	takesFirstArg: false,
	aliases: ['eb'],
	async exe(msg) {
		const embed = await this.builder(msg);
		msg.client.ch.reply(msg, embed);
	},
	async builder(msg, answer) {
		msg.lang = msg.language.embedBuilder;
		msg.lanEmbed = msg.lang.embed;
		const allButtons = msg.client.ch.buttonRower(
			[
				[
					{custom_id: msg.lanEmbed.title.title, disabled: false, emoji: null, label: msg.lanEmbed.title.title, style: 2, type: 2, url: null},
					{custom_id: msg.lanEmbed.author.author, disabled: false, emoji: null, label: msg.lanEmbed.author.author, style: 2, type: 2, url: null},
					{custom_id: msg.lanEmbed.thumbnail.thumbnail, disabled: false, emoji: null, label: msg.lanEmbed.thumbnail.thumbnail, style: 2, type: 2, url: null},
				],
				[
					{custom_id: msg.lanEmbed.description.description, disabled: false, emoji: null, label: msg.lanEmbed.description.description, style: 2, type: 2, url: null},
					{custom_id: msg.lanEmbed.color.color, disabled: false, emoji: null, label: msg.lanEmbed.color.color, style: 2, type: 2, url: null},
					{custom_id: msg.lanEmbed.image.image, disabled: false, emoji: null, label: msg.lanEmbed.image.image, style: 2, type: 2, url: null},
					{custom_id: msg.lanEmbed.field.field, disabled: false, emoji: null, label: msg.lanEmbed.field.field, style: 2, type: 2, url: null},
				],
				[
					{custom_id: msg.lanEmbed.footer.footer, disabled: false, emoji: null, label: msg.lanEmbed.footer.footer, style: 2, type: 2, url: null},
					{custom_id: msg.lanEmbed.timestamp.timestamp, disabled: false, emoji: null, label: msg.lanEmbed.timestamp.timestamp, style: 2, type: 2, url: null},
				]
			]
		);
		const FinishedEmbed = new Discord.MessageEmbed().setDescription(msg.lang.placeholder);
		repeater();
		async function repeater() {
			const SettingsEmbed = new Discord.MessageEmbed()
				.setColor(msg.client.constants.commands.settings.color)
				.setAuthor(
					msg.lang.author, 
					msg.client.constants.emotes.settingsLink, 
					msg.client.constants.standard.invite
				)
				.setDescription(msg.lang.decide);
			if (answer) answer.update({embeds: [FinishedEmbed, SettingsEmbed], components: allButtons});
			else if (msg.m) msg.client.ch.reply(msg, {embeds: [FinishedEmbed, SettingsEmbed], components: allButtons});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [FinishedEmbed, SettingsEmbed], components: allButtons});
			const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
			const messageCollector = msg.channel.createMessageCollector({time: 60000});
			let editing;
			const promise = await new Promise((resolve,) => {
				buttonsCollector.on('collect', (clickButton) => {
					if (clickButton.user.id == msg.author.id)  {
						editing = clickButton.customId;
						buttonsCollector.stop();
						messageCollector.stop();
						answer = clickButton;
						resolve(true);
					} else msg.client.ch.notYours(clickButton, msg);
				});
				buttonsCollector.on('end', (collected, reason) => {
					if (reason == 'time') {
						resolve(false);
						msg.client.ch.collectorEnd(msg);
					}
				});
				messageCollector.on('collect', (message) => {
					if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return msg.client.ch.aborted(msg, [messageCollector, buttonsCollector]);
				});
			});
			if (!promise) return msg.client.ch.aborted(msg);
			editing = Object.entries(msg.language.embedBuilder.embed).find(a => Object.entries(a[1])[0][1] == editing)[1];
			if (editing) {
				if (Object.entries(editing).length > 1) {
					const Buttons = [];
					Object.entries(editing).forEach(e => {
						if (e[0] !== e[1].toLowerCase()) Buttons.push({custom_id: e[1], disabled: false, emoji: null, label: e[1], style: 2, type: 2, url: null});
					});
					const Buttons2 = msg.client.ch.buttonRower([Buttons]);
					const SettingsEmbed = new Discord.MessageEmbed()
						.setColor(msg.client.constants.commands.settings.color)
						.setAuthor(
							msg.lang.author, 
							msg.client.constants.emotes.settingsLink, 
							msg.client.constants.standard.invite
						)
						.setDescription(Object.entries(editing)[0][1]+'\n'+msg.lang.decide);
					if (answer) answer.update({embeds: [FinishedEmbed, SettingsEmbed], components: Buttons2});
					else if (msg.m) msg.client.ch.reply(msg, {embeds: [FinishedEmbed, SettingsEmbed], components: Buttons2});
					else msg.m = await msg.client.ch.reply(msg, {embeds: [FinishedEmbed, SettingsEmbed], components: Buttons2});
					const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
					const messageCollector = msg.channel.createMessageCollector({time: 60000});
					let editing2;
					const promise = await new Promise((resolve,) => {
						buttonsCollector.on('collect', (clickButton) => {
							if (clickButton.user.id == msg.author.id)  {
								editing2 = clickButton.customId;
								buttonsCollector.stop();
								messageCollector.stop();
								resolve(true);
							} else msg.client.ch.notYours(clickButton, msg);
						});
						buttonsCollector.on('end', (collected, reason) => {
							if (reason == 'time') {
								resolve(false);
								msg.client.ch.collectorEnd(msg);
							}
						});
						messageCollector.on('collect', (message) => {
							if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return msg.client.ch.aborted(msg, [messageCollector, buttonsCollector]);
						});
					});
					if (!promise) return msg.client.ch.aborted(msg);
					console.log(typeof editing2)

					editing2 = Object.entries(editing).find(a => a[1] == editing2);
					console.log(editing)

				}
				//console.log(editing)
				if (!Array.isArray(editing)) editing = Object.entries(editing)[0];
				const type = msg.client.constants.embedBuilder.embed[editing[0]];
				const Name = editing[1];
				const value = null

			}

		}


		return FinishedEmbed;

	}
};
