const Builders = require('@discordjs/builders');

module.exports = {
  async execute(channel) {
    const { client } = channel;
    const { guild } = channel;
    if (!channel.guild) return;
    const ch = require('../../BaseClient/ClientHelper');
    const Constants = require('../../BaseClient/Other Client Files/Constants.json');
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].channelevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);

        let entryPin;
        let entryUnPin;
        if (guild.members.me.permissions.has(128n)) {
          let auditsPin = await guild.fetchAuditLogs({ limit: 5, type: 74 }).catch(() => {});
          let auditsUnPin = await guild.fetchAuditLogs({ limit: 5, type: 75 }).catch(() => {});

          if (auditsPin) {
            auditsPin = auditsPin.entries.filter((a) => a.extra.channel.id === channel.id);
            auditsPin = auditsPin.sort((a, b) => b.id - a.id);
            entryPin = auditsPin.first();
          }
          if (auditsUnPin) {
            auditsUnPin = auditsUnPin.entries.filter((a) => a.extra.channel.id === channel.id);
            auditsUnPin = auditsUnPin.sort((a, b) => b.id - a.id);
            entryUnPin = auditsUnPin.first();
          }
        }

        const embed = new Builders.UnsafeEmbedBuilder().setTimestamp();
        if (entryPin && entryUnPin) {
          if (ch.getUnix(entryPin.id) > ch.getUnix(entryUnPin.id)) {
            casePin(entryPin, embed, language, channels);
          } else if (ch.getUnix(entryPin.id) < ch.getUnix(entryUnPin.id)) {
            caseUnPin(entryUnPin, embed, language, channels);
          } else {
            caseUnknown(embed, language, channels);
          }
        } else if (entryPin) casePin(entryPin, embed, language, channels);
        else if (entryUnPin) caseUnPin(entryUnPin, embed, language, channels);
        else caseUnknown(embed, language, channels);
      }
    }
    async function casePin(entryPin, embed, language, logchannel) {
      const pinned = await channel.messages.fetch(entryPin.extra.messageID).catch(() => {});
      const lan = language.channelPin;
      const con = Constants.channelPin;
      if (pinned.content) {
        embed.addFields({ name: language.content, value: pinned.content });
      }
      for (let i = 0; pinned.embeds?.length > i; i += 1) {
        if (pinned.embeds[i].title) {
          embed.addFields({ name: language.embedTitle, value: pinned.embeds[i].title });
        } else if (pinned.embeds[i].description) {
          embed.addFields({ name: language.embedDescription, value: pinned.embeds[i].description });
        } else {
          embed.addFields({ name: language.embed, value: language.unknownEmbed });
        }
      }

      let buffers = [];
      let files = [];
      if (pinned.attachments?.size > 0) {
        const urls = pinned.attachments.map((attachment) => attachment.url);
        buffers = await ch.convertImageURLtoBuffer(urls);
      }
      if (buffers.length === 1) {
        embed.setImage(`attachment://${buffers[0].name}`);
        files = buffers;
      } else {
        files = buffers;
      }

      if (pinned && pinned.author) {
        embed
          .setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
            url: con.author.link,
          })
          .setDescription(
            ch.stp(lan.description.withAuthor.withAudit, {
              user: entryPin.executor,
              channel,
              guild,
              msg: pinned,
              author: pinned.author,
            }),
          )
          .setColor(con.color);
        ch.send(logchannel, { embeds: [embed], files }, 5000);
      } else {
        embed
          .setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
            url: con.author.link,
          })
          .setDescription(
            ch.stp(lan.description.withoutAuthor.withAudit, {
              user: entryPin.executor,
              channel,
            }),
          )
          .setColor(con.color);
        ch.send(logchannel, { embeds: [embed], files }, 5000);
      }
    }
    async function caseUnPin(entryUnPin, embed, language, logchannel) {
      const pinned = await channel.messages.fetch(entryUnPin.extra.messageID).catch(() => {});
      const lan = language.channelUnPin;
      const con = Constants.channelUnPin;
      if (pinned.content) {
        embed.addFields({ name: language.content, value: pinned.content });
      }
      for (let i = 0; pinned.embeds.length > i; i += 1) {
        if (pinned.embeds[i].title) {
          embed.addFields({ name: language.embedTitle, value: pinned.embeds[i].title });
        } else if (pinned.embeds[i].description) {
          embed.addFields({ name: language.embedDescription, value: pinned.embeds[i].description });
        } else {
          embed.addFields({ name: language.embed, value: language.unknownEmbed });
        }
      }

      let buffers = [];
      let files = [];
      if (pinned.attachments.size > 0) {
        const urls = pinned.attachments.map((attachment) => attachment.url);
        buffers = await ch.convertImageURLtoBuffer(urls);
      }
      if (buffers.length === 1) {
        embed.setImage(`attachment://${buffers[0].name}`);
        files = buffers;
      } else {
        files = buffers;
      }

      if (pinned && pinned.author) {
        embed
          .setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
            url: con.author.link,
          })
          .setDescription(
            ch.stp(lan.description.withAuthor.withAudit, {
              user: entryUnPin.executor,
              channel,
              guild,
              msg: pinned,
              author: pinned.author,
            }),
          )
          .setColor(con.color);
        ch.send(logchannel, { embeds: [embed], files }, 5000);
      } else {
        embed
          .setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
            url: con.author.link,
          })
          .setDescription(
            ch.stp(lan.description.withoutAuthor.withAudit, {
              user: entryUnPin.executor,
              channel,
            }),
          )
          .setColor(con.color);
        ch.send(logchannel, { embeds: [embed], files }, 5000);
      }
    }
    function caseUnknown(embed, language, logchannel) {
      const lan = language.channelPinUpdate;
      const con = Constants.channelPinUpdate;
      embed
        .setAuthor({
          name: lan.author.title,
          iconURL: con.author.image,
        })
        .setDescription(ch.stp(lan.description.withoutAuthor.withoutAudit, { channel }))
        .setColor(con.color)
        .setTimestamp();
      ch.send(logchannel, { embeds: [embed] }, 5000);
    }
  },
};
