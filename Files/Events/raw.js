module.exports = {
	async execute(event) {
		const { client } = require('../BaseClient/DiscordClient');
		const ch = client.ch;
		if (event.t == 'MESSAGE_REACTION_ADD') {
			const channel = client.channels.cache.get(event.d.channel_id);
			if (channel.messages.cache.has(event.d.message_id)) return;
			const res = await ch.query('SELECT * FROM reactionroles WHERE msgid = $1;', [event.d.message_id]);
			if (res && res.rowCount > 0) {
				const r = res.rows[0];
				const msg = await channel.messages.fetch(event.d.message_id).catch(() => {});
				const isUnicode = ch.containsNonLatinCodepoints(r.emoteid);
				let reaction;
				if (!isUnicode) reaction = msg.reactions.cache.get(r.emoteid);
				else reaction = msg.reactions.cache.get(event.d.emoji.name + ':' + event.d.emoji.id);
				let user = client.users.cache.get(event.d.user_id);
				if (!user || !user.id) user = client.users.fetch(event.d.user_id).catch(() => {});
				if (!reaction) return;
				if (!reaction.message || !reaction.message.id) reaction.message = await channel.messages.fetch(event.d.message_id).catch(() => {});
				if (!reaction || !user || !reaction.message) return;
				client.emit('messageReactionAdd', reaction, user);
			}
		}
		if (event.t == 'MESSAGE_REACTION_REMOVE') {
			const channel = client.channels.cache.get(event.d.channel_id);
			if (channel.messages.cache.has(event.d.message_id)) return;
			const res = await ch.query('SELECT * FROM reactionroles WHERE msgid = $1;', [event.d.message_id]);
			if (res && res.rowCount > 0) {
				const r = res.rows[0];
				if (channel.messages.cache.has(event.d.message_id)) return;
				const msg = await channel.messages.fetch(event.d.message_id).catch(() => {});
				const isUnicode = ch.containsNonLatinCodepoints(r.emoteid);
				let reaction;
				if (!isUnicode) reaction = msg.reactions.cache.get(r.emoteid);
				else reaction = msg.reactions.cache.get(event.d.emoji.name + ':' + event.d.emoji.id);
				let user = client.users.cache.get(event.d.user_id);
				if (!user || !user.id) user = client.users.fetch(event.d.user_id).catch(() => {});
				if (!reaction) return;
				if (!reaction.message || !reaction.message.id) reaction.message = await channel.messages.fetch(event.d.message_id).catch(() => {});
				if (!reaction || !user || !reaction.message) return;
				client.emit('messageReactionRemove', reaction, user);
			}
		}
		if (event.t == 'MESSAGE_DELETE') {
			const res = await ch.query('SELECT * FROM giveawaysettings WHERE messageid = $1;', [event.d.id]);
			if (res && res.rowCount > 0) ch.query('DELETE FROM giveawaysettings WHERE messageid = $1;', [event.d.id]);
		}
	}
};