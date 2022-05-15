const Builders = require('@discordjs/builders');

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
        let entry;
        if (guild.members.me.permissions.has(128n)) {
          const audits = await guild.fetchAuditLogs({ limit: 5, type: 72 });
          if (audits && audits.entries) {
            const audit = audits.entries.filter(
              (a) =>
                a.target && a.target.id === msg.author.id && a.extra.channel.id === msg.channel.id,
            );
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }
        const embed = new Builders.UnsafeEmbedBuilder().setColor(con.color).setTimestamp();
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
          if (entry.reason) embed.addFields({ name: language.reason, value: entry.reason });
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
            embed.addFields({ name: language.content, value: chunks.first });
            embed.addFields({ name: '\u200b', value: chunks.last });
          } else embed.addFields({ name: language.content, value: msg.content });
        }
        let buffers = [];
        let files = [];
        if (msg.attachments.size > 0) {
          const urls = msg.attachments.map((attachment) => attachment.url);
          buffers = await ch.convertImageURLtoBuffer(urls);
        }
        if (buffers.length === 1) {
          embed.setImage(`attachment://${buffers[0].name}`);
          files = buffers;
        } else {
          files = buffers;
        }

        if (msg.embeds.size > 0) {
          for (let i = 0; i < msg.embeds.size; i += 1) {
            if (msg.embeds[i].title) {
              embed.addFields({ name: language.embedTitle, value: msg.embeds[i].title });
            }
            if (msg.embeds[i].description) {
              embed.addFields({
                name: language.embedDescription,
                value: msg.embeds[i].description,
              });
            }
          }
        }
        ch.send(channels, { embeds: [embed], files }, 5000);
      }
    }
  },
};
