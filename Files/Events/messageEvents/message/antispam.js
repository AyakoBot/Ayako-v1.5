const { client } = require("../../../BaseClient/DiscordClient");

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
	maxDuplicatesBan: 16,
	ignoreBots: true,
	verbose: false,
	ignoredUsers: [], 
	ignoredRoles: [],
	ignoredGuilds: [],
	ignoredChannels: [],
	warnEnabled: true,
	muteEnabled: true,
	kickEnabled: true,
	banEnabled: true,
	deleteMessagesAfterBanForPastDays: 1
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
		if (msg.channel.type == 'dm') return;
		if (msg.author.id === msg.client.user.id) return;
		if (msg.author.bot) return;
		let warnnr;
		const guildSettings = {};
		const res = await msg.client.ch.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			guildSettings.guildid = res.rows[0].guildid;
			guildSettings.bpchannelID = res.rows[0].bpchannelid;
			guildSettings.bpuserID = res.rows[0].bpuserid;
			guildSettings.bproleID = res.rows[0].bproleid;
			guildSettings.antispamToF = res.rows[0].antispamtof;
			guildSettings.giveofficialWarnsToF = res.rows[0].giveofficialwarnstof;
			guildSettings.muteAfterWarnsAmount = res.rows[0].muteafterwarnsamount;
			guildSettings.KickAfterWarnsAmount = res.rows[0].kickafterwarnsamount;
			guildSettings.BanAfterWarnsAmount = res.rows[0].banafterwarnsamount;
			guildSettings.readOfWarnsToF = res.rows[0].readofwarnstof;
			guildSettings.muteEnabledToF = res.rows[0].muteenabledtof;
			guildSettings.kickEnabledToF = res.rows[0].kickenabledtof;
			guildSettings.banEnabledToF = res.rows[0].banenabledtof;
			guildSettings.deleteToF = res.rows[0].deletetof;
		} else return;
		const res2 = await msg.client.ch.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${msg.author.id}';`);
		if (res2 && res2.rowCount > 0) warnnr = res2.rowCount;
		else warnnr = 1;
		msg.member = await msg.client.ch.member(msg.guild, msg.author);
		if (!msg.member) return;
		if (msg.member.permissions.has(8n)) return;
		if (guildSettings.bpchannelID) {if (guildSettings.bpchannelID.includes(msg.channel.id)) return;}
		if (guildSettings.bpuserID) {if (guildSettings.bpuserID.includes(msg.author.id)) return;}
		if (guildSettings.bproleID) {if (msg.member.roles.cache.some(role => guildSettings.bproleID.includes(role.id))) return;}
		msg.language = await msg.client.ch.languageSelector(msg.guild);
		const banUser = async () => {
			data.messageCache = data.messageCache.filter(m => m.author !== msg.author.id);
			data.bannedUsers.push(msg.author.id);
			if (!msg.member.bannable) return msg.client.ch.send(msg.channel, msg.client.ch.stp(msg.language.commands.antispamHandler.banErrorMessage, {user: msg.author}));
			return msg.client.emit('antispamBanAdd', msg);
		};
		const kickUser = async () => {
			data.messageCache = data.messageCache.filter(m => m.author !== msg.author.id);
			data.kickedUsers.push(msg.author.id);
			if (!msg.member.kickable) return msg.client.ch.send(msg.channel, msg.client.ch.stp(msg.language.commands.antispamHandler.kickErrorMessage, {user: msg.author}));
			return msg.client.emit('antispamKickAdd', msg);
		};
		const warnUser = async () => {
			data.warnedUsers.push(msg.author.id);
			return msg.client.emit('antispamWarnAdd', msg);
		};
		const muteUser = async () => {
			data.mutedUsers.push(msg.author.id);
			return msg.client.emit('antispamMuteAdd', msg);
		};
		const ofwarnUser = async () => {
			data.ofwarnedUsers.push(msg.author.id);
			if (guildSettings.readOfWarnsToF == true) {
				if (warnnr == guildSettings.BanAfterWarnsAmount && guildSettings.banEnabledToF == true) await kickUser(msg); 
				else if (warnnr == guildSettings.KickAfterWarnsAmount && guildSettings.kickEnabledToF == true) await banUser(msg);
				else if (warnnr == guildSettings.muteAfterWarnsAmount && guildSettings.muteEnabledToF == true) await muteUser(msg);
				else msg.client.emit('antispamOfwarnAdd', msg);
			} 
			if (guildSettings.readOfWarnsToF == false) msg.client.emit('ofwarnAdd', msg);
			return;
		};
		data.messageCache.push({
			content: msg.content,
			author: msg.author.id,
			time: Date.now()
		});
		const messageMatches = data.messageCache.filter(m => m.time > Date.now() - antiSpamSettings.maxDuplicatesInterval && m.content === msg.content && m.author === msg.author.id ).length;
		const spamMatches = data.messageCache.filter(m => m.time > Date.now() - antiSpamSettings.maxInterval && m.author === msg.author.id).length;

		if (!data.warnedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.warnThreshold || messageMatches === antiSpamSettings.maxDuplicatesWarning)) {
			warnUser(msg);
			return msg.client.emit('spamThresholdWarn', msg, messageMatches === antiSpamSettings.maxDuplicatesWarning);
		}
		if (!data.mutedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.muteThreshold || messageMatches === antiSpamSettings.maxDuplicatesMute)) {
			if (guildSettings.muteEnabledToF == true) muteUser(msg);
			return msg.client.emit('spamThresholdMute', msg, messageMatches === antiSpamSettings.maxDuplicatesMute);
		}
		if (!data.ofwarnedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.ofwarnThreshold || messageMatches === antiSpamSettings.maxDuplicatesofWarning)) {
			if (guildSettings.giveofficialWarnsToF == true) ofwarnUser(msg);
			return msg.client.emit('spamThresholdOfWarn', msg, messageMatches === antiSpamSettings.maxDuplicatesofWarning);
		}
		if (!data.kickedUsers.includes(msg.author.id) && (spamMatches === antiSpamSettings.kickThreshold || messageMatches === antiSpamSettings.maxDuplicatesKick)) {
			if (guildSettings.kickEnabledToF == true) await kickUser(msg);
			return msg.client.emit('spamThresholdKick', msg, messageMatches === antiSpamSettings.maxDuplicatesKick);
		}
		if (spamMatches === antiSpamSettings.banThreshold || messageMatches === antiSpamSettings.maxDuplicatesBan) {
			if (guildSettings.banEnabledToF == true) await banUser(msg);
			return msg.client.emit('spamThresholdBan', msg, messageMatches === antiSpamSettings.maxDuplicatesBan);
		}
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

