const Discord = require('discord.js');
const misc = require('./misc.js');
const setuper = require('./setup');

module.exports = {
	execute(msg, answer, file) {
		edit(msg, answer, file);
	},
	redirecter(msg, answer, AddRemoveEditView, fail, values, origin) {
		edit(msg, answer, msg.file, AddRemoveEditView, fail, values, origin);
	}
};

async function edit(msg, answer, file, AddRemoveEditView, fail, values, origin) {
	msg.lanSettings = msg.language.commands.settings; let r;
	if (!msg.file) file.name = msg.args[0].toLowerCase(), msg.file = file;
	if (!origin) {
		const res = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE guildid = $1;`, [msg.guild.id]);
		if (msg.file.setupRequired == false) return require('./multiRowManager').execute(msg, answer);
		else if (!res || res.rowCount == 0) return setuper.execute(msg, answer);
		else r = res.rows[0];
	} else r = (await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name][0]} WHERE id = $1;`, [values.id])).rows[0];
	if (msg.file.perm && !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) && msg.author.id !== '318453143476371456') return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
	if (answer) await answer.deferReply();
	const displayEmbed = typeof(msg.file.displayEmbed) == 'function' ? msg.file.displayEmbed(msg, r) : misc.noEmbed(msg);
	msg.lanSettings = msg.language.commands.settings;
	displayEmbed.setColor(msg.client.constants.commands.settings.color);
	displayEmbed.setAuthor(
		msg.client.ch.stp(msg.lanSettings.authorEdit, {type: msg.lan.type}), 
		msg.client.constants.emotes.settingsLink, 
		msg.client.constants.standard.invite
	);
	const buttons = msg.file.buttons(msg, r);
	const back = new Discord.MessageButton()
		.setLabel(msg.language.back)
		.setEmoji(msg.client.constants.emotes.back)
		.setCustomId('back')
		.setStyle('DANGER');
	if (origin) buttons.push(back);
	const actionRows = msg.client.ch.buttonRower(buttons);
	if (answer) answer.deleteReply().catch(() => {});
	if (msg.m) msg.m.edit({embeds: [displayEmbed], components: actionRows}).catch(() => {});
	else msg.m = await msg.client.ch.reply(msg, {embeds: [displayEmbed], components: actionRows});
	const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
	const messageCollector = msg.channel.createMessageCollector({time: 60000});
	buttonsCollector.on('collect', (clickButton) => {
		if (clickButton.user.id == msg.author.id) {
			if (clickButton.customId == 'back') {
				buttonsCollector.stop();
				messageCollector.stop();
				require('./multiRowManager').edit(msg, clickButton, values, AddRemoveEditView, fail);
				return;
			}
			let srmEditing;
			Object.entries(msg.lan.edit).forEach(e => {if (e[1].name == clickButton.customId) srmEditing = e;});
			if (srmEditing) {
				require('./multiRowManager').redirect(msg, 0, values, clickButton, AddRemoveEditView, fail, srmEditing, true);
				buttonsCollector.stop();
				messageCollector.stop();
			}
		} else msg.client.ch.notYours(clickButton, msg);
	});
	buttonsCollector.on('end', (collected, reason) => {if (reason == 'time') {msg.client.ch.collectorEnd(msg);}});
	messageCollector.on('collect', (message) => {
		if (message.author.id == msg.author.id && message.content.toLowerCase() == msg.language.cancel) return misc.aborted(msg, [messageCollector, buttonsCollector]);
	});
}