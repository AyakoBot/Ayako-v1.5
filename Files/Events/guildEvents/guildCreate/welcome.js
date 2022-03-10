/* eslint-disable no-await-in-loop */
const Discord = require('discord.js');

module.exports = {
  async execute(guild) {
    const Constants = guild.client.constants;
    const { ch } = guild.client;
    const language = await guild.client.ch.languageSelector(guild);
    const lan = language.guildCreate;
    const joinembed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: lan.author,
        iconURL: Constants.standard.image,
        url: Constants.standard.invite,
      })
      .setColor(guild.me.displayColor)
      .addFields({
        name: ch.stp(lan.fields.one.name, { prefix: Constants.standard.prefix }),
        value: lan.fields.one.value,
      })
      .addFields({
        name: ch.stp(lan.fields.two.name, { prefix: Constants.standard.prefix }),
        value: lan.fields.two.value,
      })
      .addFields({
        name: ch.stp(lan.fields.three.name, { prefix: Constants.standard.prefix }),
        value: lan.fields.three.value,
      })
      .addFields({
        name: ch.stp(lan.fields.four.name, { prefix: Constants.standard.prefix }),
        value: lan.fields.four.value,
      })
      .addFields({
        name: ch.stp(lan.fields.five.name, { prefix: Constants.standard.prefix }),
        value: lan.fields.five.value,
      });

    let entry;
    if (guild.me.permissions.has(128n)) {
      const audits = await guild.fetchAuditLogs({ limit: 3, type: 28 }).catch(() => {});
      if (audits && audits.entries) {
        const audit = audits.entries.filter((a) => a.target.id === guild.client.user.id);
        entry = audit.sort((a, b) => b.id - a.id);
        entry = entry.first();
      }
    }
    let sent = false;
    const textchannels = guild.channels.cache.filter((c) => c.type === 'text');
    const map = textchannels.map((x) => x);
    if (entry && entry.id) {
      for (let i = 0; map.length > i; i += 1) {
        if (sent === true) return;
        const m = await ch.send(map[i], {
          embeds: [joinembed],
          content: `Thank you for adding me! ${entry.executor}`,
        });
        if (m && m.id) sent = true;
      }
    } else {
      for (let i = 0; map.length > i; i += 1) {
        if (sent === true) return;
        const m = await ch.send(map[i], { embeds: [joinembed] });
        if (m && m.id) sent = true;
      }
    }
  },
};
