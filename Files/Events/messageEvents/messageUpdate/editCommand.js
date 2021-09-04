const { client } = require('../../../BaseClient/DiscordClient');

module.exports = {
	async execute(oldMsg, newMsg) {
		const ch = client.ch;
		if (!oldMsg || !newMsg || !oldMsg.content || !newMsg.content) return;
		if (oldMsg.content == newMsg.content) return;
		if (oldMsg.pinned !== newMsg.pinned) return;
		let prefix;
		let prefixStandard = client.constants.standard.prefix;
		let prefixCustom;
		if (newMsg.channel.type !== 'DM') {
			const res = await ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [newMsg.guild.id]);
			if (res && res.rowCount > 0) prefixCustom = res.rows[0].prefix;
		}
		if (newMsg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
		else if (newMsg.content.toLowerCase().startsWith(prefixCustom)) prefix = prefixCustom;
		else return;
		if (!prefix) return;
		const args = newMsg.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = newMsg.client.commands.get(commandName) || newMsg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return;
		client.emit('messageCreate', newMsg);
	}
};