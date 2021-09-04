module.exports = {
	execute() {
		const { client } = require('../../../BaseClient/DiscordClient');
		const ch = client.ch;
		let totalrolecount = 0;
		let totalusers = 0;
		client.guilds.cache.forEach(guild => {
			totalrolecount = totalrolecount + guild.roles.cache.size;
			if (guild.memberCount) totalusers = totalusers + guild.memberCount;
		});
		ch.query(`
		UPDATE stats SET usercount = '${client.users.cache.size}';
		UPDATE stats SET guildcount = '${client.guilds.cache.size}';
		UPDATE stats SET channelcount = '${client.channels.cache.size}';
		UPDATE stats SET rolecount = '${totalrolecount}';
		UPDATE stats SET allusers = '${totalusers}';
		`, [client.users.cache.size, client.guilds.cache.size, client.channels.cache.size, totalrolecount, totalusers]);
	}
};