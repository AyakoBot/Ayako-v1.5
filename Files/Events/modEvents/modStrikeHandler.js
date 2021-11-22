const Discord = require('discord.js');

module.exports = {
	async execute(executor, target, reason, msg) {
		const lan = msg.language.mod.strike;
		const con = msg.client.constants.mod.strike;
		if (!msg.res) {
			const em = new Discord.MessageEmbed()
				.setColor(con.color)
				.setDescription(msg.client.ch.stp(lan.notEnabled, {prefix: msg.client.constants.standard.prefix}));
			return msg.client.ch.reply(msg, { embeds: [em] });
		} else {
			let existingWarns = 0;
			const res = await msg.client.ch.query('SELECT * FROM warns WHERE guildid = $1 AND userid = $2;', [msg.guild.id, target.id]);
			if (res && res.rowCount > 0) existingWarns = res.rowCount;
			const r = msg.res.rows.find(r => r.warnamount == existingWarns);
			if (r.punishment == 6) doPunishment('modWarnAdd', executor, target, reason, msg);
			else if (r.punishment == 5) doPunishment('modBanAdd', executor, target, reason, msg);
			else if (r && r.punishment == 4) doPunishment('modTempbanAdd', executor, target, reason, msg);
			else if (r && r.punishment == 3) doPunishment('modKickAdd', executor, target, reason, msg);
			else if (r && r.punishment == 2) doPunishment('modMuteAdd', executor, target, reason, msg);
			else if (r && r.punishment == 1) doPunishment('modTempmuteAdd', executor, target, reason, msg);
			else {
				const higher = isHigher(existingWarns, msg.res.rows.map(r => +r.warnamount));
				if (higher) {
					const neededPunishmentWarnNr = getClosest(existingWarns, msg.res.rows.map(r => +r.warnamount));
					const r = msg.res.rows.find(r => r.warnamount == neededPunishmentWarnNr);
					if (r.punishment == 6) doPunishment('modWarnAdd', executor, target, reason, msg);
					else if (r.punishment == 5) doPunishment('modBanAdd', executor, target, reason, msg);
					else if (r.punishment == 4) doPunishment('modTempbanAdd', executor, target, reason, msg);
					else if (r.punishment == 3) doPunishment('modKickAdd', executor, target, reason, msg);
					else if (r.punishment == 2) doPunishment('modMuteAdd', executor, target, reason, msg);
					else if (r.punishment == 1) doPunishment('modTempmuteAdd', executor, target, reason, msg);
					else doPunishment('modWarnAdd', executor, target, reason, msg);
				} else doPunishment('modWarnAdd', executor, target, reason, msg);
			}
		}
		return true;

		async function doPunishment(punishment, executor, target, reason, msg, r) {
			doRoles(r);
			if (punishment == 'modWarnAdd') msg.client.emit(punishment, executor, target, reason, msg, r.duration ? r.duration : 3600000);
			else {
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.confirmEmbed.author)
					.setDescription(msg.client.ch.stp(lan.confirmEmbed.description, { user: target, punishment: msg.language.autopunish[r.punishment] }))
					.setColor(con.confirmEmbed.color);
				const yes = new Discord.MessageButton()
					.setLabel(msg.language.Yes)
					.setStyle('primary')
					.setCustomId('yes');
				const no = new Discord.MessageButton()
					.setLabel(msg.language.No)
					.setStyle('danger')
					.setCustomId('no');
				msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: msg.client.ch.buttonRower([yes, no])});
				const agreed = await new Promise((resolve,) => {
					const buttonsCollector = msg.m.createMessageComponentCollector({time: 60000});
					buttonsCollector.on((button) => {
						if (button.user.id == msg.author.id) {
							if (button.customId == 'yes') {
								resolve(true);
							} else if (button.customId == 'no') {
								buttonsCollector.stop();
								resolve(false);
							}
						} else msg.client.ch.notYours(button, msg);
					});
					buttonsCollector.on('end', (collected, reason) => {
						if (reason == 'time') resolve(false);
					});
				});
				if (agreed) msg.client.emit(punishment, executor, target, reason, msg, r.duration ? r.duration : 3600000);
				else msg.client.emit('modWarnAdd', executor, target, reason, msg);
			} 
		}
		async function doRoles(r) {
			const member = msg.guild.members.cache.get(member.id);
			if (member) {
				if (r.addroles && r.addroles.length > 0) {
					const roles = checkRoles(r.addroles, msg.guild);
					await member.roles.add(roles, msg.language.autotypes.autopunish);
				}
				if (r.removeroles && r.removeroles.length > 0) {
					const roles = checkRoles(r.removeroles, msg.guild);
					await member.roles.remove(roles, msg.language.autotypes.autopunish);
				}
			}
		}
	}
};

function getClosest(num, arr) {
	arr = arr.reverse();
	var curr = arr[0];
	var diff = Math.abs(num - curr);
	for (var val = 0; val < arr.length; val++) {
		var newdiff = Math.abs(num - arr[val]);
		if (newdiff < diff) {
			diff = newdiff;
			curr = arr[val];
		}
	}
	return curr;
}

function isHigher(num, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (num <= arr[i]) return false;
	}
	return true;
}

function checkRoles(roles, guild) {
	roles.forEach((r, i) => {
		const role = guild.roles.cache.get(r);
		if (!role || !role.id) roles.splice(i, 1);
	});
	return roles;
}
