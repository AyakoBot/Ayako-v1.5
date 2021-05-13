const { client } = require('../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(oldPresence, newPresence) {
		const now = Date.now();
		const ch = client.ch;
		const Constants = client.constants;
		if (oldPresence == newPresence) return;
		const changedGames = await ChangedGames(oldPresence, newPresence);
		newPresence.activities?.forEach(async (activity) => {
			if (oldPresence.advtivities?.includes(activity)) return;
			const playduration = now - activity.createdTimestamp;
			const res = await ch.query(`SELECT * FROM games WHERE userid = '${newPresence.user.id}' AND gamename = '${activity.name}';`);
			if (res && res.rowCount > 0) {
				const r = res.rows[0];
				const newDuration = r.playduration + playduration;
				ch.query(`UPDATE games SET playduration = '${newDuration}' WHERE gamename = '${activity.name}' AND userid = '${newPresence.user.id}';`);
			}
		});
	}
};

async function ChangedGames(oldPresence, newPresence) {
	const array = [];
	const oldGames = oldPresence.activities;
	const newGames = newPresence.activities;
	if (oldGames && newGames) {
		const oldPlayedGames = [];
		const newPlayedGames = [];
		oldGames.forEach(async (game) => {game.when = 'old'; oldPlayedGames.push(game);});
		newGames.forEach(async (game) => {game.when = 'new'; newPlayedGames.push(game);});
		const changedGame = [];
		oldPlayedGames.forEach(game => {if (!newPlayedGames.includes(game)) changedGame.push(game);});

	}

	return array;
}