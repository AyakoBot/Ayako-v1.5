const Discord = require('discord.js');

module.exports = {
	name: 'selfroles',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: ['im', 'iam', 'iamn', 'iamnot', 'lsar', 'imn'],
	type: 'roles',
	async execute(msg, answer) {

		const res = await msg.client.ch.query('SELECT * FROM selfroles WHERE guildid = $1 AND active = true ORDER BY id ASC;', [msg.guild.id]);
		
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
			getFields(msg, options, res, embed);

			let disabled = false;
			let isBlacklisted = false;

			for (const thisrow of res.rows) {
				!disabled ?
					thisrow.blacklistedroles?.forEach((id) => {
						if (msg.member.roles.cache.get(id)) {
							disabled = true,
							isBlacklisted = true;
						}
					})
					: null;

				!disabled ?
					thisrow.blacklistedusers?.forEach((id) => {
						if (msg.author.id == id) {
							disabled = true;
							isBlacklisted = true;
						}
					})
					: null;

				!disabled ?
					thisrow.roles?.forEach((id) => {
						msg.member.roles.cache.find(r => r.id == id) && thisrow.onlyone ? disabled = true : null;
					})
					: null;


				disabled ?
					thisrow.whitelistedroles?.forEach((id) => {
						if (msg.member.roles.cache.find(r => r.id == id)) {
							disabled = false;
							isBlacklisted = false;
						}
					})
					: null;

				disabled ?
					thisrow.whitelistedusers?.forEach((id) => {
						if (msg.author.id == id) {
							disabled = false;
							isBlacklisted = false;
						}
					})
					: null;

				options.push({
					label: `${msg.language.add} ${thisrow.name}`,
					value: thisrow.uniquetimestamp,
					emoji: disabled ? msg.client.constants.emotes.lock : null,
					description: disabled ? msg.lan.disabled : null
				});

				thisrow.isBlacklisted = isBlacklisted;
			}
		}


		const next = new Discord.MessageButton()
			.setCustomId('nextCategory')
			.setLabel(msg.lan.nextCategory)
			.setDisabled(options.length < 25 ? true : false)
			.setStyle('SUCCESS');
		const prev = new Discord.MessageButton()
			.setCustomId('prevCategory')
			.setLabel(msg.lan.prevCategory)
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
		if (answer) {
			await answer.update({ embeds: [embed], components: rows });
			msg.m = answer.message;
		} else if (msg.m) msg.m = await msg.m.edit({ embeds: [embed], components: rows });
		else msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });

		const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
		buttonsCollector.on('collect', async (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'nextCategory' || clickButton.customId == 'prevCategory') {
					let indexLast, indexFirst;
					for (let j = 0; options.length > j; j++) {
						if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length - 1)].value) indexLast = j;
						if (options[j] && options[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
					}
					take.splice(0, take.length);
					if (clickButton.customId == 'nextCategory') for (let j = indexLast + 1; j < indexLast + 26; j++) if (options[j]) take.push(options[j]);
					if (clickButton.customId == 'prevCategory') for (let j = indexFirst - 25; j < indexFirst; j++) if (options[j]) take.push(options[j]);

					let categoryPage = clickButton.message.embeds[0].description
						&& clickButton.message.embeds[0].description.split(/`+/)[1]
						? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0]
						: 1;
					let rolePage = clickButton.message.embeds[0].description
						&& clickButton.message.embeds[0].description.split(/`+/)[3]
						? clickButton.message.embeds[0].description.split(/`+/)[3].split(/\/+/)[0]
						: 1;

					clickButton.customId == 'nextCategory' ? categoryPage++ : categoryPage--;

					const roleMenuNeeded = msg.m.embeds[0].author.title == msg.language.autotypes.selfroles 
						? true 
						: false;

					const [prevRoles, nextRoles, prevCategory, nextCategory, back] = defaultButtonGetter(msg, options, categoryPage, rolePage);
					const [categoryMenu, roleMenu, roles, row] = getMenues(msg, take, res, clickButton, null, roleMenuNeeded);

					const embed = new Discord.MessageEmbed();
					if (roleMenuNeeded) {
						embed
							.setColor(msg.client.ch.colorSelector(msg.guild.me))
							.setAuthor(
								row.name,
								null,
								msg.client.constants.standard.invite
							)
							.setDescription(`${roles.map(r => `${r.role}`).join(', ')}\n\n${msg.lan.categoryPage}: \`${categoryPage}/${Math.ceil(+options.length / 25)}\`\n${msg.lan.rolePage}: \`${rolePage}/${Math.ceil(+roles.length / 25)}\``);
					} else {
						embed
							.setColor(msg.client.ch.colorSelector(msg.guild.me))
							.setAuthor(
								msg.lan.author,
								null,
								msg.client.constants.standard.invite
							)
							.setDescription(`${msg.language.page}: \`${categoryPage}/${Math.ceil(options.length / 25)}\``);
						getFields(msg, options, res, embed);
					}

					const insertedRowsArray = [];
					if (categoryMenu) {
						insertedRowsArray.push(
							[categoryMenu], 
							[prevCategory, nextCategory]
						);
					}
					if (roleMenu) {
						insertedRowsArray.push(
							[roleMenu],
							[prevRoles, nextRoles],
							[back]
						);
					}

					const rows = msg.client.ch.buttonRower(insertedRowsArray);

					await clickButton.update({ embeds: [embed], components: rows }).catch((e) => {console.log(e);});
					if (roleMenuNeeded) msg.m.lastUnique = row.uniquetimestamp;

				} else if (clickButton.customId == 'categoryMenu') {

					let categoryPage = clickButton.message.embeds[0].description 
						&& clickButton.message.embeds[0].description.split(/`+/)[1]
						? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] 
						: 1;
					let rolePage = clickButton.message.embeds[0].description 
					&& clickButton.message.embeds[0].description.split(/`+/)[3] 
						? clickButton.message.embeds[0].description.split(/`+/)[3].split(/\/+/)[0] 
						: 1;

					const [prevRoles, nextRoles, prevCategory, nextCategory, back] = defaultButtonGetter(msg, options, categoryPage, rolePage);
					const [categoryMenu, roleMenu, roles, row] = getMenues(msg, take, res, clickButton);

					const embed = new Discord.MessageEmbed()
						.setColor(msg.client.ch.colorSelector(msg.guild.me))
						.setAuthor(
							row.name,
							null,
							msg.client.constants.standard.invite
						)
						.setDescription(`${roles.map(r => `${r.role}`).join(', ')}\n\n${msg.lan.categoryPage}: \`${categoryPage}/${Math.ceil(+options.length / 25)}\`\n${msg.lan.rolePage}: \`${rolePage}/${Math.ceil(+roles.length / 25)}\``);

					const rows = msg.client.ch.buttonRower([[categoryMenu], [prevCategory, nextCategory], [roleMenu], [prevRoles, nextRoles], [back]]);

					await clickButton.update({ embeds: [embed], components: rows }).catch(() => {});
					msg.m.lastUnique = row.uniquetimestamp;

				} else if (clickButton.customId == 'back') {
					buttonsCollector.stop();
					msg.m.lastUnique = undefined;
					this.execute(msg, clickButton);
				} else if (clickButton.customId == 'roleMenu') {

					const add = [], remove = [];
					clickButton.values.forEach((id) => {
						if (msg.member.roles.cache.has(id)) remove.push(id);
						else add.push(id);
					});

					if (add.length) await msg.member.roles.add(add, msg.language.autotypes.selfroles);
					if (remove.length) await msg.member.roles.remove(remove, msg.language.autotypes.selfroles);

					const replyEmbed = new Discord.MessageEmbed()
						.setAuthor(
							msg.lan.rolesUpdated,
							null,
							msg.client.constants.standard.invite
						)
						.setColor(msg.client.ch.colorSelector(msg.guild.me));

					if (add.length) {
						replyEmbed.addField(
							msg.lan.addedRoles, 
							add.map(r => `<@&${r}>`).join(', '),
							false
						);
					}
					if (remove.length) {
						replyEmbed.addField(
							msg.lan.removedRoles,
							remove.map(r => `<@&${r}>`).join(', '),
							false
						);
					}

					await clickButton.reply({ embeds: [replyEmbed], ephemeral: true}).catch(() => { });

					let categoryPage = clickButton.message.embeds[0].description
						&& clickButton.message.embeds[0].description.split(/`+/)[1]
						? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0]
						: 1;
					let rolePage = clickButton.message.embeds[0].description
						&& clickButton.message.embeds[0].description.split(/`+/)[3]
						? clickButton.message.embeds[0].description.split(/`+/)[3].split(/\/+/)[0]
						: 1;

					const [prevRoles, nextRoles, prevCategory, nextCategory, back] = defaultButtonGetter(msg, options, categoryPage, rolePage);
					const row = res.rows[res.rows.findIndex((r) => r.uniquetimestamp == msg.m.lastUnique)];
					const [categoryMenu, roleMenu, roles] = getMenues(msg, take, res, clickButton, row);

					const embed = new Discord.MessageEmbed()
						.setColor(msg.client.ch.colorSelector(msg.guild.me))
						.setAuthor(
							row.name,
							null,
							msg.client.constants.standard.invite
						)
						.setDescription(`${roles.map(r => `${r.role}`).join(', ')}\n\n${msg.lan.categoryPage}: \`${categoryPage}/${Math.ceil(+options.length / 25)}\`\n${msg.lan.rolePage}: \`${rolePage}/${Math.ceil(+roles.length / 25)}\``);

					const rows = msg.client.ch.buttonRower([[categoryMenu], [prevCategory, nextCategory], [roleMenu], [prevRoles, nextRoles], [back]]);

					await msg.m.edit({ embeds: [embed], components: rows }).catch(() => { });
					msg.m.lastUnique = row.uniquetimestamp;
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});

		buttonsCollector.on('end', (collected, reason) => { if (reason == 'time') msg.m.edit({ embeds: [embed], components: [] }); });

	}
};

const getFields = (msg, options, res, embed) => {
	for (const thisrow of res.rows) {
		const roles = thisrow.roles.map((role) => msg.guild.roles.cache.get(role) ? msg.guild.roles.cache.get(role) : null).filter((role) => !!role);
		if (roles.length) {
			embed.addField(`${thisrow.name}`, `${roles.length} ${msg.language.roles}`, true);
		}
	}
};


const roleGetter = (msg, row) => {
	const roles = [];
	row.roles
		.map(r => msg.guild.roles.cache.get(r) ? msg.guild.roles.cache.get(r) : null)
		.filter(r => !!r)
		.forEach((r) => {
			const obj = {
				has: msg.member.roles.cache.has(r.id) ? true : false,
				role: r,
				row: row
			};
			roles.push(obj);
		});

	roles.sort((a, b) => a.role.rawPosition - b.role.rawPosition);

	return roles;
};

const defaultButtonGetter = (msg, options, categoryPage, rolePage) => {

	const nextCategory = new Discord.MessageButton()
		.setCustomId('nextCategory')
		.setLabel(msg.lan.nextCategory)
		.setDisabled(options.length < categoryPage * 25 + 26 ? true : false)
		.setStyle('SUCCESS');

	const prevCategory = new Discord.MessageButton()
		.setCustomId('prevCategory')
		.setLabel(msg.lan.prevCategory)
		.setDisabled(categoryPage == 1 ? true : false)
		.setStyle('DANGER');

	const nextRoles = new Discord.MessageButton()
		.setCustomId('nextRoles')
		.setLabel(msg.lan.nextRoles)
		.setDisabled(options.length < rolePage * 25 + 26 ? true : false)
		.setStyle('SUCCESS');

	const prevRoles = new Discord.MessageButton()
		.setCustomId('prevRoles')
		.setLabel(msg.lan.prevRoles)
		.setDisabled(rolePage == 1 ? true : false)
		.setStyle('DANGER');

	const back = new Discord.MessageButton()
		.setCustomId('back')
		.setLabel(msg.language.back)
		.setEmoji(msg.client.constants.emotes.back)
		.setStyle('DANGER');

	return [prevRoles, nextRoles, prevCategory, nextCategory, back];
};

const getMenues = (msg, take, res, clickButton, row, roleMenuNeeded) => {

	const categoryMenu = new Discord.MessageSelectMenu()
		.setCustomId('categoryMenu')
		.addOptions(take)
		.setMinValues(1)
		.setMaxValues(1)
		.setPlaceholder(msg.language.select.selfroles.select);

	if (roleMenuNeeded) {
		const takeRoles = [];

		if (!row) row = res.rows[res.rows.findIndex((r) => r.uniquetimestamp == clickButton.values[0])];
		const allRoles = roleGetter(msg, row);
		const hasOne = msg.member.roles.cache.some((r) => row.roles.includes(r.id));

		const roles = allRoles.filter((r) => {
			if (row.onlyone && hasOne && r.has) return r;
			if (row.onlyone && hasOne && !r.has) return null;
			if (row.onlyone && !hasOne) return r;
			return allRoles;
		});

		for (let j = 0; j < 25 && j < roles.length; j++) {
			const roleObj = roles[j];
			const obj = {
				label: roleObj.role.name,
				value: roleObj.role.id,
				emoji: roleObj.has ? msg.client.constants.emotes.minusBGID : msg.client.constants.emotes.plusBGID
			};
			takeRoles.push(obj);
		}

		const takenIndex = take.findIndex((took) => took.value == clickButton.values[0]);
		if (takenIndex !== -1) {
			take.forEach((r, i) => {
				if (i == takenIndex) take[takenIndex].default = true;
				else take[i].default = false;
			});
		}

		const roleMenu = new Discord.MessageSelectMenu()
			.setCustomId('roleMenu')
			.addOptions(takeRoles)
			.setMinValues(1)
			.setMaxValues(row.onlyone ? 1 : takeRoles.length)
			.setPlaceholder(row.onlyone ? msg.language.select.role.select : msg.language.select.roles.select)
			.setDisabled(row.isBlacklisted);

		return [categoryMenu, roleMenu, allRoles, row];
	}
	return [categoryMenu, null, null, row];
};
