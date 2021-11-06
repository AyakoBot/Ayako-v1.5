const Discord = require('discord.js');

module.exports = {
	name: 'check',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		const user = msg.args[0] ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')) : msg.author;
		if (!user) return msg.client.ch.reply(msg, msg.language.noUser);
		const lan = msg.lan;
		const con = msg.client.constants.commands[this.name];
		msg.con = con;

		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(lan.author, { target: user }), con.author.image, con.author.url)
			.addField(lan.banLoad, msg.client.constants.emotes.loading);

		let warns = 0;
		let mutes = 0;
		const options = {warns: new Array, mutes: new Array};

		const res = await msg.client.ch.query('SELECT *, ROW_NUMBER() OVER () FROM warns WHERE userid = $1;', [user.id]);
		if (res && res.rowCount > 0) {
			if (res.rows.filter(row => row.type == 'Warn').length > 0) warns = res.rows.filter(row => row.type == 'Warn').length;
			if (res.rows.filter(row => row.type == 'Mute').length > 0) mutes = res.rows.filter(row => row.type == 'Mute').length;
			res.rows.forEach(r => {
				const dateOfWarn = new Date(new Number(r.dateofwarn));
				if (r.type == 'Warn') options.warns.push({ label: `${msg.language.number}: ${r.row_number} | ${dateOfWarn.getDate()} ${msg.language.months[dateOfWarn.getMonth()]} ${dateOfWarn.getFullYear()}`, value: r.row_number });
				if (r.type == 'Mute') options.warns.push({ label: `${msg.language.number}: ${r.row_number} | ${dateOfWarn.getDate()} ${msg.language.months[dateOfWarn.getMonth()]} ${dateOfWarn.getFullYear()}`, value: r.row_number });
			});
		}
		const take = {warns: new Array, mutes: new Array};
		for (let j = 0; j < 25 && j < options.warns.length; j++) take.warns.push(options.warns[j]);
		for (let j = 0; j < 25 && j < options.mutes.length; j++) take.mutes.push(options.mutes[j]);

		embed.setDescription(`${msg.client.ch.stp(lan.text, { warns: `${warns}`, mutes: `${mutes}` })}`);

		console.log(buttonOrder(take, msg, options, { mutes: [], warns: [] })[2]);

		msg.m = await msg.client.ch.reply(msg, { 
			embeds: [embed], 
			components: buttonOrder(take, msg, options, { mutes: [], warns: [] })
		});

		buttonHandler(msg, options, take, user);

		const ban = await msg.guild.bans.fetch(user.id).catch(() => { });
		embed.fields = [];
		if (ban && ban.guild) embed.addField(msg.client.ch.stp(lan.banned, { target: user }), `${msg.language.reason}: \`\`\`${ban.reason}\`\`\``);
		else embed.addField('\u200b', `**${msg.client.ch.stp(lan.notbanned, { target: user })}**`);
		msg.m.edit({embeds: [embed]});
	}
};

function buttonHandler(msg, options, take, user) {
	const collector = msg.m.createMessageComponentCollector({ time: 60000 });
	const answered = {mutes: [], warns: []};
	collector.on('collected', (clickButton) => {
		if (clickButton.customId == 'muteNext' || clickButton.customId == 'mutePrev') {
			let indexLast; let indexFirst;
			for (let j = 0; options.mutes.length > j; j++) {
				if (options.mutes[j] && options.mutes[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length - 1)].value) indexLast = j;
				if (options.mutes[j] && options.mutes[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
			}
			take.mutes.splice(0, take.mutes.length);
			if (clickButton.customId == 'muteNext') for (let j = indexLast + 1; j < indexLast + 26; j++) if (options[j]) take.mutes.push(options[j]); 
			if (clickButton.customId == 'mutePrev') for (let j = indexFirst - 25; j < indexFirst; j++) if (options[j]) take.mutes.push(options[j]); 
			let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
			clickButton.customId == 'muteNext' ? page++ : page--;
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(msg.lan.author, { target: user }), msg.con.author.image, msg.con.author.url)
				.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.mutes.length / 25)}\``);
			if (answered.mutes.length > 0) embed.addField(msg.language.selected, `${msg.lan.mutes}: ${answered.mutes}`);
			clickButton.update({ embeds: [embed], components: buttonOrder(take, msg, options, answered, page, null) }).catch(() => { });


		} else if (clickButton.customId == 'warnNext' || clickButton.customId == 'warnPrev') {
			let indexLast; let indexFirst;
			for (let j = 0; options.warns.length > j; j++) {
				if (options.warns[j] && options.warns[j].value == clickButton.message.components[0].components[0].options[(clickButton.message.components[0].components[0].options.length - 1)].value) indexLast = j;
				if (options.warns[j] && options.warns[j].value == clickButton.message.components[0].components[0].options[0].value) indexFirst = j;
			}
			take.warns.splice(0, take.warns.length);
			if (clickButton.customId == 'warnNext') for (let j = indexLast + 1; j < indexLast + 26; j++) if (options[j]) take.warns.push(options[j]);
			if (clickButton.customId == 'warnPrev') for (let j = indexFirst - 25; j < indexFirst; j++) if (options[j]) take.warns.push(options[j]);
			let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
			clickButton.customId == 'warnNext' ? page++ : page--;
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(msg.lan.author, { target: user }), msg.con.author.image, msg.con.author.url)
				.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.warns.length / 25)}\``);

			if (answered.warns.length > 0) embed.addField(msg.language.selected, `${msg.lan.warns}: ${answered.warns}`);
			clickButton.update({ embeds: [embed], components: buttonOrder(take, msg, options, answered, null, page) }).catch(() => { });

		} else if (clickButton.customId == 'muteMenu') {
			clickButton.values.forEach(val => {
				if (!answered.includes(val)) answered.push(val);
				else answered.splice(answered.indexOf(val), 1);
			});
			let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(msg.lan.author, { target: user }), msg.con.author.image, msg.con.author.url)
				.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.mutes.length / 25)}\``)
				.addField(msg.language.selected, `${msg.lan.mutes}: ${answered.mutes}`);
			
			clickButton.update({ embeds: [embed], components: buttonOrder(take, msg, options, answered, page, null) }).catch(() => { });
		} else if (clickButton.customId == 'warnMenu') {
			clickButton.values.forEach(val => {
				if (!answered.includes(val)) answered.push(val);
				else answered.splice(answered.indexOf(val), 1);
			});
			let page = clickButton.message.embeds[0].description ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0] : 0;
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.client.ch.stp(msg.lan.author, { target: user }), msg.con.author.image, msg.con.author.url)
				.setDescription(`${msg.language.select.id.desc}\n${msg.language.page}: \`${page}/${Math.ceil(+options.warns.length / 25)}\``)
				.addField(msg.language.selected, `${msg.lan.warns}: ${answered.warns}`);

			clickButton.update({ embeds: [embed], components: buttonOrder(take, msg, options, answered, null, page) }).catch(() => { });
		} else if (clickButton.customId == 'done') {
			if (answered.length > 0) {
				end(answered);
			}
			collector.stop('finished');

		}

	});
	collector.on('end', (collected, reason) => {
		if (reason == 'time') msg.m.edit({embeds: msg.m.embeds, components: []});
	});
}
 
function end() {

}

function buttonOrder(take, msg, options, answered, mutePage, warnPage) {
	const rawRows = [];
	if (take.mutes.length > 0) {
		const muteMenu = new Discord.MessageSelectMenu()
			.setCustomId('muteMenu')
			.addOptions(take.mutes)
			.setMinValues(1)
			.setMaxValues(take.mutes.length)
			.setPlaceholder(msg.lan.selMutes);
		const muteNext = new Discord.MessageButton()
			.setCustomId('muteNext')
			.setLabel(msg.language.next)
			.setDisabled(options.mutes.length < mutePage * 25 + 26 ? true : false)
			.setStyle('SUCCESS');
		const mutePrev = new Discord.MessageButton()
			.setCustomId('mutePrev')
			.setLabel(msg.language.prev)
			.setDisabled(mutePage == 1 ? true : false)
			.setStyle('DANGER');
		rawRows.push([muteMenu], [mutePrev, muteNext]);
		if (mutePage >= Math.ceil(+options.mutes.length / 25)) muteNext.setDisabled(true);
		else muteNext.setDisabled(false);
		if (mutePage > 1) mutePrev.setDisabled(false);
		else mutePrev.setDisabled(true);
	}
	if (take.warns.length > 0) {
		const warnMenu = new Discord.MessageSelectMenu()
			.setCustomId('warnMenu')
			.addOptions(take.warns)
			.setMinValues(1)
			.setMaxValues(take.warns.length)
			.setPlaceholder(msg.lan.selWarns);
		const warnNext = new Discord.MessageButton()
			.setCustomId('warnNext')
			.setLabel(msg.language.next)
			.setDisabled(options.warns.length < warnPage * 25 + 26 ? true : false)
			.setStyle('SUCCESS');
		const warnPrev = new Discord.MessageButton()
			.setCustomId('warnPrev')
			.setLabel(msg.language.prev)
			.setDisabled(warnPage == 1 ? true : false)
			.setStyle('DANGER');
		rawRows.push([warnMenu], [warnPrev, warnNext]);
		if (warnPage >= Math.ceil(+options.warns.length / 25)) warnNext.setDisabled(true);
		else warnNext.setDisabled(false);
		if (warnPage > 1) warnPrev.setDisabled(false);
		else warnPrev.setDisabled(true);
	}
	if (take.warns.length > 0 || take.mutes.length > 0) {
		const done = new Discord.MessageButton()
			.setCustomId('done')
			.setLabel(msg.language.done)
			.setStyle('DEFAULT');
		if (answered.warns.length > 0 || answered.mutes.length > 0) done.setDisabled(false);
		else done.setDisabled(true);
		rawRows.push([done]);
	}
	const rows = msg.client.ch.buttonRower(rawRows);
	return rows;
}