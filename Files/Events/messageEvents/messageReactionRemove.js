const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 

module.exports = {
	async execute(reaction, user) {
		if (user.id == client.user.id) return; 
		const guild = reaction.message.guild;
		const isUnicode = ch.containsNonLatinCodepoints(reaction.emoji.name);
		const res = await ch.query(`SELECT * FROM reactionroles WHERE msgid = '${reaction.message.id}' AND emoteid = '${isUnicode ? reaction.emoji.name : reaction.emoji.id}'`);	
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rowCount; i++) {
				const member = await ch.member(guild, user);
				if (member) {
					const role = guild.roles.cache.get(res.rows[i].roleid);
					if (member.roles.cache.has(res.rows[i].roleid)) {
						member.roles.remove(role).catch(() => {});
					}
				}
			}
		}	
	}
};