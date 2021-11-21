module.exports = {
	async execute(member) {
		if (!member || !member.guild) return;
		const res = await member.member.client.ch.query('SELECT * FROM antiraidsettings WHERE guildid = $1 AND active = true;', [member.guild.id]);
		if (!res || res.rowCount == 0) return;
		this.addMember(member, res.rows[0]);
		const caches = this.check(member, res.rows[0]);
		if (caches) member.client.emit('antiraidHandler', caches, member.guild, res.rows[0]);
	},
	addMember(member, r) {
		if (!member.client.antiraidCache.get(member.guild.id)) member.client.antiraidCache.set(member.guild.id, []);
		const guildJoins = member.client.antiraidCache.get(member.guild.id);

		const memberObject = {
			id: member.user.id,
			joinedAt: Date.now(),
			joinCount: 1,
			idIdent: member.user.id.slice(0, 3),
			guild: member.guild.id,
			timeout: setTimeout(() => 
				guildJoins.length ?
					member.client.antiraidCache.delete(member.guild.id) : 
					guildJoins.splice(guildJoins.findIndex(m => m.id = member.user.id), 1), 
			r.time)
		};
		
		const exists = guildJoins.findIndex(m => m.id == member.user.id) == -1 ? false : true;
		if (exists) {
			const existingMember = guildJoins[guildJoins.findIndex(m => m.id == member.user.id)];

			clearTimeout(existingMember.timeout);
			existingMember.timeout = setTimeout(() =>
				guildJoins.length > 1 ?
					member.client.antiraidCache.delete(member.guild.id) :
					guildJoins.splice(guildJoins.findIndex(m => m.id = member.user.id), 1),
			r.time);

			existingMember.joinCount = existingMember.joinCount + 1;

		} else guildJoins.push(memberObject);
	},
	check(member, r) {
		let caches = null;
		const guildJoins = member.client.antiraidCache.get(member.guild.id);
		if (guildJoins) {
			if (guildJoins.length >= r.jointhreshold) caches = guildJoins;
			else {
				const findIndexEntries = guildJoins[guildJoins.findIndex(m => m.id == member.user.id)];
				if (findIndexEntries.joinCount >= r.jointhreshold) caches = [findIndexEntries];
				else {
					const filterEntries = guildJoins.filter(m => m.idIdent == member.user.id.slice(0, 3));
					if (filterEntries.length >= r.similaridthreshold) caches = filterEntries;
				}
			}
		}
		if (caches?.length > 0) return caches;
		else return;
	}
};

