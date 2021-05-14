const { client } = require('../../BaseClient/DiscordClient');

module.exports = {
	async execute(oldPresence, newPresence) {
		const now = Date.now();
		const ch = client.ch;
		if (oldPresence == newPresence) return;
		const changedGames = [];
		const oldGames = oldPresence?.activities;
		const newGames = newPresence?.activities;
		if (oldGames && newGames) {
			const oldPlayedGames = [];
			const newPlayedGames = [];
			oldGames.forEach(async (game) => {game.when = 'old'; oldPlayedGames.push(game);});
			newGames.forEach(async (game) => {game.when = 'new'; newPlayedGames.push(game);});
			oldPlayedGames.forEach(game => {newPlayedGames.filter(g => game !== g);});
			newPlayedGames.forEach(game => {oldPlayedGames.filter(g => game !== g);});
			oldPlayedGames.forEach(game => {changedGames.push(game);});
			newPlayedGames.forEach(game => {changedGames.push(game);});
		} else if (oldGames) oldGames.forEach(g => {g.when = 'old'; changedGames.push(g);});
		else if (newGames) newGames.forEach(g => {g.when = 'new'; changedGames.push(g);});
		changedGames.forEach(async (game) => {
			if (game.name == 'Custom Status') return;
			if (game.when == 'old') {
				game.name = game.name.replace(/`/g, '').replace(/'/g, '');
				const timePlayed = now - game.createdTimestamp;
				const res = ch.query(`SELECT * FROM games WHERE userid = '${oldPresence.user.id}' AND gamename = '${game.name}' AND lastcreated = '${game.createdTimestamp}';`);
				if (res && res.rowCount > 0) ch.query(`UPDATE games SET playduration = '${timePlayed}' WHERE userid = '${oldPresence.user.id}' AND gamename = '${game.name}' AND lastcreated = '${game.createdTimestamp}';`);
				else ch.query(`INSERT INTO games (userid, gamename, playduration, lastcreated) VALUES ('${oldPresence.user.id}', '${game.name}', '${timePlayed}', '${game.createdTimestamp}');`);
			} else if (game.when == 'new') {
				game.name = game.name.replace(/`/g, '').replace(/'/g, '');
				const res = await ch.query(`SELECT * FROM games WHERE userid = '${newPresence.user.id}' AND gamename = '${game.name}';`);
				if (res && res.rowCount > 0) ch.query(`UPDATE games SET lastcreated = '${game.createdTimestamp}' WHERE userid = '${newPresence.user.id}' AND gamename = '${game.name}';`);
				else ch.query(`INSERT INTO games (userid, gamename, playduration, lastcreated) VALUES ('${newPresence.user.id}', '${game.name}', null, '${game.createdTimestamp}');`);
			}
		});
	}
};