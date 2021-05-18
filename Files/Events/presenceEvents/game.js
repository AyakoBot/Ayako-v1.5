module.exports = {
	async execute(oldPresence, newPresence) {
		const client = oldPresence ? oldPresence.client : newPresence.client;
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
				const timePlayed = `${now - game.createdTimestamp}`;
				ch.query(`
				INSERT INTO games (userid, gamename, playduration, lastcreated) 
				VALUES ('${oldPresence.user.id}', '${game.name}', '${timePlayed}', '${game.createdTimestamp}')
				ON CONFLICT (userid, gamename) 
				DO UPDATE SET playduration = '${timePlayed}';
				`);
			} else if (game.when == 'new') {
				game.name = game.name.replace(/`/g, '').replace(/'/g, '');
				ch.query(`
				INSERT INTO games (userid, gamename, lastcreated) 
				VALUES ('${newPresence.user.id}', '${game.name}', '${game.createdTimestamp}')
				ON CONFLICT (userid, gamename)
				DO UPDATE SET lastcreated = '${game.createdTimestamp}';
				`);
			}
		});
	},
};

