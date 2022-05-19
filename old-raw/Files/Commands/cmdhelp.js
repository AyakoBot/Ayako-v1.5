const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  name: 'cmdhelp',
  perm: null,
  dm: true,
  aliases: ['cmdh', 'commandhelp', 'commandh'],
  type: 'info',
  async execute(msg) {
    const reqcommand = getCommand(msg);
    if (!reqcommand) {
      msg.client.ch.error(msg, msg.lan.commandNotFound);
      return;
    }

    const commandLan =
      msg.language.commands[reqcommand.name] || msg.language.slashCommands[reqcommand.name];
    if (!commandLan) {
      msg.client.ch.error(msg, msg.lan.notFound);
      throw new Error(`Command ${reqcommand.name} not found in language file.`);
    }

    let category;
    if (reqcommand.category) {
      category = reqcommand.category;
    } else if (commandLan?.category) {
      category = commandLan.category;
    } else {
      category = msg.language.none;
    }

    let reqperms;
    if (reqcommand.perm === 0) {
      reqperms = msg.language.AyakoOwner;
    } else if (reqcommand.perm === 1) {
      reqperms = msg.language.ServerOwner;
    } else if (reqcommand.perm) {
      reqperms = new Discord.PermissionsBitField(reqcommand.perm).toArray();
    } else {
      reqperms = msg.language.none;
    }

    const ThisGuildOnly = [];
    if (reqcommand.thisGuildOnly) {
      const promises = reqcommand.thisGuildOnly.map(async (thisGuildOnly) => {
        const guild = msg.client.guilds.cache.get(thisGuildOnly);
        let tgo = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : undefined;
        if (!tgo) {
          const channel =
            msg.client.channels.cache.get(guild.systemChannelID) ||
            guild.channels.cache.find(
              (c) => c.type === 0 && guild.members.me.permissionsIn(c).has(1n),
            );

          const inv = await channel?.createInvite({
            maxAge: 20000,
            reason: msg.client.ch.stp(
              (
                await msg.client.ch.languageSelector(channel.guild)
              ).commands.cmdhelp.inviteReason,
              { msg },
            ),
          });
          tgo = inv?.url;
        }
        if (tgo) ThisGuildOnly.push(`[${guild.name}](${tgo})`);
        else ThisGuildOnly.push(`${guild.name}`);
      });
      await Promise.all(promises);
    }
    const aliases = reqcommand.aliases
      ? reqcommand.aliases.map((t) => `\`${msg.client.constants.standard.prefix}${t}\``).join(', ')
      : msg.language.none;
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: `${msg.language.command}: ${reqcommand.name}`,
        iconURL: msg.client.constants.standard.image,
        url: msg.client.constants.standard.invite,
      })
      .addFields(
        {
          name: `|${msg.language.name}`,
          value: `\u200b${commandLan.name ? commandLan.name : reqcommand.name}`,
          inline: true,
        },
        { name: `|${msg.language.category}`, value: `\u200b${category}`, inline: true },
        { name: `|${msg.language.aliases}`, value: `\u200b${aliases}`, inline: false },
        {
          name: `|${msg.language.description}`,
          value: `\u200b${commandLan.description}`,
          inline: false,
        },
        {
          name: `|${msg.language.requiredPermissions}`,
          value: `\u200b${
            Array.isArray(reqperms)
              ? reqperms.map((p) => `\`${msg.language.permissions[p]}\``)
              : reqperms
          }`,
          inline: false,
        },
        {
          name: `|${msg.language.thisGuildOnly}`,
          value: `\u200b${
            `${ThisGuildOnly.map((r) => `${r}`).join(', ')}` !== ''
              ? ThisGuildOnly.map((r) => `${r}`).join(', ')
              : msg.language.freeToAccess
          }`,
          inline: false,
        },
        {
          name: `|${msg.language.dms}`,
          value: `\u200b${reqcommand.dm ? msg.lan.dmsTrue : msg.lan.dmsFalse}`,
          inline: false,
        },
      )
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.members.me : null))
      .setTimestamp();
    if (commandLan.usage && commandLan.usage.length) {
      embed.addFields({
        name: `|${msg.language.usage}`,
        value: `
          \u200b${msg.client.ch.makeCodeBlock(
            `${msg.client.constants.standard.prefix}${commandLan.usage.join(
              `\n${msg.client.constants.standard.prefix}`,
            )}`,
          )}\n\`[ ] = ${msg.language.required}\`\n\`( ) = ${msg.language.optional}\`
          `,
        inline: false,
      });
    }
    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};

const getCommand = (msg) => {
  if (msg.triedCMD) {
    return msg.triedCMD;
  }

  const cmdDir = `${require.main.path}/Files/Commands`;
  const slashCmdDir = `${require.main.path}/Files/Interactions/SlashCommands`;

  const cmdFiles = fs.readdirSync(cmdDir).filter((f) => f.endsWith('.js'));
  const slashCmdFiles = fs.readdirSync(slashCmdDir).filter((f) => f.endsWith('.js'));

  const commandName = msg.args[0]?.toLowerCase() || 'cmdh';
  const searchedFileName = commandName || msg.args.shift().toLowerCase();

  const cmdFile = cmdFiles
    .map((c) => {
      const possibleFile = require(`${cmdDir}/${c}`);
      if (
        possibleFile.name === searchedFileName ||
        possibleFile.aliases?.includes(searchedFileName)
      ) {
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)[0];

  const slashCmdFile = slashCmdFiles
    .map((c) => {
      const possibleFile = require(`${slashCmdDir}/${c}`);
      if (possibleFile.name === searchedFileName) {
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)[0];

  return cmdFile || slashCmdFile;
};
