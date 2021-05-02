const ch = require('../../BaseClient/ClientHelper'); 

module.exports = {
	async execute(oldUser, newUser) {
		if (oldUser.username !== newUser.username) {
			const res = await ch.query(`SELECT * FROM status WHERE userid = '${newUser.id}'`);
			const username = newUser.username.replace(/'/g, '').replace(/`/g, '');
			if (res && res.rowCount > 0) {
				if (res.rows[0].pastusernames) ch.query(`UPDATE status SET pastusernames = '${res.rows[0].pastusernames}, \`${username}\`' WHERE userid = '${newUser.id}'`);
				else ch.query(`UPDATE status SET pastusernames = '\`${username}\`' WHERE userid = '${newUser.id}'`);
			} else {
				ch.query(`INSERT INTO status (userid, pastusernames) VALUES ('${newUser.id}', '\`${username}\`')`);
			}
		}
	}
};