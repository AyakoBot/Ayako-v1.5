module.exports = {
	name: 'iam',
	perm: null,
	dm: false,
	takesFirstArg: true,
	aliases: ['im'],
	type: 'Roles',
	async execute(msg) {
		const res = await msg.client.ch.query('SELECT * FROM selfroles WHERE guildid = $1 AND active = true;', [msg.guild.id]);
		const name = msg.args[0].toLowerCase();
		let role;
		let row;
		if (res && res.rowCount > 0) {
			res.rows.forEach((thisrow) => {
				role = thisrow.roles.findIndex(r => msg.guild.roles.cache.get(r)?.name.toLowerCase() == name);
				row = thisrow;
			});
		}

		if (role) {
			
		} else {

		}
	}
};