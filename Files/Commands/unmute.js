module.exports = {
	name: 'unmute',
	perm: 268435456n,
	dm: false,
	takesFirstArg: true,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => { });
		const lan = msg.lan;
		if (!user) return msg.client.ch.reply(msg, msg.language.noUser);
		let reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
		const guildmember = await msg.guild.members.fetch(user.id).catch(() => { });
		if (guildmember) {
			const res = await msg.client.ch.query('SELECT * FROM modrolesnew WHERE guildid = $1;', [msg.guild.id]);
			if (res && res.rowCount > 0) {
				const roles = new Array;
				res.rows.forEach((r) => roles.push(r.roleid));
				if (guildmember.roles.cache.some(r => roles.includes(r.id))) return proceed(false, this);
				else return proceed(null, this);
			} else return proceed(null, this);
		} else return proceed(null, this);

		async function proceed(proceed) {
			if (proceed == false) {
				const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
				if (modRoleRes) return msg.client.emit('modMuteRemove', msg.author, user, reason, msg);
				else msg.delete().catch(() => { });
			} else return msg.client.emit('modMuteRemove', msg.author, user, reason, msg);
		}
	}
};