const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(data) {
		if (!data.guild) return; //we only want to process channels here since webhook events should always be hooked to a channel
		const guild = data.guild;
		const language = await ch.languageSelector(guild);
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.webhookEvents);
			if (logchannel && logchannel.id) {
				const webhooks = (await data.fetchWebhooks()).filter(w => w.channel.id == data.id);
				const audits = [];
				const auditsCreate = await guild.fetchAuditLogs({limit: 3, type: 50});
				const auditsUpdate = await guild.fetchAuditLogs({limit: 3, type: 51});
				const auditsDelete = await guild.fetchAuditLogs({limit: 3, type: 52});
				if (auditsCreate && auditsCreate.entries) audits.push(auditsCreate.entries); 
				if (auditsUpdate && auditsUpdate.entries) audits.push(auditsUpdate.entries); 
				if (auditsDelete && auditsDelete.entries) audits.push(auditsDelete.entries); 
				let entry; let webhook;
				if (audits.size > 0) {
					audits.forEach(a => webhooks.forEach(w => {if (w.id == a.target.id) entry = a; webhook = w;}));
					entry = entry.first();
					const embed = new Discord.MessageEmbed();
					if (entry.actionType == 'CREATE') {
						const lan = language.webhookCreate;
						const con = Constants.webhookCreate;
						embed.setColor(con.color);
						embed.setAuthor(lan.author.name, con.author.image);
						if (webhook.avatar) embed.setThumbnail(ch.avatarURL(webhook));
						if (webhook.name) embed.addField(language.name, webhook.name);
						if (webhook.channelID) embed.addField(language.pointsTo, `<#${webhook.channelID}>`);
						if (webhook.type) embed.addField(language.type, webhook.type == 'Incoming' ? language.incoming : language.channelFollower);
						if (entry.reason) embed.addField(language.reason, entry.reason);
						embed.setDescription(ch.stp(lan.description, {user: entry.executor, channel: data, name: webhook.name}));
					}
					if (entry.actionType == 'UPDATE') {
						const lan = language.webhookUpdate;
						const con = Constants.webhookUpdate;

					}
					if (entry.actionType == 'DELETE') {
						const lan = language.webhookDelete;
						const con = Constants.webhookDelete;


					}
					ch.send(embed);
				}
			}
		}
	}
};