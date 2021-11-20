const client = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

const antiraidSettings = {
	time: 15000,
	threshold: 15,
	similarIDThreshold: 5
};

client.antiraidCache = new Discord.Collection();

module.exports = {
	async execute(member) {
		if (!member || !member.guild) return;
		//const res = await member.client.ch.query('SELECT * FROM antiraidsettings WHERE guildid = $1 AND active = true;', [member.guild.id]);
		//if (!res || res.rowCount == 0) return;
		this.addMember(member);
		const caches = this.check(member);
		if (caches) this.punish(caches);
	},
	addMember(member) {
		console.log('add Called');
		if (!client.antiraidCache.get(member.guild.id)) client.antiraidCache.set(member.guild.id, []);
		const guild = client.antiraidCache.get(member.guild.id);

		const memberObject = {
			id: member.user.id,
			joinedAt: Date.now(),
			joinCount: 1,
			idIdent: member.user.id.slice(0, 3),
			guild: member.guild.id,
			timeout: setTimeout(() => 
				guild.length ?
					client.antiraidCache.delete(member.guild.id) : 
					guild.splice(guild.findIndex(m => m.id = member.user.id), 1), 
			antiraidSettings.time)
		};
		
		const exists = guild.findIndex(m => m.id == member.user.id) == -1 ? false : true;
		if (exists) {
			const existingMember = guild[guild.findIndex(m => m.id == member.user.id)];

			clearTimeout(existingMember.timeout);
			existingMember.timeout = setTimeout(() =>
				guild.length > 1 ?
					client.antiraidCache.delete(member.guild.id) :
					guild.splice(guild.findIndex(m => m.id = member.user.id), 1),
			antiraidSettings.time);

			existingMember.joinCount = existingMember.joinCount + 1;

		} else guild.push(memberObject);
	},
	check(member) {
		console.log('check Called');
		let caches = null;
		const guild = client.antiraidCache.get(member.guild.id);
		if (guild) {
			if (guild.length >= antiraidSettings.threshold) caches = guild;
			else {
				const findIndexEntries = guild[guild.findIndex(m => m.id == member.user.id)];
				if (findIndexEntries.joinCount >= antiraidSettings.threshold) caches = [findIndexEntries];
				else {
					const filterEntries = guild.filter(m => m.idIdent == member.user.id.slice(0, 3));
					if (filterEntries.length >= antiraidSettings.similarIDThreshold) caches = filterEntries;
				}
			}
		}
		if (caches?.length > 0) return caches;
		else return;
	},
	punish(member, caches) {
		console.log('UP FOR BAN', caches);
	}
};

