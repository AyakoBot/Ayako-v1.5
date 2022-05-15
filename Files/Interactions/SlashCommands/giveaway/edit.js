const Builders = require('@discordjs/builders');
const Discord = require('discord.js');
const jobs = require('node-schedule');
const ms = require('ms');

module.exports = async (cmd) => {
  const options = cmd.options._hoistedOptions;
  const description = options.find((o) => o.name === 'prize-description')?.value;
  const winnerCount = options.find((o) => o.name === 'winners')?.value;
  const role = options.find((o) => o.name === 'role')?.role;
  const rawTime = options.find((o) => o.name === 'time')?.value;
  const actualPrize = options.find((o) => o.name === 'actual-prize')?.value;
  const host = options.find((o) => o.name === 'host')?.user;
  const msgid = options.find((o) => o.name === 'giveaway').value;
  const lan = cmd.lan.edit;

  const insert = {};

  if (rawTime) insert.endtime = handleEndTime(cmd, rawTime, lan);
  if (description) insert.description = description;
  if (winnerCount) insert.winnercount = winnerCount;
  if (role) insert.reqrole = role.id;
  if (actualPrize) insert.actualprize = actualPrize;
  if (host) insert.host = host.id;

  if (!Object.keys(insert).length) {
    cmd.client.ch.error(cmd, lan.noChanges);
    return;
  }

  let updateQuery = 'UPDATE giveaways SET '; // `
  const args = [];

  Object.keys(insert).forEach((key, i) => {
    updateQuery += `${key} = $${i + 2}`;
    args.push(insert[key]);
    if (i < Object.keys(insert).length - 1) updateQuery += ', ';
  });

  await cmd.client.ch.query(`${updateQuery} WHERE msgid = $1;`, [msgid, ...args]);
  const updatedGiveaway = await getGiveaway(cmd, msgid);
  if (!updatedGiveaway) return;

  if (insert.endtime) rescheduleGiveaway(cmd, updatedGiveaway, msgid);

  if (description || winnerCount || role || rawTime || host) {
    updateEmbed(cmd, updatedGiveaway);
  }

  cmd.client.ch.reply(cmd, {
    content: lan.success,
    ephemeral: true,
    components: cmd.client.ch.buttonRower([
      [
        new Builders.UnsafeButtonBuilder()
          .setURL(
            cmd.client.ch.stp(cmd.client.constants.standard.discordUrlDB, {
              guildid: updatedGiveaway.guildid,
              channelid: updatedGiveaway.channelid,
              messageid: updatedGiveaway.msgid,
            }),
          )
          .setLabel(lan.button)
          .setStyle(Discord.ButtonStyle.Link),
      ],
    ]),
  });
};

const getGiveaway = async (cmd, msgid) => {
  const res = await cmd.client.ch.query(`SELECT * FROM giveaways WHERE msgid = $1;`, [msgid]);
  if (!res || !res.rowCount) return null;
  return res.rows[0];
};

const rescheduleGiveaway = (cmd, giveaway, msgid) => {
  cmd.client.giveaways.get(msgid)?.cancel();

  cmd.client.giveaways.set(
    msgid,
    jobs.scheduleJob(new Date(Number(giveaway.endtime)), () => {
      require('./end').end(giveaway);
    }),
  );
};

const handleEndTime = (cmd, rawTime, lan) => {
  const endtime = getEndTime(rawTime);
  if (!endtime) {
    cmd.client.ch.error(cmd, lan.invalidTime);
    return null;
  }
  return endtime;
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

const updateEmbed = async (cmd, giveaway) => {
  const lan = cmd.language.slashCommands.giveaway.create;
  const host = (await cmd.client.users.fetch(giveaway.host).catch(() => {})) || cmd.user;
  const channel = cmd.client.channels.cache.get(giveaway.channelid);
  if (!channel) return;
  const message = channel.messages.cache.get(giveaway.msgid);
  if (!message) return;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.author,
      iconURL: cmd.client.objectEmotes.gift.link,
      url: cmd.client.constants.standard.invite,
    })
    .setColor(cmd.client.ch.colorSelector(cmd.guild.members.me))
    .setDescription(giveaway.description)
    .setTitle(`${giveaway.participants.length} ${lan.participants}`)
    .addFields({
      name: `${lan.winners} ${giveaway.winnercount}`,
      value: `${lan.end} <t:${String(giveaway.endtime).slice(0, -3)}:R> (<t:${String(
        giveaway.endtime,
      ).slice(0, -3)}>)`,
    })
    .setFooter({ text: `${lan.host}: ${host.tag}`, iconURL: host.displayAvatarURL() });

  if (giveaway.reqrole) {
    embed.addFields({
      name: lan.roleRequire,
      value: `<@&${giveaway.reqrole}>`,
      inline: true,
    });
  }

  const participateButton = new Builders.UnsafeButtonBuilder()
    .setCustomId('giveaway_participate')
    .setLabel(lan.participate)
    .setStyle(Discord.ButtonStyle.Success)
    .setEmoji(cmd.client.objectEmotes.gift);

  message.client.ch.edit(message, {
    embeds: [embed],
    components: cmd.client.ch.buttonRower([[participateButton]]),
  });
};
