module.exports = {
	name: 'unban',
	perm: 4n,
	dm: false,
	takesFirstArg: true,
	aliases: null,
	type: 'mod',
	async execute(msg) {
		const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => { });
		const lan = msg.lan;
		if (!user) return msg.client.ch.reply(msg, msg.language.noUser);
		let reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
		return proceed(null, this);

		async function proceed(proceed) {
			if (proceed == false) {
				const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
				if (modRoleRes) return msg.client.emit('modBanRemove', msg.author, user, reason, msg);
				else msg.delete().catch(() => { });
			} else return msg.client.emit('modBanRemove', msg.author, user, reason, msg);
		}
	}
};