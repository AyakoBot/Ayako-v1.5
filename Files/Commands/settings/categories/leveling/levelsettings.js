const Discord = require('discord.js');
/*
TODO: 
finish levelupmote {
  reactions: let ppl choose reactions (lvlupemotes)
  message: implement own embed via embed builder
  silent
}
lvlupdeltimeout
lvlupchannels
*/

module.exports = {
  perm: 32n,
  type: 2,
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
      default: {
        lvlupmode = msg.lan.silent;
        break;
      }
      case '1': {
        lvlupmode = msg.client.ch.stp(msg.lan.messages);
        break;
      }
      case '2': {
        lvlupmode = msg.client.ch.stp(msg.lan.reactions);
        break;
      }
    }

    const embed = new Discord.MessageEmbed()
      .setDescription(
        msg.client.ch.stp(msg.lan.description, { prefix: msg.client.constants.standard.prefix }),
      )
      .addFields(
        {
          name: msg.lanSettings.active,
          value: r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
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
          value: `${r.xppermsg}`,
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
      default: {
        break;
      }
      case '1': {
        const customEmbed = await embedName(msg, r);

        embed.addField(msg.lan.embed, customEmbed ? customEmbed.name : msg.language.default, true);
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
        embed.addField(
          msg.lan.reactions,
          r.lvlupemotes && r.lvlupemotes.length
            ? r.lvlupemotes
                .map((e) => {
                  const emote = msg.client.emojis.cache.get(e);
                  if (emote) return `${emote}`;
                  return null;
                })
                .filter((e) => !!e)
                .join('')
            : msg.client.constants.standard.levelupemotes.map((e) => e).join(''),
        );
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
    );
    return embed;
  },
  buttons(msg, r) {
    const components = [];

    components.push([
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.active.name)
        .setLabel(msg.lanSettings.active)
        .setStyle(r.active ? 'SUCCESS' : 'DANGER'),
    ]);

    components.push([
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.rolemode.name)
        .setLabel(msg.lan.rolemode)
        .setStyle(r.rolemode ? 'SECONDARY' : 'PRIMARY'),
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.xppermsg.name)
        .setLabel(msg.lan.xppermsg.replace(/\*/g, ''))
        .setStyle('SECONDARY'),
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.xpmultiplier.name)
        .setLabel(msg.lan.xpmultiplier.replace(/\*/g, ''))
        .setStyle('SECONDARY'),
    ]);

    switch (r.lvlupmode) {
      default: {
        components.push([
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.lvlupmode.name)
            .setLabel(msg.lan.lvlupmode)
            .setStyle('PRIMARY'),
        ]);
        break;
      }
      case '1': {
        components.push([
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.lvlupmode.name)
            .setLabel(msg.lan.lvlupmode)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.lvlupchannels.name)
            .setLabel(msg.lan.lvlupchannels)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.embed.name)
            .setLabel(msg.lan.embed)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.lvlupdeltimeout.name)
            .setLabel(msg.lan.lvlupdeltimeout)
            .setStyle('PRIMARY'),
        ]);

        break;
      }
      case '2': {
        components.push([
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.lvlupmode.name)
            .setLabel(msg.lan.lvlupmode)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId(msg.lan.edit.lvlupemotes.name)
            .setLabel(msg.lan.lvlupemotes)
            .setStyle('PRIMARY'),
        ]);
        break;
      }
    }

    components.push([
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.blchannels.name)
        .setLabel(msg.lan.blchannels)
        .setStyle('PRIMARY'),
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.blroles.name)
        .setLabel(msg.lan.blroles)
        .setStyle('PRIMARY'),
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.blusers.name)
        .setLabel(msg.lan.blusers)
        .setStyle('PRIMARY'),
    ]);

    components.push([
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.wlchannels.name)
        .setLabel(msg.lan.wlchannels)
        .setStyle('PRIMARY'),
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.wlroles.name)
        .setLabel(msg.lan.wlroles)
        .setStyle('PRIMARY'),
      new Discord.MessageButton()
        .setCustomId(msg.lan.edit.wlusers.name)
        .setLabel(msg.lan.wlusers)
        .setStyle('PRIMARY'),
    ]);

    return components;
  },
};

const embedName = async (msg, r) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;`,
    [r.embed, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
