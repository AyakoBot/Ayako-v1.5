const Discord = require('discord.js');

module.exports = {
  name: 'disboardleaderboard',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['dlb', 'dleaderboard', 'disboardlb'],
  type: 'fun',
  async execute(msg) {
    const guildRow = await getRow(msg);
    if (guildRow && guildRow.active === false) {
      msg.client.ch.error(msg, msg.lan.disabled);
      return;
    }

    const types = ['tag', 'id', 'mention'];
    const contentData = await getContent(msg, 'tag');

    if (contentData) {
      const { rows, content, ownPos } = contentData;
      const embed = getEmbed(content, msg, ownPos);
      const components = getButtons(msg, 1, rows);
      msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components });
      buttonsHandler(msg, types, ownPos, content, embed);
    } else {
      const embed = getEmbed(msg.lan.noBumps, msg);
      msg.m = await msg.client.ch.reply(msg, { embeds: [embed] });
    }
  },
};

const buttonsHandler = (msg, types, ownPos, content, oldEmbed) => {
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  let type = 'tag';
  let page = 1;

  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction);
      return;
    }
    await disableComponents(msg, oldEmbed);
    await interaction.deferUpdate();
    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      default: {
        break;
      }
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
    }

    const contentData = await getContent(msg, type, page);
    const { rows } = contentData;
    ({ content, ownPos } = contentData);

    const embed = getEmbed(content, msg, ownPos);
    oldEmbed = embed;
    const components = getButtons(msg, page, rows);
    interaction.editReply({ embeds: [embed], components });
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.m.edit({ embeds: [getEmbed(content, msg, ownPos)], components: [] });
    }
  });
};

const getEmbed = (content, msg, ownPos) => {
  const embed = new Discord.MessageEmbed()
    .setColor(msg.client.ch.colorSelector(msg.guild.me))
    .setDescription(content)
    .setAuthor({
      name: msg.lan.author,
      iconURL: msg.client.constants.commands.leaderboard.authorImage,
      url: msg.client.constants.standard.invite,
    });
  if (ownPos?.name) embed.addFields(ownPos);
  return embed;
};

const getButtons = (msg, page, rows) => {
  const toggleType = new Discord.MessageButton()
    .setLabel(msg.lan.toggle)
    .setCustomId('tt')
    .setStyle('PRIMARY');

  const next = new Discord.MessageButton()
    .setCustomId('next')
    .setEmoji(msg.client.constants.emotes.forth)
    .setStyle('SECONDARY')
    .setDisabled(page === Math.ceil(rows.length / 30));

  const back = new Discord.MessageButton()
    .setCustomId('back')
    .setEmoji(msg.client.constants.emotes.back)
    .setStyle('SECONDARY')
    .setDisabled(page === 1);

  return msg.client.ch.buttonRower([[toggleType], [back, next]]);
};

const getRow = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM disboardleaderboard WHERE guildid = $1;`, [
    msg.guild.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getContent = async (msg, type, page) => {
  if (!page) page = 1;

  const rows = await getGuildRow(msg);
  if (!rows) return null;

  const returnedRow = msg.client.ch.objectClone(rows);

  const ownPos = {};

  const index = rows.findIndex((row) => row.userid === msg.author.id);
  if (index !== -1) {
    ownPos.name = msg.lan.yourPosition;
    ownPos.value = `\`${spaces(`${index + 1}`, 6)} | ${spaces(`${rows[index].bumps}`, 6)} | \`${
      msg.author
    }`;
  }

  rows.splice(30 * page, rows.length - 1);
  rows.splice(0, 30 * (page - 1));

  let content = `\`${spaces(msg.language.rank, 7)}| ${spaces(msg.language.bumps, 7)}| ${
    msg.language.user
  }\`\n`;

  const users = await Promise.all(
    rows.map((r) => {
      if (msg.client.users.cache.get(r.userid)) return msg.client.users.cache.get(r.userid);
      return msg.client.users.fetch(r.userid).catch(() => {});
    }),
  );

  rows.forEach((row, i) => {
    let user;

    switch (type) {
      default: {
        break;
      }
      case 'tag': {
        user = `${users[i].tag}\``;
        break;
      }
      case 'id': {
        user = `${users[i].id}\``;
        break;
      }
      case 'mention': {
        user = `\`${users[i]}`;
      }
    }

    content += `\`${spaces(`${i + 1 + 30 * (page - 1)}`, 6)} | ${spaces(
      `${row.bumps}`,
      6,
    )} | ${user}\n`;
  });

  return { content, rows: returnedRow, ownPos };
};

const getGuildRow = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM disboardleaderboard WHERE guildid = $1 ORDER BY bumps DESC;`,
    [msg.guild.id],
  );
  if (res && res.rowCount) return res.rows;
  return null;
};

const spaces = (str, num) => {
  if (num < str.length) return str;
  return `${str}${' '.repeat(num - str.length)}`;
};

const disableComponents = async (msg, embed) => {
  msg.m.components.forEach((componentRow, i) => {
    componentRow.components.forEach((component, j) => {
      msg.m.components[i].components[j].disabled = true;
    });
  });

  await msg.m.edit({ embeds: [embed], components: msg.m.components });
};
