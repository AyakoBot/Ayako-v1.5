module.exports = {
	// eslint-disable-next-line no-unused-vars
	async execute(member, user) {
		const client = user.client;
		const ch = client.ch;
		const guild = member.guild;
		const res = await ch.query('SELECT * FROM autorole WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			let roleArray = new Array;
			res.rows.forEach((row) => {
				if (guild.roles.cache.get(row.roleid)) roleArray.push(row.roleid);
			});
			if (roleArray.length > 0) member.roles.add(roleArray).catch(() => {});
		}   
	}
};