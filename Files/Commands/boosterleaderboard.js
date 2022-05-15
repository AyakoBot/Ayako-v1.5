const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'boosterleaderboard',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['blb', 'boostertop'],
  type: 'nitro',
  async execute(msg) {
    const guildRow = await getRow(msg);
    if (!guildRow) {
      msg.client.ch.error(msg, msg.lan.disabled);
      return;
    }

    const rows = await getGuildRow(msg);
    if (!rows) {
      msg.client.ch.error(msg, msg.lan.noUsers);
      return;
    }

    const types = ['tag', 'id', 'mention'];
    const contentData = getContent(msg, 'tag', 0, rows);
    const { content, ownPos } = contentData;
    const embed = getEmbed(content, msg, ownPos, rows);
    const components = getButtons(msg, 1, rows);
    msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components });

    buttonsHandler(msg, types, ownPos, content, embed, rows);
  },
};

const buttonsHandler = (msg, types, ownPos, content, oldEmbed, rows) => {
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  let type = 'tag';
  let page = 1;

  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction);
      return;
    }
    await msg.client.ch.disableComponents(msg.m, [oldEmbed]);
    await interaction.deferUpdate().catch(() => {});
    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      case 'tt': {
        type = types[(types.indexOf(type) + 1) % types.length];
        break;
      }
      case 'next': {
        page += 1;
        break;
      }
      case 'back': {
        page -= 1;
        break;
      }
      default: {
        break;
      }
    }

    const contentData = getContent(msg, type, page, rows);
    ({ content, ownPos } = contentData);

    const embed = getEmbed(content, msg, ownPos, rows);
    oldEmbed = embed;
    const components = getButtons(msg, page, rows);
    interaction.editReply({ embeds: [embed], components });
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.disableComponents(msg.m, [getEmbed(content, msg, ownPos, rows)]);
    }
  });
};

const getEmbed = (content, msg, ownPos, rows) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(msg.client.ch.colorSelector(msg.guild.me))
    .setDescription(content || msg.lan.noUsers)
    .setAuthor({
      name: msg.lan.author,
      iconURL: msg.client.constants.commands.leaderboard.authorImage,
      url: msg.client.constants.standard.invite,
    });
  if (ownPos.name) embed.addFields(ownPos);
  embed.addFields(
    {
      name: msg.lan.allBoosters,
      value: `${rows && rows.length ? String(rows.length) : msg.language.none}`,
      inline: true,
    },
    {
      name: msg.lan.inactiveBoosters,
      value: `${
        rows && rows.length ? String(rows.filter((r) => !r.isBoosting).length) : msg.language.none
      }`,
      inline: true,
    },
    {
      name: msg.lan.currentBoosters,
      value: `${
        rows && rows.length ? String(rows.filter((r) => r.isBoosting).length) : msg.language.none
      }`,
      inline: true,
    },
  );
  return embed;
};

const getButtons = (msg, page, rows) => {
  const toggleType = new Builders.UnsafeButtonBuilder()
    .setLabel(msg.lan.toggle)
    .setCustomId('tt')
    .setStyle(Discord.ButtonStyle.Primary);

  const next = new Builders.UnsafeButtonBuilder()
    .setCustomId('next')
    .setEmoji(msg.client.objectEmotes.forth)
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(rows ? page === Math.ceil(rows.length / 30) : true);

  const back = new Builders.UnsafeButtonBuilder()
    .setCustomId('back')
    .setEmoji(msg.client.objectEmotes.back)
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(page === 1);

  return msg.client.ch.buttonRower([[toggleType], [back, next]]);
};

const getRow = async (msg) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;',
    [msg.guild.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getContent = (msg, type, page, rows) => {
  if (!page) page = 1;

  const ownPos = {};
  const index = rows?.findIndex((row) => row.userid === msg.author.id);

  if (rows) {
    let longestLevel = Math.max(...rows.map((row) => String(row.level).length));
    longestLevel = longestLevel > 6 ? longestLevel : 6;

    if (index !== -1) {
      ownPos.name = msg.lan.yourPosition;
      ownPos.value = `\`${spaces(`${index + 1}`, 6)} | ${spaces(
        `${rows[index].days}`,
        longestLevel,
      )} | \`${msg.author}`;
      ownPos.inline = false;

      rows.splice(30 * page, rows.length - 1);
      rows.splice(0, 30 * (page - 1));
    }

    let content = `\`${spaces(msg.language.rank, 7)}| ${spaces(
      msg.language.time.days,
      longestLevel,
    )} | ${msg.language.user}\`\n`;

    rows?.forEach((row, i) => {
      let user;

      switch (type) {
        case 'tag': {
          user = `${msg.client.users.cache.get(row.userid).tag}\``;
          break;
        }
        case 'id': {
          user = `${msg.client.users.cache.get(row.userid).id}\``;
          break;
        }
        case 'mention': {
          user = `\`${msg.client.users.cache.get(row.userid)}`;
          break;
        }
        default: {
          break;
        }
      }

      content += `\`${spaces(`${i + 1 + 30 * (page - 1)}`, 6)} | ${spaces(
        `${row.days}`,
        longestLevel,
      )} | ${user}\n`;
    });
    return { content, ownPos };
  }
  return { ownPos };
};

const getGuildRow = async (msg) => {
  const res = await msg.client.ch.query('SELECT * FROM nitrousers WHERE guildid = $1;', [
    msg.guild.id,
  ]);
  if (res && res.rowCount) {
    await Promise.all(
      res.rows.map((r) => {
        if (!msg.client.users.cache.get(r.userid)) {
          return msg.client.users.fetch(r.userid).catch(() => {});
        }
        return null;
      }),
    );

    await Promise.all(
      res.rows.map((r) => {
        if (!msg.guild.members.cache.get(r.userid)) {
          return msg.guild.members.fetch(r.userid).catch(() => {});
        }
        return null;
      }),
    );

    let usersWithDays = res.rows.slice();
    usersWithDays = usersWithDays.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.userid === value.userid && t.guildid === value.guildid),
    );

    usersWithDays.forEach((user) => {
      const entries = res.rows.filter(
        (u) => u.userid === user.userid && u.guildid === user.guildid,
      );
      const days = entries.map((e) => getDays(e.booststart, e.boostend ? e.boostend : Date.now()));

      const totalDays = days.reduce((a, b) => a + b, 0);
      user.days = totalDays;

      const member = msg.guild.members.cache.get(user.userid);
      if (member.premiumSinceTimestamp) user.isBoosting = true;
    });
    return usersWithDays.sort((b, a) => a.days - b.days);
  }
  return null;
};

const spaces = (str, num) => {
  if (num < str.length) return str;
  return `${str}${' '.repeat(num - str.length)}`;
};

const getDays = (start, end) => {
  const timeDiff = Math.abs(start - end);
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};
