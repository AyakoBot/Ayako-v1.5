const ch = require('../../../BaseClient/ClientHelper');

module.exports = {
	async execute(msg) {
		const res = await ch.query(`SELECT * FROM giveawaysettings WHERE messageid = '${msg.id}';`);
		if (res && res.rowCount > 0) ch.query.query(`DELETE FROM giveawaysettings WHERE messageid = '${msg.id}';`);
	}
};