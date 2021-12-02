const Discord = require('discord.js');
const fs = require('fs');
const misc = require('./settings/misc');

module.exports = {
  name: 'settings',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: null,
  async execute(msg) {
    const settings = new Discord.Collection();
    const settingsFiles = fs
      .readdirSync('./Files/Commands/settings')
      .filter(
        (file) =>
          file.endsWith('.js') &&
          file !== 'setup.js' &&
          file !== 'singleRowManager.js' &&
          file !== 'multiRowManager.js' &&
          file !== 'misc.js',
      );
    for (const file of settingsFiles) {
      const settingsfile = require(`./settings/${file}`);
      settingsfile.name = file.replace('.js', '');
      if (!msg.language.commands.settings[settingsfile.name])
        throw new Error(`Couldn't find ${settingsfile.name} in msg.language.commands.settings`);
      settingsfile.category = msg.language.commands.settings[settingsfile.name].category;
      settings.set(file.replace('.js', ''), settingsfile);
    }
    if (!msg.args[0]) {
      let categoryText = '';
      const categories = [];
      settings.forEach((setting) => {
        setting.category.forEach((category) => {
          if (!categories.includes(category)) categories.push(category);
        });
      });
      for (const category of categories) {
        const t = [];
        settings.forEach((s) => {
          if (s.category.includes(category)) t.push(s.name);
        });
        for (let i = 0; i < t.length; i++) {
          const settingsFile = settings.get(t[i]);
          t[i] = `${
            settingsFile.type
              ? settingsFile.type == 1
                ? msg.client.constants.emotes.yellow
                : settingsFile.type == 2
                ? msg.client.constants.emotes.red
                : settingsFile.type == 3
                ? msg.client.constants.emotes.blue
                : settingsFile.type == 4
                ? msg.client.constants.emotes.green
                : msg.client.constants.emotes.blue
              : msg.client.constants.emotes.blue
          }${t[i]}⠀`;
          t[i] = t[i] + new Array(22 - t[i].length).join(' ');
        }
        categoryText += `__${category}__:\n${msg.client.ch.makeCodeBlock(
          `${t.map((s) => `${s}`)}`.replace(/,/g, ''),
        )}\n`;
      }
      const embed = new Discord.MessageEmbed()
        .setAuthor(
          msg.lan.settings.author,
          msg.client.constants.emotes.settingsLink,
          msg.client.constants.standard.invite,
        )
        .setDescription(
          msg.client.ch.stp(msg.lan.settings.desc, {
            prefix: msg.client.constants.standard.prefix,
            commands: categoryText,
          }),
        )
        .setColor(msg.client.constants.commands.settings.color);
      msg.client.ch.reply(msg, embed);
    } else {
      let file = settings.get(msg.args[0].toLowerCase());
      if (!file) return msg.client.ch.reply(msg, msg.lan.invalSettings);
      if (file.hasNoSettings) {
        file = require('./settings/overview');
        file.name = 'overview';
      }
      msg.file = file;
      msg.lan = msg.language.commands.settings[file.name];
      msg.lanSettings = msg.language.commands.settings;
      if (!msg.args[1]) this.display(msg, file);
      else if (
        msg.args[1] &&
        file.perm &&
        !msg.member.permissions.has(new Discord.Permissions(file.perm)) &&
        msg.author.id !== '318453143476371456'
      )
        return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
      else this.edit(msg, file);
    }
  },
  async display(msg, file) {
    const res = await msg.client.ch.query(
      `SELECT * FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } WHERE guildid = $1;`,
      [msg.guild.id],
    );
    let embed;
    if (msg.file.setupRequired == false) return require('./settings/multiRowManager').display(msg);
    if (res && res.rowCount > 0)
      embed =
        typeof file.displayEmbed === 'function'
          ? file.displayEmbed(msg, res.rows[0])
          : misc.noEmbed(msg);
    else embed = misc.noEmbed(msg);
    embed
      .setAuthor(
        msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
        msg.client.constants.emotes.settingsLink,
        msg.client.constants.standard.invite,
      )
      .setColor(msg.client.constants.commands.settings.color);
    const button = new Discord.MessageButton()
      .setCustomId('edit')
      .setStyle('PRIMARY')
      .setLabel(msg.language.Edit);
    const rows = msg.client.ch.buttonRower([button]);
    let m;
    if (
      msg.file.perm &&
      !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) &&
      msg.author.id !== '318453143476371456'
    )
      m = await msg.client.ch.reply(msg, { embeds: [embed] });
    else m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });
    msg.m = m;
    const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    buttonsCollector.on('collect', (clickButton) => {
      if (clickButton.user.id == msg.author.id) {
        if (clickButton.customId == 'edit') {
          buttonsCollector.stop();
          messageCollector.stop();
          this.edit(msg, file, clickButton);
        }
      } else msg.client.ch.notYours(clickButton, msg);
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason == 'time') m.edit({ embeds: [embed], components: [] });
    });
    messageCollector.on('collect', (message) => {
      if (
        message.author.id == msg.author.id &&
        message.content.toLowerCase() == msg.language.edit
      ) {
        buttonsCollector.stop();
        messageCollector.stop();
        message.delete().catch(() => {});
        this.edit(msg, file);
      }
    });
  },
  async edit(msg, file, answer) {
    require('./settings/singleRowManager').execute(msg, answer, file);
  },
};
