module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const ch = client.ch;
		const Constants = client.constants;
		const res = await ch.query('SELECT * FROM webhooks;');
		if (res && res.rowCount > 0) {
			res.rows.forEach(async (row) => {
				const webhook = await client.fetchWebhook(row.webhook, row.token).catch(() => {});
				if (webhook) client.channelWebhooks.set(row.channel, webhook);
				else {
					const channel = client.channels.cache.get(row.channel);
					if (channel) {
						const language = await ch.languageSelector(channel.guild);
						const webhook = await channel.createWebhook(Constants.standard.webhook.name, {
							avatar: Constants.standard.webhook.avatar,
							reason: language.webhookCreate.reason
						}).catch((e) => {ch.logger('Create Webhook Error', e);});
						if (webhook) {
							client.channelWebhooks.set(channel.id, webhook);
							ch.query(`
                            UPDATE webhooks SET webhook = $1 WHERE channel = $2; 
                            UPDATE webhooks SET token = $3 WHERE channel = $2;
                            `, [webhook.id, channel.id, webhook.token]);
						}
					}
				}
			});
		}
	}
};