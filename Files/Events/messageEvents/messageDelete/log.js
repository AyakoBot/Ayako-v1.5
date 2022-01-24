const Discord = require('discord.js');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(msg) {
    const { guild } = msg;
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].messageevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.messageDelete;
        const con = Constants.messageDelete;
        const audits = await guild.fetchAuditLogs({ limit: 5, type: 72 });
        let entry;
        if (audits && audits.entries) {
          const audit = audits.entries.filter(
            (a) =>
              a.target && a.target.id === msg.author.id && a.extra.channel.id === msg.channel.id,
          );
          entry = audit.sort((a, b) => b.id - a.id);
          entry = entry.first();
        }
        const embed = new Discord.MessageEmbed().setColor(con.color).setTimestamp();
        if (entry) {
          embed.setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { msg }),
          });
          embed.setDescription(
            ch.stp(lan.descriptionWithAudit, {
              user: entry.executor,
              target: msg.author,
              channel: msg.channel,
            }),
          );
          if (entry.reason) embed.addField(language.reason, entry.reason);
        } else {
          embed.setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { msg }),
          });
          embed.setDescription(
            ch.stp(lan.descriptionWithoutAudit, { user: msg.author, channel: msg.channel }),
          );
        }
        const letters = msg.content.length;
        const maxFieldSize = 1024;
        if (msg.content) {
          if (letters > maxFieldSize) {
            const chunks = [];
            chunks.first = `${msg.content.substr(0, maxFieldSize - 1)}\u2026`;
            chunks.last = `\u2026${msg.content.substr(maxFieldSize - 1, maxFieldSize * 2)}`;
            embed.addField(language.content, chunks.first);
            embed.addField('\u200b', chunks.last);
          } else embed.addField(language.content, msg.content);
        }
        let paths = [];
        let files = [];
        if (msg.attachments.size > 0) {
          const urls = msg.attachments.map((attachment) => attachment.url);
          paths = await ch.downloader(msg, urls, 'message');
        }
        if (paths.length === 1) {
          const name = await ch.getName(paths[0]);
          embed.attachFiles([paths[0]]);
          embed.setImage(`attachment://${name}`);
          files = paths;
        } else {
          files = paths;
        }

        if (msg.embeds.size > 0) {
          for (let i = 0; i < msg.embeds.size; i += 1) {
            if (msg.embeds[i].title) embed.addField(language.embedTitle, msg.embeds[i].title);
            if (msg.embeds[i].description)
              embed.addField(language.embedDescription, msg.embeds[i].description);
          }
        }
        ch.send(channels, { embeds: [embed], files });
      }
    }
  },
};
