const Discord = require('discord.js');
const misc = require('./misc.js');
const fs = require('fs');

module.exports = {
	exe(msg, answer) {
		this.edit(msg, answer, {});
	},
	redirect(msg, i, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
		repeater(msg, i?i:0, null, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM);
	},
	async display(msg, answer) {
		if (!answer) await rower(msg);
		msg.client.constants.commands.settings.editReq.splice(2, 1);
		let res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE guildid = $1;`, [msg.guild.id]);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		if (res && res.rowCount > 0) {
			res.rows = res.rows.sort((a, b) => a.id - b.id);
			msg.rows = res.rows;
			if (msg.file.mmrEmbed[Symbol.toStringTag] == 'AsyncFunction') embed = await msg.file.mmrEmbed(msg, res.rows);
			else embed = typeof(msg.file.mmrEmbed) == 'function' ? msg.file.mmrEmbed(msg, res.rows) : misc.noEmbed(msg);		
		} else embed = misc.noEmbed(msg);
		embed.setAuthor(
			msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
			msg.client.constants.emotes.settingsLink,
			msg.client.constants.standard.invite
		)
			.setColor(msg.client.constants.commands.settings.color);
		const edit = new Discord.MessageButton()
			.setCustomId('edit')
			.setStyle('PRIMARY')
			.setLabel(msg.language.Edit);
		const list = new Discord.MessageButton()
			.setCustomId('list')
			.setStyle('SECONDARY')
			.setLabel(msg.language.List)
			.setDisabled(embed.fields.length > 0 ? false : true);
		let rows;
		if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) && msg.author.id !== '318453143476371456') rows = msg.client.ch.buttonRower([[list]]);
		else rows = msg.client.ch.buttonRower([[edit, list]]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else if (msg.m) msg.m.edit(msg, {embeds: [embed], components: rows}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: rows});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'edit') {
					buttonsCollector.stop();
					messageCollector.stop();
					this.edit(msg, clickButton, {});
				} else if (clickButton.customId == 'list') {
					buttonsCollector.stop();
					messageCollector.stop();
					this.list(msg, clickButton, 'view', []);
				}
			} else msg.client.ch.notYours(clickButton);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.m.edit({embeds: [embed], components: []});});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
		});
	},
	async edit(msg, answer, values, AddRemoveEditView, fail) {
		if (values && values.id) {
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1;`, [values.id]);
			if (res && res.rowCount > 0) return require('./singleRowManager').redirecter(msg, answer, AddRemoveEditView, fail, values);
		}
		msg.client.constants.commands.settings.editReq.splice(2, 1);
		msg.lanSettings = msg.language.commands.settings;
		msg.lan = msg.lanSettings[msg.file.name];
		let embed;
		await rower(msg);
		let res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE guildid = $1;`, [msg.guild.id]);
		if (res && res.rowCount > 0) {
			res.rows = res.rows.sort((a, b) => a.id - b.id);
			msg.rows = res.rows;
			if (msg.file.mmrEmbed[Symbol.toStringTag] == 'AsyncFunction') embed = await msg.file.mmrEmbed(msg, res.rows);
			else embed = typeof(msg.file.mmrEmbed) == 'function' ? msg.file.mmrEmbed(msg, res.rows) : misc.noEmbed(msg);
		}
		else embed = misc.noEmbed(msg);
		embed.setAuthor(
			msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
			msg.client.constants.emotes.settingsLink,
			msg.client.constants.standard.invite
		)
			.setDescription(`${msg.lanSettings.howToEdit3}\n\n${embed.description ? embed.description : ''}`)
			.setColor(msg.client.constants.commands.settings.color);
		const add = new Discord.MessageButton()
			.setCustomId('add')
			.setStyle('SUCCESS')
			.setLabel(msg.language.add);
		const remove = new Discord.MessageButton()
			.setCustomId('remove')
			.setStyle('DANGER')
			.setLabel(msg.language.remove)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const list = new Discord.MessageButton()
			.setCustomId('list')
			.setStyle('SECONDARY')
			.setLabel(msg.language.List)
			.setDisabled(embed.fields.length > 0 ? false : true);
		const row = msg.client.ch.buttonRower([[add, remove, list]]);
		if (answer) answer.update({embeds: [embed], components: row}).catch(() => {});
		else if (msg.m) msg.m.edit({embeds: [embed], components: row}).catch(() => {});
		else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: row});
		if (!msg.m) return;
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
		buttonsCollector.on('collect', (clickButton) => {
			if (clickButton.user.id == msg.author.id) {
				if (clickButton.customId == 'add') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, 'add');
				} else if (clickButton.customId == 'remove') {
					CollectorEnder([buttonsCollector, messageCollector]);
					repeater(msg, 0, null, {}, clickButton, 'remove');
				} else if (clickButton.customId == 'list') {
					CollectorEnder([buttonsCollector, messageCollector]);
					this.list(msg, clickButton, 'edit', []);
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.client.ch.collectorEnd(msg);});
	},
	async list(msg, answer, AddRemoveEditView, fail) {
		let r = [], answered = [], values = {};
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE guildid = $1;`, [msg.guild.id]);
		if (res && res.rowCount > 0) r = res.rows;
		else return misc.aborted(msg);
		const options = [];
		for (let j = 0; j < r.length; j++) {
			options.push({label: `${msg.language.number}: ${r[j].id} | ${r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent] ? `${Array.isArray(r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent]) ? `${r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent][0]} ${Array.isArray(r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent]) && r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent] > 1 ? `+ ${r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent].length}` : ''}` : r[j][msg.client.constants.commands.settings.setupQueries[msg.file.name].removeIdent]}` : ''}`, value: `${r[j].id}`});
		}
		const take = [];
		for(let j = 0; j < options.length; j++) {take.push(options[j]);}
		const menu = new Discord.MessageSelectMenu()
			.setCustomId('id')
			.addOptions(take)
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder(msg.language.select.id.select);
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
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`1/${Math.ceil(options.length / 25)}\``);
		const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
		if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
		else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
		const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
		const messageCollector = msg.channel.createMessageCollector({time: 60000});
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
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					clickButton.customId == 'next' ? page++ : page--;
					const menu = new Discord.MessageSelectMenu()
						.setCustomId('id')
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(1)
						.setPlaceholder(msg.language.select.id.select);
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
						.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``);
					if (answered.length > 0) embed.addField(msg.language.selected, `${answered}`);
					if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
					else next.setDisabled(false);
					if (page > 1) prev.setDisabled(false);
					else prev.setDisabled(true);
					const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
					clickButton.update({embeds: [embed], components: rows}).catch(() => {});
				} else if (clickButton.customId == 'done') {
					messageCollector.stop();
					buttonsCollector.stop();
					values.id = answered;
					msg.r = msg.rows.find(r => r.id == values.id);
					gotID(values.id, clickButton, AddRemoveEditView, fail);
				} else if (clickButton.customId == 'id') {
					let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					answered = clickButton.values[0];
					const menu = new Discord.MessageSelectMenu()
						.setCustomId('id')
						.addOptions(take)
						.setMinValues(1)
						.setMaxValues(1)
						.setPlaceholder(msg.language.select.id.select);
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
					page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
							msg.client.constants.emotes.settingsLink, 
							msg.client.constants.standard.invite
						)
						.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.length / 25)}\``)
						.addField(msg.language.selected, `${answered}`);
					const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
					clickButton.update({embeds: [embed], components: rows}).catch(() => {});
				} else if (clickButton.customId == 'back') {
					messageCollector.stop();
					buttonsCollector.stop();
					if (AddRemoveEditView == 'edit') return module.exports.edit(msg, clickButton, {});
					else return module.exports.display(msg, clickButton);
				}
			} else msg.client.ch.notYours(clickButton, msg);
		});
		messageCollector.on('collect', (message) => {
			if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
		});
		buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.m.edit({embeds: [embed], components: []});});
		async function gotID(id, answer, AddRemoveEditView, fail) {
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1 AND guildid = $2;`, [id, msg.guild.id]);
			if (res && res.rowCount > 0) {
				if (AddRemoveEditView == 'edit') require('./singleRowManager').redirecter(msg, answer, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);
				else if (AddRemoveEditView == 'view') listdisplay(msg, answer, id, AddRemoveEditView, fail, values);
			}
		}
	},
};

async function listdisplay(msg, answer, id, AddRemoveEditView, fail, values) {
	let r;
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1;`, [id]);
	if (res && res.rowCount > 0) r = res.rows[0];
	let embed = typeof(msg.file.displayEmbed) == 'function' ? msg.file.displayEmbed(msg, r) : misc.noEmbed(msg);
	embed.setAuthor(
		msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
		msg.client.constants.emotes.settingsLink,
		msg.client.constants.standard.invite
	)
		.setColor(msg.client.constants.commands.settings.color);
	const edit = new Discord.MessageButton()
		.setCustomId('edit')
		.setStyle('PRIMARY')
		.setLabel(msg.language.Edit);
	const back = new Discord.MessageButton()
		.setLabel(msg.language.back)
		.setEmoji(msg.client.constants.emotes.back)
		.setCustomId('back')
		.setStyle('DANGER');
	let rows;
	if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) && msg.author.id !== '318453143476371456') rows = msg.client.ch.buttonRower([back]);
	else rows = msg.client.ch.buttonRower([edit, back]);
	if (answer) answer.update({embeds: [embed], components: rows}).catch(() => {});
	else msg.m.edit({embeds: [embed], components: rows}).catch(() => {});
	const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
	const messageCollector = msg.channel.createMessageCollector({time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			if (clickButton.customId == 'back') {
				buttonsCollector.stop();
				messageCollector.stop();
				return module.exports.display(msg, clickButton);
			} else if (clickButton.customId == 'edit') {
				buttonsCollector.stop();
				messageCollector.stop();
				return require('./singleRowManager').redirecter(msg, clickButton, 'edit', fail, values, true);
			}
		} else msg.client.ch.notYours(clickButton);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') msg.m.edit({embeds: [embed], components: []});});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
	});
}

async function repeater(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
	if (!Array.isArray(fail)) fail = new Array;
	if (typeof values !== 'object' || !values || values.lenght == 0) values = new Object;
	if (i == 0) {
		embed = new Discord.MessageEmbed()
			.setAuthor(
				msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}),
				msg.client.constants.emotes.settingsLink,
				msg.client.constants.standard.invite
			);
	}
	msg.client.constants.commands.settings.edit[msg.file.name].id = 'id';
	if (srmEditing) msg.property = Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[0] == srmEditing[0])[1];
	else msg.property = AddRemoveEditView == 'edit' ? msg.client.constants.commands.settings.editReq[i] : msg.client.constants.commands.settings.edit[msg.file.name][msg.client.constants.commands.settings.setupQueries[msg.file.name][AddRemoveEditView][i]];
	if (!msg.property && i <= msg.client.constants.commands.settings.setupQueries[msg.file.name].removeReq.length && comesFromSRM) throw new Error(
		'No Message Property defined!'+
		srmEditing !== null && srmEditing !== undefined ? `I'm searching for ${srmEditing[0]} in ${msg.client.constants.commands.settings.edit[msg.file.name]}`
			: AddRemoveEditView == 'edit' ? `I'm searching for ${msg.client.constants.commands.settings.editReq[i]} in ${JSON.stringify(msg.client.constants.commands.settings.edit[msg.file.name])}`
				: `I'm searching for ${msg.client.constants.commands.settings.setupQueries[msg.file.name][AddRemoveEditView][i]} in ${JSON.stringify(msg.client.constants.commands.settings.edit[msg.file.name])}`
	);
	if ((srmEditing && i == 0) || (!srmEditing && (AddRemoveEditView == 'edit' ? i < msg.client.constants.commands.settings.editReq.length : i < msg.client.constants.commands.settings.setupQueries[msg.file.name][AddRemoveEditView].length)) && msg.property) {
		msg.compatibilityType = msg.property.includes('s') ? msg.property : msg.property+'s';
		msg.assigner = comesFromSRM ? 
			Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[0] == srmEditing[0])[0] : 
			AddRemoveEditView == 'edit' ? 
				Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.editReq[i] || a[0] == msg.client.constants.commands.settings.editReq[i])[0] : 
				AddRemoveEditView == 'add' ? 
					Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.setupQueries[msg.file.name].add[i] || a[0] == msg.client.constants.commands.settings.setupQueries[msg.file.name].add[i])[0] : 
					Object.entries(msg.client.constants.commands.settings.edit[msg.file.name]).find(a => a[1] == msg.client.constants.commands.settings.setupQueries[msg.file.name].removeReq[i] || a[0] == msg.client.constants.commands.settings.setupQueries[msg.file.name].removeReq[i])[0];
		let answered = [];
		const files = fs.readdirSync('./Files/Commands/settings/editors').filter(file => file.endsWith('.js'));
		const editors = new Discord.Collection();
		for (const file of files) {
			const editorfile = require(`./editors/${file}`);
			editors.set(editorfile.key, editorfile);
		}
		const editor = editors.find(f => f.key.includes(msg.property));
		const returned = await editor.exe(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM, answered);
		if (Array.isArray(returned) && returned[0] == 'repeater') repeater(returned[1], returned[2], returned[3], returned[4], returned[5], returned[6], returned[7], returned[8], returned[9]);
		else return;
	} else if (['add', 'remove', 'edit'].includes(AddRemoveEditView)) {
		if (AddRemoveEditView == 'add') {
			const newSettings = {};
			Object.entries(values).forEach((arr) => {
				const name = arr[0], value = arr[1];
				newSettings[name] = value;
			});
			newSettings[msg.assigner] = values[msg.assigner];
			let valDeclaration = '';
			for (let j = 0; j < msg.client.constants.commands.settings.setupQueries[msg.file.name].vals[0].length; j++) {valDeclaration += `$${j+1}, `;}
			valDeclaration = valDeclaration.slice(0, valDeclaration.length-2);
			values.guildid = msg.guild.id;
			values.uniquetimestamp = Date.now();
			const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]};`, null);
			if (res && res.rowCount > 0) values.id = res.rowCount+1;
			else values.id = 1;
			const vals = new Array;
			for (let j = 0; j < msg.client.constants.commands.settings.setupQueries[msg.file.name].cols[0].split(/, +/).length; j++) {
				const assign = msg.client.constants.commands.settings.setupQueries[msg.file.name].vals[0][j];
				const valObj = values[msg.client.constants.commands.settings.setupQueries[msg.file.name].cols[0].split(/, +/)[j]];
				const valName = msg.client.constants.commands.settings.setupQueries[msg.file.name].cols[0].split(/, +/)[j];
				if (valObj) {
					if (Array.isArray(assign)) vals.push(valObj);
					else if (typeof assign == 'string') vals.push(msg.client.ch.stp(assign, {values: values}));
					else vals.push(assign);
				} else if (valName) vals.push(assign);
			}
			msg.client.ch.query(`INSERT INTO ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} (${msg.client.constants.commands.settings.setupQueries[msg.file.name].cols[0]}) VALUES (${valDeclaration});`, vals);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
					msg.client.constants.standard.image, msg.client.constants.standard.invite
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
			if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: []});
			setTimeout(() => {module.exports.edit(msg, null, {});}, 1000);
			misc.log(null, msg, newSettings);
		} else if (AddRemoveEditView == 'remove') {
			let oldRow, oldSettings;
			const oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1;`, [values.id]);
			if (oldRes && oldRes.rowCount > 0) {
				oldRow = oldRes.rows[0];
				oldSettings = oldRow; 
			}
			const names = [];
			const arr = fail.find(f => f.id == values.id);
			const entries = Object.entries(arr);
			const vals = [];
			entries.forEach(e => {
				if (e[1] !== null) {
					vals.push(e[1]);
					names.push(e[0]);
				} 
			});
			let nameText = '';
			for (let j = 0; j < names.length; j++) {
				if (nameText !== '') nameText += ` AND ${names[j]} = $${j+1}`;
				else nameText += `${names[j]} = $${j+1}`;
			}
			msg.client.ch.query(`DELETE FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE ${nameText};`, vals);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
					msg.client.constants.standard.image, msg.client.constants.standard.invite
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
			if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: []});
			setTimeout(() => {module.exports.edit(msg, null, {});}, 1000);
			misc.log(oldSettings, msg, null);
		} else if (AddRemoveEditView == 'edit') {
			let oldRow, oldSettings;
			const oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1;`, [values.id]);
			if (oldRes && oldRes.rowCount > 0) {
				oldRow = oldRes.rows[0];
				oldSettings = oldRow; 
			}
			const newSettings = {};
			Object.entries(oldRow).forEach((arr) => {
				const name = arr[0], value = arr[1];
				newSettings[name] = value;
			});
			newSettings[msg.assigner] = values[msg.assigner];
			if (Array.isArray(oldSettings) && oldSettings.length > 0) {
				Promise.all(oldSettings.map(id => {
					if (values[msg.assigner].includes(id)) values[msg.assigner].splice(values[msg.assigner].indexOf(id), 1);
					else values[msg.assigner].push(id);
				}));
			}
			msg.client.constants.commands.settings.editReq.splice(2, 1);
			msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE id = $2;`, [values[msg.assigner], values.id]);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
					msg.client.constants.standard.image, msg.client.constants.standard.invite
				)
				.setColor(msg.client.constants.commands.settings.color)
				.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
			if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
			else if (msg.m) msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			else msg.m = await msg.client.ch.reply(msg, {embeds: [embed], components: []});
			msg.r[msg.assigner] = values[msg.assigner];
			if (!comesFromSRM) setTimeout(() => {module.exports.edit(msg, null, {});}, 1000);
			else setTimeout(() => {require('./singleRowManager').redirecter(msg, null, AddRemoveEditView, fail, values, values.id ? 'redirecter' : null);}, 1000);
			misc.log(oldSettings, msg, newSettings);
		} else editer(msg, values, fail, answer, AddRemoveEditView, comesFromSRM);
	} else if (srmEditing && comesFromSRM) editer(msg, values, fail, answer, AddRemoveEditView, comesFromSRM);
	else if (!msg.property) throw new Error(
		'No Message Property defined!'+
		srmEditing ? `I'm searching for ${srmEditing[0]} in ${msg.client.constants.commands.settings.edit[msg.file.name]}`
			: AddRemoveEditView == 'edit' ? `I'm searching for ${msg.client.constants.commands.settings.editReq[i]} in ${msg.client.constants.commands.settings.edit[msg.file.name]}`
				: `I'm searching for ${msg.client.constants.commands.settings.setupQueries[msg.file.name][AddRemoveEditView][i]} in ${msg.client.constants.commands.settings.edit[msg.file.name]}`
	);
}

async function editer(msg, values, fail, answer, AddRemoveEditView, comesFromSRM) {
	let oldRes, oldSettings, oldRow;
	if (comesFromSRM) oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE guildid = $1;`, [msg.guild.id]);
	else oldRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1;`, [values.id]);
	if (oldRes && oldRes.rowCount > 0) {
		oldRow = oldRes.rows[0];
		oldSettings = oldRow[msg.assigner]; 
	}
	const newRow = {};
	Object.entries(oldRow).forEach((arr) => {
		const name = arr[0], value = arr[1];
		newRow[name] = value;
	});
	newRow[msg.assigner] = values[msg.assigner];
	if (Array.isArray(oldSettings) && oldSettings.length > 0) {
		Promise.all(oldSettings.map(id => {
			if (values[msg.assigner].includes(id)) values[msg.assigner].splice(values[msg.assigner].indexOf(id), 1);
			else values[msg.assigner].push(id);
		}));
	}
	const embed = new Discord.MessageEmbed()
		.setAuthor(
			msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
			msg.client.constants.standard.image, msg.client.constants.standard.invite
		)
		.setColor(msg.client.constants.commands.settings.color)
		.setDescription(msg.client.ch.stp(msg.lanSettings.done, {loading: msg.client.constants.emotes.loading}));
	if (Array.isArray(oldSettings) && oldSettings.length > 0) embed.addField(msg.lanSettings.oldValue, `${oldSettings.map(f => msg.compatibilityType == 'channels' ? ` <#${f}>` : msg.compatibilityType == 'roles' ? ` <@&${f}>` : msg.compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`)}`);
	else if (oldSettings !== null && oldSettings !== undefined) embed.addField(msg.lanSettings.oldValue, `${oldSettings}`);
	else embed.addField(msg.lanSettings.oldValue, msg.language.none);
	if (Array.isArray(values[msg.assigner]) && values[msg.assigner].length > 0) embed.addField(msg.lanSettings.newValue, `${values[msg.assigner].map(f => msg.compatibilityType == 'channels' ? ` <#${f}>` : msg.compatibilityType == 'roles' ? ` <@&${f}>` : msg.compatibilityType == 'users' ? ` <@${f}>` : ` ${f}`)}`);
	else if (values[msg.assigner] !== null && values[msg.assigner] !== undefined) embed.addField(msg.lanSettings.newValue, `${Array.isArray(values[msg.assigner]) ? msg.language.none : values[msg.assigner]}`);
	else embed.addField(msg.lanSettings.newValue, msg.language.none);		
	if (fail && fail.length > 0) {
		if (Array.isArray(fail)) embed.addField(msg.language.error, `${fail.map(f => ` ${f}`)}`);
		else embed.addField(msg.language.error, fail);
	}
	if (answer) answer.update({embeds: [embed], components: []}).catch(() => {});
	else msg.m.edit({embeds: [embed], components: []}).catch(() => {});
	if (values[msg.assigner] !== undefined && values[msg.assigner] !== null) {
		if (comesFromSRM) {
			if (Array.isArray(values[msg.assigner])) {
				if (values[msg.assigner].length > 0) await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE guildid = $2;`, [values[msg.assigner], msg.guild.id]); 
				else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE guildid = $2;`, [null, msg.guild.id]); 
			} else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE guildid = $2;`, [values[msg.assigner], msg.guild.id]); 
		} else {
			if (Array.isArray(values[msg.assigner])) {
				if (values[msg.assigner].length > 0) await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE id = $2;`, [values[msg.assigner], values.id]); 
				else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE id = $2;`, [null, values.id]); 
			} else await msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET ${msg.assigner} = $1 WHERE id = $2;`, [values[msg.assigner], values.id]); 
		}
		setTimeout(() => {require('./singleRowManager').redirecter(msg, null, AddRemoveEditView, fail, values.id ? {id: values.id} : null, values.id ? 'redirecter' : null);}, 1000);
	}
	misc.log(oldRow, msg, newRow);
}

async function rower(msg) {
	const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]};`, null);
	if (!res || res.rowCount == 0) return;
	if (!res.rows[0].uniquetimestamp) return;
	res.rows = res.rows.sort((a,b) => a.uniquetimestamp - b.uniquetimestamp);
	for (let i = 0; i < res.rowCount; i++) {
		res.rows[i].id = i+1;
		msg.client.ch.query(`UPDATE ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} SET id = $1 WHERE uniquetimestamp = $2;`, [res.rows[i].id, res.rows[i].uniquetimestamp]);
	}
	return;
}

function CollectorEnder(collectors) {
	collectors.forEach((c) => {c.stop();});
}