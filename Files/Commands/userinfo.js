const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'userinfo',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['whois'],
  type: 'info',
  async execute(msg) {
    const user = await msg.client.users
      .fetch(msg.args[0] ? msg.args[0].replace(/\D+/g, '') : msg.author.id, { force: true })
      .catch(() => {});

    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const flags = await user.fetchFlags(true);
    if (user.bot && !flags.has(65536)) {
      flags.add(2048);
    }
    const userflags = msg.client.ch.userFlagCalc(msg.client, flags.bitfield, msg.language, true);
    const con = msg.client.constants.commands[this.name];

    const userEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: user.bot ? msg.lan.authorBot : msg.lan.authorUser,
        iconURL: con.authorImage,
        url: msg.client.constants.standard.invite,
      })
      .setThumbnail(msg.client.ch.displayAvatarURL(user))
      .setImage(msg.client.ch.displayBannerURL(user))
      .setColor(user.accentColor)
      .setDescription(msg.client.ch.stp(msg.lan.userInfo, { user }));

    if (userflags.length) {
      userEmbed.addFields({
        name: msg.lan.flags,
        value: userflags.join('\n'),
        inline: false,
      });
    }

    userEmbed
      .addFields({
        name: `${msg.client.constants.emotes.plus} ${msg.lan.createdAt}`,
        value: `<t:${String(user.createdTimestamp).slice(0, -3)}:F> (<t:${String(
          user.createdTimestamp,
        ).slice(0, -3)}:R>)\n\`${moment
          .duration(Date.now() - user.createdTimestamp)
          .format(
            `y [${msg.language.time.years}], M [${msg.language.time.months}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )}\``,
      })
      .setFooter(msg.lan.footer);

    msg.client.ch.reply(msg, { embeds: [userEmbed] });
  },
};
