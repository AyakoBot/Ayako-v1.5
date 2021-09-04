const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');
const antiraidSettings = {
	maxInterval: 15000,
	banThreshold: 10
};
const cache = new Discord.Collection();

module.exports = {
	async execute(member, user) {
		cache.map(o => o).forEach(o => {
			o.joined.forEach(join => {
				if (Date.now() - join.join > antiraidSettings.maxInterval) cache.get(o.guild, {guild: o.guild, joined: cache.get(o.guild.id).joined.splice(cache.get(o.guild.id).joined.indexOf(join.id), 1)});	
			});
			if (o.joined.length == 0) cache.delete(o.guild);
		});
		if (user.id == member.client.user.id) return;
		if (user.bot) return;
		if (user.flags && user.flags.bitfield !== 0) return;
		const res = await member.client.ch.query('SELECT * FROM antiraidsettings WHERE guildid = $1 AND active = $2;', [member.guild.id, true]);
		if (!res || res.rowCount == 0) return;
		if (cache.get(member.guild.id)) cache.get(member.guild.id).joined.push({id: user.id, join: member.joinedTimestamp, guild: member.guild.id});
		else {
			cache.set(member.guild.id, {
				guild: member.guild,
				joined: [{id: user.id, join: member.joinedTimestamp, guild: member.guild.id}]
			});
		}
		const joined = cache.get(member.guild.id).joined.filter(member => Date.now() - member.join < antiraidSettings.maxInterval);
		console.log(2, joined,cache);
		if (joined.length >= antiraidSettings.banThreshold) await require('../../readyEvents/antiraidBanAdd').add(joined);
		return;
	},
	resetData() {
		client.AntiRaidCache = new Discord.Collection();
	}
};

