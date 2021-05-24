module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const webhook = await client.fetchWebhook('786087332046307358', 'uXE1nXaeNO5sB47LH6BjigGqggVgYgiD5MpGH1l6f-ufZMo0rtF-2mqPcwQg1k-vXZms');
		webhook.send('Want to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>');
	}
};