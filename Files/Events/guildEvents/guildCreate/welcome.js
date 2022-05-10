/* eslint-disable no-await-in-loop */
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(guild) {
    const language = await guild.client.ch.languageSelector(guild);
    const lan = language.guildCreate;

    const embed = getEmbed(lan, guild);

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
    const textchannels = guild.channels.cache.filter((c) => c.type === 0);
    const map = textchannels.map((x) => x);
    if (entry && entry.id) {
      for (let i = 0; map.length > i; i += 1) {
        if (sent === true) return;
        const m = await guild.client.ch.send(map[i], {
          embeds: [embed],
          content: `Thank you for adding me! ${entry.executor}`,
        });
        if (m && m.id) sent = true;
      }
    } else {
      for (let i = 0; map.length > i; i += 1) {
        if (sent === true) return;
        const m = await guild.client.ch.send(map[i], { embeds: [embed] });
        if (m && m.id) sent = true;
      }
    }
  },
};

const getEmbed = (lan, guild) =>
  new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.author,
      iconURL: guild.client.constants.standard.image,
      url: guild.client.constants.standard.invite,
    })
    .setColor(guild.me.displayColor)
    .addFields({
      name: guild.client.ch.stp(lan.fields.one.name, {
        prefix: guild.client.constants.standard.prefix,
      }),
      value: lan.fields.one.value,
    })
    .addFields({
      name: guild.client.ch.stp(lan.fields.two.name, {
        prefix: guild.client.constants.standard.prefix,
      }),
      value: lan.fields.two.value,
    });
