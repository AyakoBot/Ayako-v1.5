const Builders = require('@discordjs/builders');

const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(reaction, user) {
    if (user.id === client.user.id) return;
    const { ch } = client;
    const { guild } = reaction.message;
    if (!guild) return;
    const member = await guild.members.fetch(user.id);
    if (reaction.message.channel.id === '805839305377447936') {
      const msg = await reaction.message.channel.messages.fetch(reaction.message.id);
      if (member && msg.author.id && msg.author.id) {
        if (
          member.roles.cache.has('278332463141355520') ||
          member.roles.cache.has('293928278845030410') ||
          member.roles.cache.has('768540224615612437')
        ) {
          const logchannel = client.channels.cache.get('805860525300776980');
          const res = await ch.query('SELECT * FROM stats;');
          if (reaction.emoji.name === '✅') {
            reaction.message.delete().catch(() => {});
            if (msg.author) {
              const embed2 = new Builders.UnsafeEmbedBuilder()
                .setColor(msg.client.constants.standard.color)
                .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                .setDescription(`${user} accepted the submission of ${msg.author}`)
                .setAuthor({
                  name: msg.author.username,
                  iconURL: msg.author.displayAvatarURL({ size: 4096 }),
                })
                .setTimestamp();
              const log = await logchannel.send(embed2).catch(() => {});
              if (res.rows[0].willis) {
                if (res.rows[0].willis.includes(msg.author.id)) {
                  const embed = new Builders.UnsafeEmbedBuilder()
                    .setAuthor({
                      name: 'Childe Giveaway!',
                      iconURL:
                        'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png',
                      url: 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot',
                    })
                    .setDescription('**You already entered the Giveaway!**')
                    .setColor(16776960)
                    // .addFields('\u200b', '[Click here to get to the Giveaway](https://givelab.com/genshin10k/)')
                    .setTimestamp();
                  await msg.author
                    .send(embed)
                    .then(() => {
                      log.react('670163913370894346');
                    })
                    .catch(() => {});
                  return;
                }
                const embed = new Builders.UnsafeEmbedBuilder()
                  .setAuthor({
                    name: 'Childe Giveaway!',
                    iconURL:
                      'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png',
                    url: 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot',
                  })
                  .setDescription('**Your submission was accepted!**\nGood Luck!')
                  .setColor(msg.client.constants.standard.color)
                  // .addFields('\u200b', '[Click here to get to the Giveaway](https://givelab.com/primogem/10k-primogem-giveaway)')
                  .setTimestamp();
                await msg.author
                  .send(embed)
                  .then(() => {
                    log.react('670163913370894346');
                  })
                  .catch(() => {});
                let array = [];
                array = res.rows[0].willis;
                array.push(msg.author.id);
                const newnr = +res.rows[0].count + 1;
                ch.query('UPDATE stats SET willis = $1; UPDATE stats SET count = $2;', [
                  array,
                  newnr,
                ]);
              } else {
                const embed = new Builders.UnsafeEmbedBuilder()
                  .setAuthor({
                    name: 'Childe Giveaway!',
                    iconURL:
                      'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png',
                    url: 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot',
                  })
                  .setDescription('**Your submission was accepted!**\nGood Luck!')
                  .setColor(msg.client.constants.standard.color)
                  // .addFields('\u200b', '[Click here to get to the Giveaway](https://givelab.com/primogem/10k-primogem-giveaway)')
                  .setTimestamp();
                const m = await ch.send(msg.author, { embeds: [embed] });
                if (m && m.id) log.react('670163913370894346');
                else log.react('746392936807268474');
                ch.query('UPDATE stats SET willis = $1; UPDATE stats SET count = $2;', [
                  [msg.author.id],
                  1,
                ]);
              }
            }
          }
          if (reaction.emoji.name === '❌') {
            reaction.message.delete().catch(() => {});
            if (msg.author) {
              const embed2 = new Builders.UnsafeEmbedBuilder()
                .setColor(16711680)
                .setThumbnail(user.displayAvatarURL({ size: 4096 }))
                .setDescription(`${user} rejected the submission of ${msg.author}`)
                .setAuthor({
                  name: msg.author.username,
                  iconURL: msg.author.displayAvatarURL({ size: 4096 }),
                })
                .setTimestamp();
              const log = await logchannel.send(embed2).catch(() => {});
              const embed = new Builders.UnsafeEmbedBuilder()
                .setAuthor({
                  name: 'Childe Giveaway!',
                  iconURL:
                    'https://cdn.discordapp.com/attachments/565221613507969024/829744594568740935/vctjdj0zvww51.png',
                  url: 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot',
                })
                .setDescription('**Your submission was rejected!**')
                .addFields({
                  name: 'Please check back on the requirements',
                  value:
                    '[Click here to get to the requirements](https://discord.com/channels/108176345204264960/805839305377447936/827248223922946118)',
                })
                .setColor(16711680)
                // .addFields('\u200b', '[Click here to get to the Giveaway](https://givelab.com/genshin10k/)')
                .setTimestamp();
              const m = await ch.send(msg.author, { embeds: [embed] });
              if (m && m.id) log.react('670163913370894346');
              else log.react('746392936807268474');
            }
          }
        }
      }
    }
  },
};
