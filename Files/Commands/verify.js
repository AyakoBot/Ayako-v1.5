const Discord = require('discord.js');
const jobs = require('node-schedule');
const { CaptchaGenerator } = require('captcha-canvas');

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
  execute: async (msg) => {
    msg.lan = msg.language.verification;
    const res = await msg.client.ch.query(
      'SELECT * FROM verification WHERE guildid = $1 AND active = $2;',
      [msg.guild.id, true],
    );
    if (res && res.rowCount > 0) {
      const [r] = res.rows;
      let logchannel;
      if (r.startchannel !== msg.channel.id) return;
      if (r.pendingrole && !msg.member.roles.cache.has(r.pendingrole)) return;
      if (!msg.member.roles.cache.has(r.finishedrole)) {
        const DM = await msg.author.createDM().catch(() => {});
        if (DM && DM.id) {
          msg.DM = DM;
          msg.r = r;
          module.exports.startProcess(msg, null, logchannel);
        }
      } else {
        const m = await msg.client.ch.reply(msg, msg.lan.alreadyVerified);
        jobs.scheduleJob(new Date(Date.now() + 5000), () => {
          m.delete().catch(() => {});
        });
        msg.delete().catch(() => {});
        return;
      }
      msg.delete().catch(() => {});
    }
  },
  startProcess: async (msg, answer, logchannel) => {
    if (msg.m) await msg.m.removeAttachments();

    if (msg.r.logchannel) logchannel = msg.guild.channels.cache.get(msg.r.logchannel);
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

    const file = await module.exports.generateImage();
    msg.client.verificationCodes.set(`${msg.DM.id}-${msg.guild.id}`, file.captcha.text);
    const { r } = msg;

    const embed = new Discord.MessageEmbed()
      .setImage(`attachment://${file.name}`)
      .setAuthor({
        name: msg.lan.author.name,
        iconURL: msg.client.constants.standard.image,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.client.ch.stp(msg.lan.description, { guild: msg.guild }))
      .addField(msg.language.hint, msg.lan.hintmsg)
      .addField(msg.lan.field, '\u200b')
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
          files: [file],
        })
        .catch(() => {});
    else if (msg.m)
      msg.m
        .edit({
          embeds: [embed],
          components: msg.client.ch.buttonRower([regenerate]),
          files: [file],
        })
        .catch(() => {});
    else
      msg.m = await msg.client.ch.send(msg.DM, {
        embeds: [embed],
        components: msg.client.ch.buttonRower([regenerate]),
        files: [file],
      });

    if (!msg.m || !msg.m.id)
      return msg.client.ch
        .send(msg.client.channels.cache.get(r.startchannel), {
          content: msg.client.ch.stp(msg.lan.openDMs, {
            user: msg.author,
            prefix: msg.client.constants.standard.prefix,
          }),
        })
        .then((m) => {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            m.delete().catch(() => {});
          });
        });

    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 120000 });
    const messageCollector = msg.DM.createMessageCollector({ time: 120000 });
    buttonsCollector.on('collect', (clickButton) => {
      if (clickButton.customId === 'regenerate') {
        buttonsCollector.stop();
        messageCollector.stop();

        msg.client.verificationCodes.delete(`${clickButton.channel.id}-${msg.guild.id}`);

        return module.exports.startProcess(msg, clickButton, logchannel);
      }
      return null;
    });

    messageCollector.on('collect', async (message) => {
      buttonsCollector.stop();
      messageCollector.stop();
      if (msg.author.id !== message.author.id && message.embeds[0]) {
        msg.m.delete().catch(() => {});
        return;
      }
      if (message.content.toLowerCase() === msg.language.cancel.toLowerCase()) {
        msg.m.delete().catch(() => {});
        msg.client.ch.reply(message, { content: msg.language.aborted });
        return;
      }

      const captcha = msg.client.verificationCodes.get(`${message.channel.id}-${msg.guild.id}`);

      if (!captcha) {
        msg.client.ch.reply(message, { content: `${msg.language.error} ${msg.lan.error}` });
        msg.client.ch.send(
          msg.client.channels.cache.get('726252103302905907', {
            content: `${message.channel.id}-${msg.guild.id} did not exist in Verification Codes, check console`,
          }),
        );
        return;
      }

      if (message.content.toLowerCase() === captcha.toLowerCase()) {
        msg.client.verificationCodes.delete(`${message.channel.id}-${msg.guild.id}`);
        module.exports.finished(msg, logchannel);
        return;
      }
      const ms = await msg.client.ch.send(msg.DM, {
        content: msg.client.ch.stp(msg.lan.wrongInput, { solution: captcha }),
      });
      jobs.scheduleJob(new Date(Date.now() + 10000), () => {
        ms.delete().catch(() => {});
      });
      msg.client.verificationCodes.delete(`${message.channel.id}-${msg.guild.id}`);
      module.exports.startProcess(msg, null, logchannel);
    });

    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        messageCollector.stop();
        msg.client.verificationCodes.delete(
          `${buttonsCollector.options.message.channelId.id}-${msg.guild.id}`,
        );
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
  generateImage: async () => {
    const captcha = new CaptchaGenerator({ height: 200, width: 600 });
    captcha.setCaptcha({ characters: 5, size: 50 });
    captcha.setTrace({ size: 2, opacity: 3 });
    const buffer = await captcha.generate();
    const now = Date.now();

    const file = { attachment: buffer, name: `${now}.png`, captcha };
    return file;
  },
  finished: async (msg, logchannel) => {
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
      .setDescription(msg.client.ch.stp(msg.lan.finishDesc, { guild: msg.guild }))
      .setColor(msg.client.constants.standard.color);
    msg.client.ch.send(msg.DM, { embeds: [embed] });
    if (msg.guild.id === '298954459172700181') {
      msg.client.ch.send(msg.DM, {
        content: `**Also worth checking out:**\n💁‍♀️ Kimetsu No Yaiba┊Demon Slayer┊500 Demon Slayer Emojis & Stickers┊Unique & Fun┊Active┊Chatting┊VC┊& much more! 💜 \nㅤㅤㅤ╰─ ʚ ୨୧ ɞ ─╮\nF✧· 🐛 https://discord.gg/k76uPAzsSW ☂️ ·✧`,
      });
    }
    if (msg.guild.id === '366219406776336385') {
      msg.client.ch.send(msg.DM, {
        content: `**Also worth checking out:**\n<:AMcatbaby:774005429469708300> **Animekos | Anime & Art | Ayako Bot Support | 400+ Emotes | Self Promotion Channels** <:AMcatlove:774010328978686052>\n🌸 https://discord.gg/tMb3QZaWHA 🌸`,
      });
    }
    if (msg.r.finishedrole) msg.member.roles.add(msg.r.finishedrole).catch(() => {});
    if (msg.r.pendingrole) msg.member.roles.remove(msg.r.pendingrole).catch(() => {});
  },
};
