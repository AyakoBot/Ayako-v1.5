module.exports = {
	async execute(member, user) {
		const res = await user.client.ch.query('SELECT * FROM verification WHERE guildid = $1 AND active = $2;', [member.guild.id, true]);
		if (res && res.rowCount > 0) {
			member.roles.add(res.rows[0].pendingrole).catch(() => {});
			const msg = new Object; msg.r = res.rows[0], msg.language = await member.client.ch.languageSelector(member.guild);
			const DM = await user.createDM().catch(() => {});
			if (DM && DM.id && res.rows[0].selfstart) {
				msg.DM = DM, msg.r = res.rows[0], msg.client = user.client, msg.lan = msg.language.verification, msg.author = user, msg.member = member, msg.guild = member.guild;
				user.client.commands.get('verify').startProcess(msg);
			}
		}
	}
};