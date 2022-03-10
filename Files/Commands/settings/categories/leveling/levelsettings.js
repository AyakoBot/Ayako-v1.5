const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 0,
  xpmultiplier: [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
    2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8,
    3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0,
  ],
  lvlupmode: [0, 1, 2],
  finished: true,
  childOf: 'leveling',
  category: ['automation'],
  async displayEmbed(msg, r) {
    let lvlupmode;
    switch (r.lvlupmode) {
      case '1': {
        lvlupmode = msg.lan.messages;
        break;
      }
      case '2': {
        lvlupmode = msg.lan.reactions;
        break;
      }
      default: {
        lvlupmode = msg.lan.silent;
        break;
      }
    }

    const embed = new Discord.UnsafeEmbed()
      .setDescription(
        msg.client.ch.stp(msg.lan.description, { prefix: msg.client.constants.standard.prefix }),
      )
      .addFields(
        {
          name: msg.lanSettings.active,
          value: r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: `${msg.lan.xpmultiplier}`,
          value: `${r.xpmultiplier}`,
          inline: true,
        },
        {
          name: `${msg.lan.xppermsg}`,
          value: `${Number(r.xppermsg) - 10} - ${r.xppermsg}`,
          inline: true,
        },
        {
          name: `${msg.lan.actualXP}`,
          value: `${(Number(r.xppermsg) - 10) * Number(r.xpmultiplier)} - ${
            Number(r.xppermsg) * Number(r.xpmultiplier)
          }`,
          inline: true,
        },
        {
          name: `${msg.lan.rolemode}`,
          value: `${r.rolemode ? msg.lan.replace : msg.lan.stack}`,
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: `${msg.lan.lvlupmode}`,
          value: `${lvlupmode}`,
          inline: true,
        },
      );

    switch (r.lvlupmode) {
      case '1': {
        const customEmbed = await embedName(msg, r);

        embed.addFields({
          name: msg.lan.embed,
          value: customEmbed ? customEmbed.name : msg.language.default,
          inline: true,
        });
        embed.addFields({
          name: msg.lan.lvlupdeltimeout,
          value: Number(r.lvlupdeltimeout)
            ? `\`${r.lvlupdeltimeout} ${msg.language.time.seconds}\``
            : msg.language.none,
          inline: true,
        });
        embed.addFields({
          name: `${msg.lan.lvlupchannels}`,
          value: `${
            r.lvlupchannels && r.lvlupchannels.length
              ? r.lvlupchannels.map((id) => ` <#${id}>`)
              : msg.language.whereTriggered
          }`,
          inline: false,
        });

        break;
      }
      case '2': {
        embed.addFields({
          name: msg.lan.reactions,
          value:
            r.lvlupemotes && r.lvlupemotes.length
              ? r.lvlupemotes
                  .map((e) => {
                    let emote;
                    if (msg.client.emojis.cache.get(e)) {
                      emote = msg.client.emojis.cache.get(e);
                    } else if (e.match(msg.client.ch.regexes.emojiTester)?.length) {
                      emote = e;
                    }

                    if (emote) return `${emote}`;
                    return null;
                  })
                  .filter((e) => !!e)
                  .join('')
              : msg.client.textEmotes.levelupemotes.map((e) => e).join(''),
        });
        break;
      }
      default: {
        break;
      }
    }

    embed.addFields(
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: `${msg.lan.blchannels}`,
        value: `${
          r.blchannels && r.blchannels.length
            ? r.blchannels.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.blroles}`,
        value: `${
          r.blroles && r.blroles.length ? r.blroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.blusers}`,
        value: `${
          r.blusers && r.blusers.length ? r.blusers.map((id) => ` <@${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: `${msg.lan.wlchannels}`,
        value: `${
          r.wlchannels && r.wlchannels.length
            ? r.wlchannels.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.wlroles}`,
        value: `${
          r.wlroles && r.wlroles.length ? r.wlroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.wlusers}`,
        value: `${
          r.wlusers && r.wlusers.length ? r.wlusers.map((id) => ` <@${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.ignoreprefixes,
        value: r.ignoreprefixes
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.prefixes,
        value: `${
          r.prefixes && r.prefixes.length
            ? r.prefixes.map((w) => `\`${w}\``).join(', ')
            : msg.language.none
        }`,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const components = [];

    components.push([
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.active.name)
        .setLabel(msg.lanSettings.active)
        .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.rolemode.name)
        .setLabel(msg.lan.rolemode)
        .setStyle(r.rolemode ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Primary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.xppermsg.name)
        .setLabel(msg.lan.xppermsg.replace(/\*/g, ''))
        .setStyle(Discord.ButtonStyle.Secondary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.xpmultiplier.name)
        .setLabel(msg.lan.xpmultiplier.replace(/\*/g, ''))
        .setStyle(Discord.ButtonStyle.Secondary),
    ]);

    switch (r.lvlupmode) {
      case '1': {
        components.push([
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.lvlupmode.name)
            .setLabel(msg.lan.lvlupmode)
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.lvlupchannels.name)
            .setLabel(msg.lan.lvlupchannels)
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.embed.name)
            .setLabel(msg.lan.embed)
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.lvlupdeltimeout.name)
            .setLabel(msg.lan.lvlupdeltimeout)
            .setStyle(Discord.ButtonStyle.Primary),
        ]);

        break;
      }
      case '2': {
        components.push([
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.lvlupmode.name)
            .setLabel(msg.lan.lvlupmode)
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.lvlupemotes.name)
            .setLabel(msg.lan.lvlupemotes)
            .setStyle(Discord.ButtonStyle.Primary),
        ]);
        break;
      }
      default: {
        components.push([
          new Discord.UnsafeButtonComponent()
            .setCustomId(msg.lan.edit.lvlupmode.name)
            .setLabel(msg.lan.lvlupmode)
            .setStyle(Discord.ButtonStyle.Primary),
        ]);
        break;
      }
    }

    components.push([
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.blchannels.name)
        .setLabel(msg.lan.blchannels)
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.blroles.name)
        .setLabel(msg.lan.blroles)
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.blusers.name)
        .setLabel(msg.lan.blusers)
        .setStyle(Discord.ButtonStyle.Primary),
    ]);

    components.push([
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.wlchannels.name)
        .setLabel(msg.lan.wlchannels)
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.wlroles.name)
        .setLabel(msg.lan.wlroles)
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.wlusers.name)
        .setLabel(msg.lan.wlusers)
        .setStyle(Discord.ButtonStyle.Primary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.ignoreprefixes.name)
        .setLabel(msg.lan.ignoreprefixes)
        .setStyle(r.ignoreprefixes ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary),
      new Discord.UnsafeButtonComponent()
        .setCustomId(msg.lan.edit.prefixes.name)
        .setLabel(msg.lan.prefixes)
        .setStyle(Discord.ButtonStyle.Primary),
    ]);

    return components;
  },
};

const embedName = async (msg, r) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;',
    [r.embed, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
