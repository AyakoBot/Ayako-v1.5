const { client } = require('../../../BaseClient/DiscordClient');

module.exports = {
	async execute(reaction, user) {
		if (user.id == client.user.id) return; 
		const ch = client.ch;
		const guild = reaction.message.guild;
		const isUnicode = ch.containsNonLatinCodepoints(reaction.emoji.name);
		const res = await ch.query('SELECT * FROM reactionroles WHERE msgid = $1 AND emoteid = $2;', [reaction.message.id, isUnicode ? reaction.emoji.name : reaction.emoji.id]);	
		if (res && res.rowCount > 0) {
			const member = await guild.members.fetch(user.id);
			for (let i = 0; i < res.rowCount; i++) {
				if (member) {
					const role = guild.roles.cache.get(res.rows[i].roleid);
					if (!member.roles.cache.has(res.rows[i].roleid)) member.roles.add(role).catch(() => {});
				}
			}
		}	
	} 
};