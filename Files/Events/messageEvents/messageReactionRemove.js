module.exports = {
	async execute(reaction, user) {
		const client = reaction.client;
		if (user.id == client.user.id) return; 
		const ch = client.ch;
		const guild = reaction.message.guild;
		const isUnicode = ch.containsNonLatinCodepoints(reaction.emoji.name);
		const res = await ch.query('SELECT * FROM reactionroles WHERE msgid = $1 AND emoteid = $2;', [reaction.message.id, isUnicode ? reaction.emoji.name : reaction.emoji.id]);	
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rowCount; i++) {
				const member = await guild.members.fetch(user.id);
				if (member) {
					const role = guild.roles.cache.get(res.rows[i].roleid);
					if (member.roles.cache.has(res.rows[i].roleid)) member.roles.remove(role).catch(() => {});
				}
			}
		}	
	}
};