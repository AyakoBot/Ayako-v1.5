module.exports = {
	name: 'warn',
	perm: 4n,
	dm: false,
	takesFirstArg: true,
	aliases: null,
	async execute(msg) {
		const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, ''));
		const lan = msg.lan;
		if (!user) return msg.client.ch.reply(msg, lan.noUser);
		let reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
		const guildmember = await msg.guild.members.fetch(user.id);
		if (guildmember) {
			const res = await msg.client.ch.query('SELECT * FROM modrolesnew WHERE guildid = $1;', [msg.guild.id]);
			if (res && res.rowCount > 0) {
				for (const r of res.rows) {
					const role = msg.guild.roles.cache.get(r.roleid);
					if (role && msg.member.roles.cache.has(role.id)) return warn(await msg.client.ch.modRoleWaiter(msg));
					else return warn();
				}
			} else return warn();
		} else return warn();

		async function warn(proceed) {
			if (proceed == false) return;
			else msg.client.emit('modWarnAdd', msg.author, user, reason, msg);
		}
	}
};