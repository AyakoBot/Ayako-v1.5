const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'resetlevels',
  perm: 32n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'leveling',
  async execute(msg) {
    const all = msg.args[0] === msg.language.all;
    let user;
    if (!all) {
      user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
      if (!user) {
        msg.client.ch.error(msg, msg.language.errors.userNotExist);
        return;
      }
    }

    const returned = await areYouSure(msg, all, user);
    if (!returned) return;

    const { finished, m } = returned;
    if (!finished) {
      m.client.ch.edit(m, { content: msg.language.aborted, embeds: [], components: [] });
      return;
    }

    let res;
    if (all) {
      res = await msg.client.ch.query("DELETE FROM level WHERE type = 'guild' AND guildid = $1;", [
        msg.guild.id,
      ]);
    } else {
      res = await msg.client.ch.query(
        "DELETE FROM level WHERE type = 'guild' AND guildid = $1 AND userid = $2;",
        [msg.guild.id, user.id],
      );
    }

    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(msg.client.ch.stp(msg.lan.reset, { amount: res.rowCount }))
      .setColor(msg.client.constants.colors.success)
      .setAuthor({
        name: msg.lan.author,
        iconURL: msg.client.objectEmotes.warning.languageink,
        url: msg.client.constants.standard.invite,
      });

    m.client.ch.edit(m, { embeds: [embed], components: [] });
  },
};

const areYouSure = async (msg, all, user) => {
  const tick = new Builders.UnsafeButtonBuilder()
    .setEmoji(msg.client.objectEmotes.tick)
    .setCustomId('yes')
    .setStyle(Discord.ButtonStyle.Danger);

  const cross = new Builders.UnsafeButtonBuilder()
    .setEmoji(msg.client.objectEmotes.cross)
    .setCustomId('no')
    .setStyle(Discord.ButtonStyle.Primary);

  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(all ? msg.lan.sureAll : msg.client.ch.stp(msg.lan.sureUser, { user }))
    .setColor(msg.client.constants.colors.warning)
    .setAuthor({
      name: msg.lan.author,
      iconURL: msg.client.objectEmotes.warning.link,
      url: msg.client.constants.standard.invite,
    });

  const rows = msg.client.ch.buttonRower([[tick, cross]]);
  const m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });
  let i;
  const collector = m.createMessageComponentCollector({ time: 60000 });

  const returned = await new Promise((resolve) => {
    collector.on('collect', (interaction) => {
      switch (interaction.customId) {
        case 'yes': {
          collector.stop();
          resolve(true);
          break;
        }
        case 'no': {
          collector.stop();
          resolve(false);
          break;
        }
        default: {
          resolve(null);
          break;
        }
      }

      i = interaction;
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg, m);
        resolve(null);
      }
    });
  });

  if (!returned && typeof returned === 'boolean') return { finished: false, m: i };
  if (typeof returned === 'boolean') return { finished: true, m: i };
  return null;
};
