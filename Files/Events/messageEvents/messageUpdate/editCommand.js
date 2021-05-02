const { client } = require('../../../BaseClient/DiscordClient');
const ch = require('../../../BaseClient/ClientHelper'); 

module.exports = {
	async execute(oldMsg, newMsg) {
		if (oldMsg.content == newMsg.content) return;
		if (oldMsg.pinned !== newMsg.pinned) return;
		let prefix2;
		let prefix1 = 'h!';
		if (newMsg.channel.type !== 'dm') {
			const res = await ch.query(`SELECT prefix FROM prefix WHERE guildid = '${newMsg.guild.id}'`);
			if (res && res.rowCount > 0) prefix2 = res.rows[0].prefix;
			else prefix2 = prefix1;
		} else {
			prefix2 = prefix1;
		}
		if(newMsg.content.toLowerCase().startsWith(prefix1) || newMsg.content.toLowerCase().startsWith(prefix2)) {
			let prefix;
			if(newMsg.content.toLowerCase().startsWith(prefix1)) prefix = prefix1;
			else prefix = prefix2;
			if (!prefix) return;
			const args = newMsg.content.slice(prefix.length).split(/ +/);
			const commandName = args.shift().toLowerCase();
			const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
			if (commandName == 'interactions') return;
			if (!command) return;
			client.emit('message', newMsg);
		}
	}
};