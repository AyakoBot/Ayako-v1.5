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
    let levelupmode;
    switch (r.lvlupmode) {
      default: {
        levelupmode = msg.lan.silent;
        break;
      }
      case '1': {
        levelupmode = msg.client.ch.stp(msg.lan.messages);
        break;
      }
      case '2': {
        levelupmode = msg.client.ch.stp(msg.lan.reactions);
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
          name: `${msg.lan.levelupmode}`,
          value: `${levelupmode}`,
          inline: true,
        },
      );

    switch (r.levelupmode) {
      default: {
        break;
      }
      case '1': {
        const customEmbed = await embedName(msg, r);

        embed.addField(msg.lan.embed, customEmbed ? customEmbed.name : msg.language.default);
        embed.addFields({
          name: `${msg.lan.lvlupchannels}`,
          value: `${
            r.lvlupchannels && r.lvlupchannels.length
              ? r.lvlupchannels.map((id) => ` <#${id}>`)
              : msg.language.whereTriggered
          }`,
          inline: true,
        });
        break;
      }
      case '2': {
        embed.addField(
          msg.lan.reactions,
          r.lvlupemotes && r.lvlupemotes.length
            ? r.lvlupemotes.map((e) => e).join('')
            : msg.client.constants.standard.levelupemotes.map((e) => e).join(''),
        );
      }
    }

    embed.addFields(
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.blchannels,
        value: `${
          r.blchannels && r.blchannels.length
            ? r.blchannels.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blroles,
        value: `${
          r.blroles && r.blroles.length ? r.blroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blusers,
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
        name: msg.lan.wlchannels,
        value: `${
          r.wlchannels && r.wlchannels.length
            ? r.wlchannels.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.wlroles,
        value: `${
          r.wlroles && r.wlroles.length ? r.wlroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.wlusers,
        value: `${
          r.wlusers && r.wlusers.length ? r.wlusers.map((id) => ` <@${id}>`) : msg.language.none
        }`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? 'SUCCESS' : 'DANGER');

    const rolemode = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.rolemode.name)
      .setLabel(msg.lan.rolemode)
      .setStyle(r.rolemode ? 'SECONDARY' : 'PRIMARY');
    const xppermsg = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.xppermsg.name)
      .setLabel(msg.lan.xppermsg.replace(/\*/g, ''))
      .setStyle('SECONDARY');
    const xpmultiplier = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.xpmultiplier.name)
      .setLabel(msg.lan.xpmultiplier.replace(/\*/g, ''))
      .setStyle('SECONDARY');

    const blchannels = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.blchannels.name)
      .setLabel(msg.lan.blchannels)
      .setStyle('PRIMARY');
    const blroles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.blroles.name)
      .setLabel(msg.lan.blroles)
      .setStyle('PRIMARY');
    const blusers = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.blusers.name)
      .setLabel(msg.lan.blusers)
      .setStyle('PRIMARY');

    const wlchannels = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.wlchannels.name)
      .setLabel(msg.lan.wlchannels)
      .setStyle('PRIMARY');
    const wlroles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.wlroles.name)
      .setLabel(msg.lan.wlroles)
      .setStyle('PRIMARY');
    const wlusers = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.wlusers.name)
      .setLabel(msg.lan.wlusers)
      .setStyle('PRIMARY');

    return [
      [active],
      [rolemode, xppermsg, xpmultiplier],
      [blchannels, blroles, blusers],
      [wlchannels, wlroles, wlusers],
    ];
  },
};

const embedName = async (msg, r) => {
  const res = await msg.client.db.query(
    `SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;`,
    [r.embed, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
