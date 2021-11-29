const Discord = require('discord.js');

module.exports = {
	name: 'selfroles',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: ['im', 'iam', 'iamn', 'iamnot', 'lsar', 'imn'],
	type: 'roles',
	async execute(msg, answer) {
		const res = await msg.client.ch.query('SELECT * FROM selfroles WHERE guildid = $1 AND active = true;', [msg.guild.id]);
		
		const embed = new Discord.MessageEmbed();
		embed
			.setColor(msg.client.ch.colorSelector(msg.guild.me))
			.setAuthor(
				msg.lan.author,
				null,
				msg.client.constants.standard.invite
			);

		const options = [];

		if (res && res.rowCount > 0) {
			for (const thisrow of res.rows) {
				const roles = thisrow.roles.map((role) => msg.guild.roles.cache.get(role) ? msg.guild.roles.cache.get(role) : null).filter((role) => !!role);
				if (roles.length > 0) {
					embed.addField(`${thisrow.name}`, `${roles.length} ${msg.language.roles}`, true);
					
					let disabled = false;

					!disabled ? 
						thisrow.blacklistedroles?.forEach((id) => {
							msg.member.roles.cache.find(r => r.id == id) ? disabled = true : null;
						})
						: null;

					!disabled ? 
						thisrow.blacklistedusers?.forEach((id) => {
							msg.author.id == id ? disabled = true : null;
						})
						: null;

					!disabled ? 
						thisrow.roles?.forEach((id) => {
							msg.member.roles.cache.find(r => r.id == id) && thisrow.onlyone ? disabled = true : null;
						})
						: null;


					disabled ? 
						thisrow.whitelistedroles?.forEach((id) => {
							msg.member.roles.cache.find(r => r.id == id) ? disabled = false : null;
						})
						: null;

					disabled ? 
						thisrow.whitelistedusers?.forEach((id) => {
							msg.author.id == id ? disabled = false : null;
						})
						: null;

					options.push({ 
						label: `${msg.language.add} ${thisrow.name}`, 
						value: thisrow.uniquetimestamp, 
						emoji: disabled ? msg.client.constants.emotes.lock : null, 
						description: disabled ? msg.lan.disabled : null
					});
				}
			}
		}


		const next = new Discord.MessageButton()
			.setCustomId('next')
			.setLabel(msg.language.next)
			.setDisabled(options.length < 25 ? true : false)
			.setStyle('SUCCESS');
		const prev = new Discord.MessageButton()
			.setCustomId('prev')
			.setLabel(msg.language.prev)
			.setDisabled(true)
			.setStyle('DANGER');

		const take = [];
		for (let j = 0; j < 25 && j < options.length; j++) take.push(options[j]);

		embed.setDescription(`${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);

		const menu = new Discord.MessageSelectMenu()
			.setCustomId('categoryMenu')
			.addOptions(take)
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder(msg.language.select.selfroles.select);

		const rows = msg.client.ch.buttonRower([[menu], [prev, next]]);
		if (answer) answer.reply({ embeds: [embed], components: rows });
		else if (msg.m) msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });
		else msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });

		const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
		buttonsCollector.on('collect', (clickButton) => {
			let answered = [];
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
					let indexLast, indexFirst;
					for (let j = 0; options.length > j; j++) {
						if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length - 1)].value) indexLast = j;
						if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
					}
					take.splice(0, take.length);
					if (clickButton.customId == 'next') for (let j = indexLast + 1; j < indexLast + 26; j++) if (options[j]) take.push(options[j]);
					if (clickButton.customId == 'prev') for (let j = indexFirst - 25; j < indexFirst; j++) if (options[j]) take.push(options[j]);
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					clickButton.customId == 'next' ? page++ : page--;
					const categoryMenu = new Discord.MessageSelectMenu()
						.setCustomId('categoryMenu')
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(1)
						.setPlaceholder(msg.language.select.selfroles.select);
					const next = new Discord.MessageButton()
						.setCustomId('next')
						.setLabel(msg.language.next)
						.setDisabled(options.length < page * 25 + 26 ? true : false)
						.setStyle('SUCCESS');
					const prev = new Discord.MessageButton()
						.setCustomId('prev')
						.setLabel(msg.language.prev)
						.setDisabled(page == 1 ? true : false)
						.setStyle('DANGER');
					const back = new Discord.MessageButton()
						.setCustomId('back')
						.setLabel(msg.language.back)
						.setEmoji(msg.client.constants.emotes.back)
						.setStyle('DANGER');
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							msg.lan.author,
							null,
							msg.client.constants.standard.invite
						)
						.setDescription(`${msg.language.select.selfroles.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
					if (answered.length > 0) embed.addField(msg.language.selected, `${answered}`);
					if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
					else next.setDisabled(false);
					if (page > 1) prev.setDisabled(false);
					else prev.setDisabled(true);
					const rows = msg.client.ch.buttonRower([[categoryMenu], [prev, next], [back]]);
					clickButton.update({ embeds: [embed], components: rows }).catch(() => { });
				} else if (clickButton.customId == 'categoryMenu') {
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					answered = clickButton.values[0];

					const row = res.rows[res.rows.findIndex((r) => r.uniquetimestamp == clickButton.values[0])];
					const roles = roleGetter(row);

					const categoryMenu = new Discord.MessageSelectMenu()
						.setCustomId('categoryMenu')
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(1)
						.setPlaceholder(msg.language.select.selfroles.select);
					const roleMenu = new Discord.MessageSelectMenu()
						.setCustomId('roleMenu')
						.addOptions(roles.map(r => `${r}`).join(', '))
						.setMinValues(1)
						.setMaxValues(row.onlyone ? 1 : roles.length)
						.setPlaceholder(msg.language.select.selfroles.select);
					const next = new Discord.MessageButton()
						.setCustomId('next')
						.setLabel(msg.language.next)
						.setDisabled(options.length < page * 25 + 26 ? true : false)
						.setStyle('SUCCESS');
					const prev = new Discord.MessageButton()
						.setCustomId('prev')
						.setLabel(msg.language.prev)
						.setDisabled(page == 1 ? true : false)
						.setStyle('DANGER');
					const back = new Discord.MessageButton()
						.setCustomId('back')
						.setLabel(msg.language.back)
						.setEmoji(msg.client.constants.emotes.back)
						.setStyle('DANGER');
					page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							msg.lan.author,
							null,
							msg.client.constants.standard.invite
						)
						.setDescription(`${msg.language.select.selfroles.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
					const rows = msg.client.ch.buttonRower([[categoryMenu], [roleMenu], [prev, next], [back]]);
					clickButton.update({ embeds: [embed], components: rows }).catch(() => { });
				} else if (clickButton.customId == 'back') {
					buttonsCollector.stop();
					this.execute(msg, clickButton);
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});

		buttonsCollector.on('end', (collected, reason) => { if (reason == 'time') msg.m.edit({ embeds: [embed], components: [] }); });

		const roleGetter = (row) => { 
			const roles = [];
			row.roles
				.map(r => msg.guild.roles.cache.get(r) ? msg.guild.roles.cache.get(r) : null)
				.filter(r => !!r)
				.forEach((r) => { 
					const obj = {
						has: msg.member.roles.cache.has(r.id) ? true : false,
						role: r
					};
					roles.push(obj);
				});
			return roles;
		};

	}
};