const Discord = require('discord.js');

module.exports = {
	async execute(rawmsg, link) {
		const client = rawmsg.client;
		const user = client.users.cache.get(rawmsg.authorid);
		const channel = client.channels.cache.get(rawmsg.channelid);
		const msg = await channel.messages.fetch(rawmsg.msgid).catch(() => {});
		const guild = channel.guild;
		const member = guild.members.cache.get(user.id);

		const phantomMsg = new Discord.Message(
			client,
			{
				id: rawmsg.msgid,
				channel_id: channel.id,
				guild_id: guild.id,
				author: {
					id: user.id,
					username: user.username,
					discriminator: user.discriminator,
					avatar: user.avatar,
				},
				member: {
					user: {
						id: user.id,
						username: user.username,
						discriminator: user.discriminator,
						avatar: user.avatar,
					},
					roles: member?._roles,
					joined_at: member?.joinedTimestamp,
					deaf: member?.deaf,
					mute: member?.mute,
				},
				content: msg?.content,
				timestamp: msg?.createdTimestamp,
				edited_timestamp: null,
				tts: false,
				mention_everyone: false,
				mentions: [],
				mention_roles: [],
				mention_channels: [],
				attachments: [],
				embeds: [],
				pinned: false,
				type: 0
			}
		);

		if (msg) msg.delete().catch(() => {});

		let amountOfTimes = 0;
		const res = await client.ch.query('SELECT * FROM antiviruslog WHERE userid = $1;', [user.id]);
		if (res && res.rowCount > 0) amountOfTimes = res.rowCount;
		client.ch.query('INSERT INTO antiviruslog (guildid, userid, type, dateofwarn) VALUES ($1, $2, $3, $4);', [guild.id, user.id, 'blacklist', Date.now()]);
		amountOfTimes++;

		const settingsRes = await client.ch.query('SELECT * FROM antivirus WHERE guildid = $1 AND active = true;', [guild.id]);
		if (settingsRes && settingsRes.rowCount > 0) {
			const r = settingsRes.rows[0];
			if (+amountOfTimes >= +r.banafterwarnsamount && r.bantof == true) return client.emit('antivirusBanAdd', phantomMsg, link);
			if (+amountOfTimes >= +r.kickafterwarnsamount && r.kicktof == true) return client.emit('antivirusKickAdd', phantomMsg, link);
			if (+amountOfTimes >= +r.muteafterwarnsamount && r.mutetof == true) return client.emit('antivirusMuteAdd', phantomMsg, link);
			if (+amountOfTimes >= 2 && r.warntof == true) return client.emit('antivirusOfwarnAdd', phantomMsg, link);
			if (+amountOfTimes >= 1 && r.verbaltof == true) return client.emit('antivirusWarnAdd', phantomMsg, link);
		} 
	}
};