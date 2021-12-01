const Discord = require('discord.js');

module.exports = {
  name: 'cmdhelp',
  perm: null,
  dm: true,
  aliases: ['cmdh', 'commandhelp', 'commandh'],
  type: 'info',
  async execute(msg) {
    const commandName = msg.args[0] ? msg.args[0].toLowerCase() : 'help';
    const reqcommand = msg.triedCMD
      ? msg.triedCMD
      : msg.client.commands.get(commandName) ||
        msg.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    const { language } = msg;
    const { lan } = msg;
    const commandLan = language.commands[`${reqcommand.name}`];
    if (!reqcommand || !reqcommand.name) return msg.client.ch.reply(msg, lan.notValid);

    let category;
    if (reqcommand.category) {
      category = reqcommand.category;
    } else if (commandLan.category) {
      category = commandLan.category;
    } else {
      category = language.none;
    }

    let reqperms;
    if (reqcommand.perm === 0) {
      reqperms = language.AyakoOwner;
    } else if (reqcommand.perm === 1) {
      reqperms = language.ServerOwner;
    } else if (reqcommand.perm) {
      reqperms = new Discord.Permissions(reqcommand.perm).toArray();
    } else {
      reqperms = language.none;
    }

    const ThisGuildOnly = [];
    if (reqcommand.ThisGuildOnly) {
      const promises = reqcommand.ThisGuildOnly.map(async (thisGuildOnly) => {
        const guild = msg.client.guilds.cache.get(thisGuildOnly);
        let tgo = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : undefined;
        if (!tgo) {
          let channel = msg.client.channels.cache.get(guild.systemChannelID);
          if (!channel) {
            const textchannels = guild.channels.cache.filter((c) => c.type === 'text');
            channel = textchannels.first();
          }
          const inv = await channel.createInvite({
            maxAge: 20000,
            reason: msg.client.ch.stp(
              (
                await msg.client.ch.languageSelector(channel.guild)
              ).commands.cmdhelp.inviteReason,
              { msg },
            ),
          });
          tgo = inv.url;
        }
        if (tgo) ThisGuildOnly.push(`[${guild.name}](${tgo})`);
        else ThisGuildOnly.push(`${guild.name}`);
      });
      await Promise.all(promises);
    }
    const aliases = reqcommand.aliases
      ? reqcommand.aliases.map((t) => `\`${msg.client.constants.standard.prefix}${t}\``).join(', ')
      : language.none;
    const embed = new Discord.MessageEmbed()
      .setAuthor(
        `${language.command}: ${reqcommand.name}`,
        msg.client.constants.standard.image,
        msg.client.constants.standard.invite,
      )
      .addFields(
        {
          name: `|${language.name}`,
          value: `\u200b${commandLan.name ? commandLan.name : reqcommand.name}`,
          inline: true,
        },
        { name: `|${language.aliases}`, value: `\u200b${aliases}`, inline: true },
        { name: `|${language.category}`, value: `\u200b${category}`, inline: true },
        {
          name: `|${language.description}`,
          value: `\u200b${commandLan.description}`,
          inline: false,
        },
        {
          name: `|${language.usage}`,
          value: `\u200b${msg.client.ch.makeCodeBlock(
            msg.client.constants.standard.prefix,
          )}${commandLan.usage.join(`\n${msg.client.constants.standard.prefix}`)}\n\`[ ] = ${
            language.required
          }\`\n\`( ) = ${language.optional}\``,
          inline: false,
        },
        {
          name: `|${language.requiredPermissions}`,
          value: `\u200b${
            Array.isArray(reqperms)
              ? reqperms.map((p) => `\`${language.permissions[p]}\``)
              : reqperms
          }`,
          inline: false,
        },
        {
          name: `|${language.thisGuildOnly}`,
          value: `\u200b${
            `${ThisGuildOnly.map((r) => `${r}`).join(', ')}` !== ''
              ? ThisGuildOnly.map((r) => `${r}`).join(', ')
              : language.freeToAccess
          }`,
          inline: false,
        },
        {
          name: `|${language.dms}`,
          value: `\u200b${reqcommand.dm ? lan.dmsTrue : lan.dmsFalse}`,
          inline: false,
        },
      )
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.me : null))
      .setTimestamp();
    return msg.client.ch.reply(msg, embed);
  },
};
