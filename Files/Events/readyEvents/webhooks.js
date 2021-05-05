const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper');
const Constants = require('../../Constants.json');

module.exports = {
	async execute() {
		const res = await ch.query('SELECT * FROM webhooks');
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
                            UPDATE webhooks SET webhook = '${webhook.id}' WHERE channel = '${channel.id}'; 
                            UPDATE webhooks SET token = '${webhook.token}' WHERE channel = '${channel.id}';
                            `);
						}
					}
				}
			});
		}
	}
};