const { client } = require('../../BaseClient/DiscordClient.js');

module.exports = {
	async execute(oldUser, newUser) {
		const ch = client.ch;
		if (oldUser.username !== newUser.username) {
			const username = newUser.username.replace(/'/g, '').replace(/`/g, '');
			ch.query(`
			INSERT INTO status (userid, pastusernames) 
			VALUES ('${newUser.id}', ARRAY['${username}']) 
			ON CONFLICT (userid) 
			DO UPDATE SET pastusernames = array_append(status.pastusernames, '${username}');
			`);
		}
	}
};