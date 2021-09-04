module.exports = {
	async execute(msg) {
		if (msg.channel.type == 'DM') return;
		if (msg.author.id == '852255485956325437' || msg.author.id == '852256273881890817') return;
		if (msg.channel.id !== '851779578846117888' && msg.channel.id !== '851779018117218324') return;
		let webhook;
		if (msg.channel.id == '851779018117218324') {
			webhook = await msg.client.fetchWebhook('852255485956325437', 'gchnKeLQslyFc-W4aIFMvIVZbL7TAGo1bV8zhKYyb5Al9m6J5hyWzEf9wUij7HFgBEnL');
			const body = { 
				username: msg.author.username,
				avatarURL: msg.client.ch.displayAvatarURL(msg.author),
				content: msg.content ? msg.attachments.size > 0 ? msg.content+'\n'+msg.attachments.first().url : msg.content : msg.attachments.size > 0 ? msg.attachments.first().url : '\u200b',
			};
			if (msg.attachments.size > 0) body.attachments = msg.attachments;
			msg.m = await webhook.send(body);
		} else {
			webhook = await msg.client.fetchWebhook('852256273881890817', 'AP8djJ22ixL99NFfz259gDhC_Ng5_4Wn6LQllTj_kKkJb-3OZw75UlAycyQcrfWW5BCG');
			const body = { 
				username: msg.author.username,
				avatarURL: msg.client.ch.displayAvatarURL(msg.author),
				content: msg.content ? msg.attachments.size > 0 ? msg.content+'\n'+msg.attachments.first().url : msg.content : msg.attachments.size > 0 ? msg.attachments.first().url : '\u200b',
			};
			if (msg.attachments.size > 0) body.attachments = msg.attachments;
			msg.m = await webhook.send(body);
		}
	}
};