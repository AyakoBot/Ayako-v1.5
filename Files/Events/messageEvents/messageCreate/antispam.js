const { client } = require('../../../BaseClient/DiscordClient');

const antiSpamSettings = {
	warnThreshold: 7,
	ofwarnThreshold: 10,
	muteThreshold: 13,
	kickThreshold: 16,
	banThreshold: 18,
	maxInterval: 15000,
	maxDuplicatesInterval: 15000,
	maxDuplicatesWarning: 4,
	maxDuplicatesofWarning: 7, 
	maxDuplicatesMute: 10,
	maxDuplicatesKick: 13,
	maxDuplicatesBan: 16
};

let data = {
	messageCache: [],
	bannedUsers: [],
	kickedUsers: [],
	warnedUsers: [],
	ofwarnedUsers: [],
	mutedUsers: [],
	users: []
};

module.exports = {
	async execute(msg) {
		if (msg.channel.type == 'DM') return;
		if (msg.author.id === msg.client.user.id) return;
		if (msg.author.bot) return;
		let warnnr, guildSettings;
		const res = await msg.client.ch.query('SELECT * FROM antispamsettings WHERE guildid = $1 AND active = $2;', [msg.guild.id, true]);
		if (res && res.rowCount > 0) guildSettings = res.rows[0];
		else return;
		const res2 = await msg.client.ch.query('SELECT * FROM warns WHERE guildid = $1 AND userid = $2;', [msg.guild.id, msg.author.id]);
		if (res2 && res2.rowCount > 0) warnnr = res2.rowCount;
		else warnnr = 1;
		msg.member = await msg.guild.members.fetch(msg.author.id);
		if (!msg.member) return;
		if (msg.member.permissions.has(8n)) return;
		if (guildSettings.bpchannelid) {if (guildSettings.bpchannelid.includes(msg.channel.id)) return;}
		if (guildSettings.bpuserid) {if (guildSettings.bpuserid.includes(msg.author.id)) return;}
		if (guildSettings.bproleid) {if (msg.member.roles.cache.some(role => guildSettings.bproleid.includes(role.id))) return;}
		msg.language = await msg.client.ch.languageSelector(msg.guild);
		const banUser = async () => {
			data.messageCache = data.messageCache.filter(m => m.author !== msg.author.id);
			data.bannedUsers.push(msg.author.id);
			if (!msg.member.bannable) return msg.client.ch.send(msg.channel, msg.client.ch.stp(msg.language.commands.antispamHandler.banErrorMessage, {user: msg.author}));
			return msg.client.emit('antispamBanAdd', (msg));
		};
		const kickUser = async () => {
			data.messageCache = data.messageCache.filter(m => m.author !== msg.author.id);
			data.kickedUsers.push(msg.author.id);
			if (!msg.member.kickable) return msg.client.ch.send(msg.channel, msg.client.ch.stp(msg.language.commands.antispamHandler.kickErrorMessage, {user: msg.author}));
			return msg.client.emit('antispamKickAdd', (msg));
		};
		const warnUser = async () => {
			data.warnedUsers.push(msg.author.id);
			return msg.client.emit('antispamWarnAdd', (msg));
		};
		const muteUser = async () => {
			data.mutedUsers.push(msg.author.id);
			return msg.client.emit('antispamMuteAdd', (msg));
		};
		const ofwarnUser = async () => {
			data.ofwarnedUsers.push(msg.author.id);
			if (guildSettings.readofwarnstof == true) {
				if (warnnr == guildSettings.banafterwarnsamount && guildSettings.banenabledtof == true) await kickUser(msg); 
				else if (warnnr == guildSettings.kickafterwarnsamount && guildSettings.kickenabledtof == true) await banUser(msg);
				else if (warnnr == guildSettings.muteafterwarnsamount && guildSettings.muteenabledtof == true) await muteUser(msg);
				else msg.client.emit('antispamOfwarnAdd', msg);
			} 
			if (guildSettings.readofwarnstof == false) msg.client.emit('ofwarnAdd', (msg));
			return;
		};
		data.messageCache.push({
			content: msg.content,
			author: msg.author.id,
			time: Date.now()
		});
		const messageMatches = data.messageCache.filter(m => m.time > Date.now() - antiSpamSettings.maxDuplicatesInterval && m.content === msg.content && m.author === msg.author.id ).length;
		const spamMatches = data.messageCache.filter(m => m.time > Date.now() - antiSpamSettings.maxInterval && m.author === msg.author.id).length;

		if (!data.warnedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.warnThreshold || messageMatches === antiSpamSettings.maxDuplicatesWarning)) return await warnUser(msg);
		if (!data.mutedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.muteThreshold || messageMatches === antiSpamSettings.maxDuplicatesMute) && guildSettings.muteenabledtof == true) return await muteUser(msg);
		if (!data.ofwarnedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.ofwarnThreshold || messageMatches === antiSpamSettings.maxDuplicatesofWarning) && guildSettings.giveofficialwarnstof == true) return await ofwarnUser(msg);
		if (!data.kickedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.kickThreshold || messageMatches === antiSpamSettings.maxDuplicatesKick) && guildSettings.kickenabledtof == true) return await kickUser(msg);
		if (spamMatches === antiSpamSettings.banThreshold || messageMatches === antiSpamSettings.maxDuplicatesBan && guildSettings.banenabledtof == true) return await banUser(msg);
		return;
	},
	resetData() {
		client.ch.logger(`AntiSpam Data Clear\nCleared a total of ${data.messageCache.length} messages`, `messageCache: ${data.messageCache.length}\nofwarnedUsers: ${data.ofwarnedUsers.length}\nmutedUsers: ${data.mutedUsers.length}\nbannedUsers: ${data.bannedUsers.length}\nkickedUsers: ${data.kickedUsers.length}\nwarnedUsers: ${data.warnedUsers.length}`);
		data = {
			messageCache: [],
			ofwarnedUsers: [],
			mutedUsers: [],
			bannedUsers: [],
			kickedUsers: [],
			warnedUsers: []
		};
	}
};

