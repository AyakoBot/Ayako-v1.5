const Discord = require('discord.js');
const client = require('../../BaseClient/DiscordClient');
client.AntiRaidCache = new Discord.Collection();

module.exports = {
	execute() {
		client.AntiRaidCache.map(o => o).forEach((obj) => {
			obj.joins.map(o => o).forEach((users) => {
				if (users.sorted.length > 10) banThese(users);
			});
		});
		function banThese(users) {
			console.log(0, users);
			const guild = client.guilds.cache.get(users.guild);
			if (guild) {
				users.sorted.forEach(async (userID) => {
					const user = client.users.cache.get(userID), msg = new Object;
					msg.language = await client.ch.languageSelector(guild), msg.client = client, msg.guild = guild;
					client.emit('modBanAdd', client.user, user, msg.language.autotypes.antiraid, msg);
				});
			}
			client.AntiRaidCache.delete(guild.id);
		}
	},
	async add(users) {
		console.log(1, users);
		users.forEach((user) => {
			if (client.AntiRaidCache.get(users[0].guild)) {
				if (client.AntiRaidCache.get(users[0].guild).joins.get(user.id.slice(0, 3))) client.AntiRaidCache.get(users[0].guild).joins.get(user.id.slice(0, 3)).sorted.push(user.id);
				else client.AntiRaidCache.get(users[0].guild).joins.set(user.id.slice(0, 3), {guild: user.guild, sorted: [user.id]});
			} else client.AntiRaidCache.set(users[0].guild, {joins: new Discord.Collection().set(user.id.slice(0, 3), {guild: user.guild, sorted: [user.id]})});
		});
	}
};