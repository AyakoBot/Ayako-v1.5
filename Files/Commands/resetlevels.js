const Discord = require('discord.js');

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
      m.update({ content: msg.language.aborted, embeds: [], components: [] }).catch(() => {});
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

    const embed = new Discord.UnsafeEmbed()
      .setDescription(msg.client.ch.stp(msg.lan.reset, { amount: res.rowCount }))
      .setColor(msg.client.constants.colors.success)
      .setAuthor({
        name: msg.lan.author,
        iconURL: msg.client.constants.emotes.warningLink,
        url: msg.client.constants.standard.invite,
      });

    m.update({ embeds: [embed], components: [] }).catch(() => {});
  },
};

const areYouSure = async (msg, all, user) => {
  const tick = new Discord.ButtonComponent()
    .setEmoji(msg.client.constants.emotes.tick)
    .setCustomId('yes')
    .setStyle(Discord.ButtonStyle.Danger);

  const cross = new Discord.ButtonComponent()
    .setEmoji(msg.client.constants.emotes.cross)
    .setCustomId('no')
    .setStyle(Discord.ButtonStyle.Primary);

  const embed = new Discord.UnsafeEmbed()
    .setDescription(all ? msg.lan.sureAll : msg.client.ch.stp(msg.lan.sureUser, { user }))
    .setColor(msg.client.constants.colors.warning)
    .setAuthor({
      name: msg.lan.author,
      iconURL: msg.client.constants.emotes.warningLink,
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
