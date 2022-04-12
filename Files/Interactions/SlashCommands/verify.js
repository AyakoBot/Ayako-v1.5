const Discord = require('discord.js');
const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');
const { CaptchaGenerator } = require('captcha-canvas');

module.exports = {
  name: 'verify_message_button',
  perm: null,
  dm: false,
  takesFirstArg: false,
  category: 'Automation',
  description: 'Verify on a Server',
  aliases: [],
  type: 'auto',
  execute: async (cmd, language) => {
    const lan = language.verification;

    const res = await cmd.client.ch.query(
      'SELECT * FROM verification WHERE guildid = $1 AND active = $2;',
      [cmd.guild.id, true],
    );
    if (res && res.rowCount > 0) {
      const [r] = res.rows;
      let logchannel;
      if (r.startchannel !== cmd.channel.id) return;
      if (r.pendingrole && !cmd.member.roles.cache.has(r.pendingrole)) {
        cmd.client.ch.reply(cmd, {
          content: lan.alreadyVerified,
          ephemeral: true,
        });
        return;
      }
      if (!cmd.member.roles.cache.has(r.finishedrole)) {
        const DM = await cmd.user.createDM().catch(() => {});
        if (DM && DM.id) {
          cmd.DM = DM;
          cmd.r = r;
          module.exports.startProcess(cmd, null, logchannel, { lan, language });
        }
      } else {
        cmd.client.ch.reply(cmd, {
          content: lan.alreadyVerified,
          ephemeral: true,
        });
      }
    }
  },
  startProcess: async (cmd, answer, logchannel, { lan, language }) => {
    if (cmd.m) await cmd.m.removeAttachments();
    else {
      cmd.client.ch.reply(cmd, {
        content: lan.checkDMs,
        ephemeral: true,
      });
    }

    if (cmd.r.logchannel) logchannel = cmd.guild.channels.cache.get(cmd.r.logchannel);
    if (logchannel) {
      const log = new Builders.UnsafeEmbedBuilder()
        .setDescription(cmd.client.ch.stp(lan.log.start, { user: cmd.user }))
        .setAuthor({
          name: cmd.user.tag,
          iconURL: cmd.user.displayAvatarURL({ size: 4096 }),
        })
        .setTimestamp()
        .setColor();
      cmd.client.ch.send(logchannel, { embeds: [log] });
    }

    const file = await module.exports.generateImage();
    cmd.client.verificationCodes.set(`${cmd.DM.id}-${cmd.guild.id}`, file.captcha.text);
    const { r } = cmd;

    const embed = new Builders.UnsafeEmbedBuilder()
      .setImage(`attachment://${file.name}`)
      .setAuthor({
        name: lan.author.name,
        iconURL: cmd.client.constants.standard.image,
        url: cmd.client.constants.standard.invite,
      })
      .setDescription(cmd.client.ch.stp(lan.description, { guild: cmd.guild }))
      .addFields({ name: language.hint, value: lan.hintmsg })
      .setColor(cmd.client.constants.standard.color);

    const regenerate = new Builders.UnsafeButtonBuilder()
      .setCustomId('regenerate')
      .setLabel(language.regenerate)
      .setStyle(Discord.ButtonStyle.Secondary);

    if (answer) {
      await answer
        .update({
          embeds: [embed],
          components: cmd.client.ch.buttonRower([regenerate]),
          files: [file],
        })
        .catch(() => {});
    } else if (cmd.m) {
      await cmd.m
        .edit({
          embeds: [embed],
          components: cmd.client.ch.buttonRower([regenerate]),
          files: [file],
        })
        .catch(() => {});
    } else {
      cmd.m = await cmd.client.ch.send(cmd.DM, {
        embeds: [embed],
        components: cmd.client.ch.buttonRower([regenerate]),
        files: [file],
      });
    }
    if (!cmd.m || !cmd.m.id) {
      return cmd.client.ch.reply(cmd, cmd.client.channels.cache.get(r.startchannel), {
        content: cmd.client.ch.stp(lan.openDMs, {
          user: cmd.user,
          prefix: cmd.client.constants.standard.prefix,
        }),
        ephemeral: true,
      });
    }
    const buttonsCollector = cmd.m.createMessageComponentCollector({ time: 120000 });
    const messageCollector = cmd.DM.createMessageCollector({ time: 120000 });
    buttonsCollector.on('collect', (clickButton) => {
      if (clickButton.customId === 'regenerate') {
        buttonsCollector.stop();
        messageCollector.stop();

        cmd.client.verificationCodes.delete(`${clickButton.channel.id}-${cmd.guild.id}`);

        return module.exports.startProcess(cmd, clickButton, logchannel, { lan, language });
      }
      return null;
    });

    messageCollector.on('collect', async (message) => {
      buttonsCollector.stop();
      messageCollector.stop();
      if (cmd.user.id !== message.author.id && message.embeds[0]) {
        cmd.m.delete().catch(() => {});
        return;
      }
      if (message.content.toLowerCase() === language.cancel.toLowerCase()) {
        cmd.m.delete().catch(() => {});
        cmd.client.ch.reply(message, { content: language.aborted });
        return;
      }

      const captcha = cmd.client.verificationCodes.get(`${message.channel.id}-${cmd.guild.id}`);

      if (!captcha) {
        cmd.client.ch.reply(message, { content: `${language.error} ${lan.error}` });
        cmd.client.ch.send(
          cmd.client.channels.cache.get('726252103302905907', {
            content: `${message.channel.id}-${cmd.guild.id} did not exist in Verification Codes, check console`,
          }),
        );
        return;
      }

      if (message.content.toLowerCase() === captcha.toLowerCase()) {
        cmd.client.verificationCodes.delete(`${message.channel.id}-${cmd.guild.id}`);
        module.exports.finished(cmd, logchannel, { lan, language });
        return;
      }
      const ms = await cmd.client.ch.send(cmd.DM, {
        content: cmd.client.ch.stp(lan.wrongInput, { solution: captcha }),
      });
      jobs.scheduleJob(new Date(Date.now() + 10000), () => {
        ms?.delete().catch(() => {});
      });
      cmd.client.verificationCodes.delete(`${message.channel.id}-${cmd.guild.id}`);
      module.exports.startProcess(cmd, null, logchannel, { lan, language });
    });

    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        messageCollector.stop();
        cmd.client.verificationCodes.delete(
          `${buttonsCollector.options.message.channelId.id}-${cmd.guild.id}`,
        );
        if (cmd.m) await cmd.m.removeAttachments();
        cmd.m
          .edit({
            embeds: [],
            components: [],
            content: `${cmd.client.ch.stp(lan.timeError, {
              channel: r.startchannel,
              prefix: cmd.client.constants.standard.prefix,
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
  finished: async (cmd, logchannel, { lan, language }) => {
    if (logchannel) {
      const log = new Builders.UnsafeEmbedBuilder()
        .setDescription(cmd.client.ch.stp(language.verification?.log?.end, { user: cmd.user }))
        .setAuthor({
          name: cmd.user.tag,
          iconURL: cmd.user.displayAvatarURL({ size: 4096 }),
        })
        .setTimestamp()
        .setColor();
      cmd.client.ch.send(logchannel, { embeds: [log] });
    }
    const embed = new Builders.UnsafeEmbedBuilder()
      .setTitle(
        lan.author.name,
        cmd.client.constants.standard.image,
        cmd.client.constants.standard.invite,
      )
      .setDescription(cmd.client.ch.stp(lan.finishDesc, { guild: cmd.guild }))
      .setColor(cmd.client.constants.standard.color);
    cmd.client.ch.send(cmd.DM, { embeds: [embed] });
    if (cmd.guild.id === '298954459172700181') {
      cmd.client.ch.send(cmd.DM, {
        content: `**Also worth checking out:**\n💁‍♀️ Kimetsu No Yaiba┊Demon Slayer┊500 Demon Slayer Emojis & Stickers┊Unique & Fun┊Active┊Chatting┊VC┊& much more! 💜 \nㅤㅤㅤ╰─ ʚ ୨୧ ɞ ─╮\nF✧· 🐛 https://discord.gg/k76uPAzsSW ☂️ ·✧`,
      });
    }
    if (cmd.guild.id === '366219406776336385') {
      cmd.client.ch.send(cmd.DM, {
        content: `**Also worth checking out:**\n<:AMcatbaby:774005429469708300> **Animekos | Anime & Art | Ayako Bot Support | 400+ Emotes | Self Promotion Channels** <:AMcatlove:774010328978686052>\n🌸 https://discord.gg/tMb3QZaWHA 🌸`,
      });
    }
    if (cmd.r.finishedrole) cmd.member.roles.add(cmd.r.finishedrole).catch(() => {});
    if (cmd.r.pendingrole) cmd.member.roles.remove(cmd.r.pendingrole).catch(() => {});
  },
};
