const Discord = require('discord.js');
const { CaptchaGenerator } = require('captcha-canvas');
const fs = require('fs');

module.exports = {
  name: 'verify',
  perm: null,
  dm: false,
  takesFirstArg: false,
  category: 'Automation',
  description: 'Verify on a Server',
  usage: ['verify'],
  aliases: [],
  type: 'auto',
  async execute(msg) {
    msg.lan = msg.language.verification;
    const res = await msg.client.ch.query(
      'SELECT * FROM verification WHERE guildid = $1 AND active = $2;',
      [msg.guild.id, true],
    );
    if (res && res.rowCount > 0) {
      const r = res.rows[0];
      let logchannel;
      if (r.startchannel !== msg.channel.id) return;
      if (r.pendingrole && !msg.member.roles.cache.has(r.pendingrole)) return;
      if (r.logchannel) logchannel = msg.guild.channels.cache.get(r.logchannel);
      if (!msg.member.roles.cache.has(r.finishedrole)) {
        const DM = await msg.author.createDM().catch(() => {});
        if (DM && DM.id) {
          msg.DM = DM;
          msg.r = r;
          this.startProcess(msg, null, logchannel);
        }
      } else {
        const m = await msg.client.ch.reply(msg, msg.lan.alreadyVerified);
        setTimeout(() => m.delete().catch(() => {}), 5000);
        msg.delete().catch(() => {});
        return;
      }
      if (logchannel) {
        const log = new Discord.MessageEmbed()
          .setDescription(msg.client.ch.stp(msg.lan.log.start, { user: msg.author }))
          .setAuthor({
            name: msg.author.tag,
            iconURL: msg.client.ch.displayAvatarURL(msg.author),
          })
          .setTimestamp()
          .setColor();
        msg.client.ch.send(logchannel, { embeds: [log] });
      }
      msg.delete().catch(() => {});
    }
  },
  async startProcess(msg, answer, logchannel) {
    if (msg.m) await msg.m.removeAttachments();
    const file = await this.generateImage();
    const { lan } = msg;
    const { r } = msg;
    const embed = new Discord.MessageEmbed()
      .setImage(`attachment://${file.now}.png`)
      .setTitle(
        lan.author.name,
        msg.client.constants.standard.image,
        msg.client.constants.standard.invite,
      )
      .setDescription(
        r.greetdesc
          ? msg.client.ch.stp(r.greetdesc, { user: msg.author })
          : msg.client.ch.stp(lan.description, { guild: msg.guild }),
      )
      .addField(msg.language.hint, lan.hintmsg)
      .addField(lan.field, '\u200b')
      .setColor(msg.client.constants.standard.color);
    const regenerate = new Discord.MessageButton()
      .setCustomId('regenerate')
      .setLabel(msg.language.regenerate)
      .setStyle('SECONDARY');
    if (answer)
      answer
        .update({
          embeds: [embed],
          components: msg.client.ch.buttonRower([regenerate]),
          files: [file.path],
        })
        .catch(() => {});
    else if (msg.m)
      msg.m
        .edit({
          embeds: [embed],
          components: msg.client.ch.buttonRower([regenerate]),
          files: [file.path],
        })
        .catch(() => {});
    else
      msg.m = await msg.client.ch.send(msg.DM, {
        embeds: [embed],
        components: msg.client.ch.buttonRower([regenerate]),
        files: [file.path],
      });
    if (!msg.m || !msg.m.id)
      return msg.client.ch.send(msg.client.channels.cache.get(r.startchannel), {
        content: msg.client.ch.stp(msg.lan.openDMs, {
          user: msg.author,
          prefix: msg.client.constants.standard.prefix,
        }),
      });
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 120000 });
    const messageCollector = msg.DM.createMessageCollector({ time: 120000 });
    buttonsCollector.on('collect', (clickButton) => {
      if (clickButton.customId === 'regenerate') {
        buttonsCollector.stop();
        messageCollector.stop();
        return this.startProcess(msg, clickButton, logchannel);
      }
      return null;
    });
    messageCollector.on('collect', async (message) => {
      if (msg.author.id !== message.author.id && message.embeds[0]) {
        buttonsCollector.stop();
        messageCollector.stop();
        msg.m.delete().catch(() => {});
        return;
      }
      if (message.content.toLowerCase() === msg.language.cancel.toLowerCase()) {
        msg.m.delete().catch(() => {});
        buttonsCollector.stop();
        messageCollector.stop();
        msg.client.ch.reply(message, { content: msg.language.aborted });
        return;
      }
      if (message.content.toLowerCase() === file.captcha.text.toLowerCase()) {
        buttonsCollector.stop();
        messageCollector.stop();
        this.finished(msg, logchannel);
        return;
      }
      buttonsCollector.stop();
      messageCollector.stop();
      const ms = await msg.client.ch.send(msg.DM, {
        content: msg.client.ch.stp(msg.lan.wrongInput, { solution: file.captcha.text }),
      });
      setTimeout(() => {
        ms.delete().catch(() => {});
      }, 10000);
      this.startProcess(msg, null, logchannel);
    });
    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        buttonsCollector.stop();
        messageCollector.stop();
        if (msg.m) await msg.m.removeAttachments();
        msg.m
          .edit({
            embeds: [],
            components: [],
            content: `${msg.client.ch.stp(msg.lan.timeError, {
              channel: r.startchannel,
              prefix: msg.client.constants.standard.prefix,
            })}`,
          })
          .catch(() => {});
      }
    });
    return null;
  },
  generateImage() {
    const captcha = new CaptchaGenerator({ height: 200, width: 600 });
    captcha.setCaptcha({ characters: 5, size: 50 });
    captcha.setTrace({ size: 2, opacity: 3 });
    const buffer = captcha.generateSync();
    const now = Date.now();
    const path = `./Files/Downloads/Captchas/${now}.png`;
    fs.writeFileSync(path, buffer);
    const file = {};
    file.path = path;
    file.now = now;
    file.captcha = captcha;
    return file;
  },
  async finished(msg, logchannel) {
    msg.language = await msg.client.ch.languageSelector(msg.guild);
    if (logchannel) {
      const log = new Discord.MessageEmbed()
        .setDescription(
          msg.client.ch.stp(msg.language.verification?.log?.end, { user: msg.author }),
        )
        .setAuthor({
          name: msg.author.tag,
          iconURL: msg.client.ch.displayAvatarURL(msg.author),
        })
        .setTimestamp()
        .setColor();
      msg.client.ch.send(logchannel, { embeds: [log] });
    }
    const embed = new Discord.MessageEmbed()
      .setTitle(
        msg.lan.author.name,
        msg.client.constants.standard.image,
        msg.client.constants.standard.invite,
      )
      .setDescription(
        msg.r.finishdesc
          ? msg.client.ch.stp(msg.r.finishdesc, { user: msg.author })
          : msg.client.ch.stp(msg.lan.finishDesc, { guild: msg.guild }),
      )
      .setColor(msg.client.constants.standard.color);
    msg.client.ch.send(msg.DM, { embeds: [embed] });
    msg.member.roles.add(msg.r.finishedrole).catch(() => {});
    msg.member.roles.remove(msg.r.pendingrole).catch(() => {});
  },
};
