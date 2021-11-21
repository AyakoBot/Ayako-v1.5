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
			if (r && r.punishment == 5) msg.client.emit('modBanAdd', executor, target, reason, msg);
			else if (r && r.punishment == 4) msg.client.emit('modTempbanAdd', executor, target, reason, msg, r.duration);
			else if (r && r.punishment == 3) msg.client.emit('modKickAdd', executor, target, reason, msg);
			else if (r && r.punishment == 2) msg.client.emit('modMuteAdd', executor, target, reason, msg);
			else if (r && r.punishment == 1) msg.client.emit('modTempmuteAdd', executor, target, reason, msg, r.duration);
			else {
				const higher = isHigher(existingWarns, msg.res.rows.map(r => +r.warnamount));
				if (higher) {
					const neededPunishmentWarnNr = getClosest(existingWarns, msg.res.rows.map(r => +r.warnamount));
					const r = msg.res.rows.find(r => r.warnamount == neededPunishmentWarnNr);
					if (r.punishment == 5) msg.client.emit('modBanAdd', executor, target, reason, msg);
					else if (r.punishment == 4) msg.client.emit('modTempbanAdd', executor, target, reason, msg, r.duration);
					else if (r.punishment == 3) msg.client.emit('modKickAdd', executor, target, reason, msg);
					else if (r.punishment == 2) msg.client.emit('modMuteAdd', executor, target, reason, msg);
					else if (r.punishment == 1) msg.client.emit('modTempmuteAdd', executor, target, reason, msg, r.duration);
					else msg.client.emit('modWarnAdd', executor, target, reason, msg);
				} else msg.client.emit('modWarnAdd', executor, target, reason, msg);
			}
		}
		return true;
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