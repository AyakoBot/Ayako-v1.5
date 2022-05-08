const ms = require('ms');
const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = async (cmd) => {
  const options = cmd.options._hoistedOptions;
  const { channel } = options.find((o) => o.name === 'channel');
  const description = options.find((o) => o.name === 'prize-description').value;
  const winnerCount = options.find((o) => o.name === 'winners').value;
  const rawTime = options.find((o) => o.name === 'time').value;
  const role = options.find((o) => o.name === 'role')?.role;
  const actualPrize = options.find((o) => o.name === 'actual-prize')?.value;
  const host = options.find((o) => o.name === 'host')?.user || cmd.user;
  const perms = cmd.guild.me.permissionsIn(channel.id);
  const lan = cmd.lan.create;

  if (!perms.has(3072n)) {
    cmd.client.ch.error(cmd, lan.missingPermissions);
    return;
  }

  const endtime = getEndTime(rawTime);
  if (!endtime) {
    cmd.client.ch.error(cmd, lan.invalidTime);
    return;
  }

  const m = await createGiveaway(cmd, lan, {
    description,
    role,
    endtime,
    winnerCount,
    host,
    channel,
  });

  if (!m) {
    cmd.client.ch.error(cmd, lan.error);
    return;
  }

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(cmd.client.constants.colors.success)
    .setDescription(cmd.client.ch.stp(lan.sent, { channel }));

  cmd.client.ch.reply(cmd, { embeds: [embed], ephemeral: true });

  cmd.client.giveaways.set(
    m.id,
    jobs.scheduleJob(new Date(Number(endtime)), () => {
      require('./end').end({
        guildid: cmd.guild.id,
        channelid: channel.id,
        msgid: m.id,
        description,
        winnercount: winnerCount,
        endtime,
        reqrole: role?.id,
        actualprize: actualPrize,
        host: host.id,
      });
    }),
  );

  await cmd.client.ch.query(
    `INSERT INTO giveaways
  (guildid, msgid, description, winnercount, endtime, reqrole, actualprize, host, ended, channelid) VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, false, $9);`,
    [
      cmd.guild.id,
      m.id,
      description,
      winnerCount,
      endtime,
      role?.id,
      actualPrize,
      host.id,
      channel.id,
    ],
  );
};

const createGiveaway = (cmd, lan, { description, role, endtime, winnerCount, host, channel }) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.author,
      iconURL: cmd.client.objectEmotes.gift.link,
      url: cmd.client.constants.standard.invite,
    })
    .setColor(cmd.client.ch.colorSelector(cmd.guild.me))
    .setDescription(description)
    .setTitle(`0 ${lan.participants}`)
    .addFields({
      name: `${lan.winners} ${winnerCount}`,
      value: `${lan.end} <t:${String(endtime).slice(0, -3)}:R> (<t:${String(endtime).slice(
        0,
        -3,
      )}>)`,
    })
    .setFooter({ text: `${lan.host}: ${host.tag}`, iconURL: host.displayAvatarURL() });

  if (role) {
    embed.addFields({
      name: lan.roleRequire,
      value: `${role}`,
      inline: true,
    });
  }

  const participateButton = new Builders.UnsafeButtonBuilder()
    .setCustomId('giveaway_participate')
    .setLabel(lan.participate)
    .setStyle(Discord.ButtonStyle.Success)
    .setEmoji(cmd.client.objectEmotes.gift);

  return cmd.client.ch.send(channel, {
    embeds: [embed],
    components: cmd.client.ch.buttonRower([[participateButton]]),
  });
};

const getEndTime = (value) => {
  const args = value
    .split(/ +/)
    .map((a) => (ms(a.replace(/,/g, '.')) ? ms(a.replace(/,/g, '.')) : a));

  let skip;
  const timeArgs = args.map((a, i) => {
    if (i === skip) return null;
    if (ms(`${a} ${args[i + 1]}`)) {
      skip = i + 1;
      return ms(`${a} ${args[i + 1]}`);
    }
    return ms(`${a}`);
  });

  const endTime = timeArgs.filter((a) => !!a).reduce((a, b) => a + b, Date.now());

  return endTime;
};
