const { client } = require('../../../BaseClient/DiscordClient.js');

module.exports = {
	async execute(msg) {
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM giveawaysettings WHERE messageid = $1;', [msg.id]);
		if (res && res.rowCount > 0) ch.query.query('DELETE FROM giveawaysettings WHERE messageid = $1;', [msg.id]);
	}
};