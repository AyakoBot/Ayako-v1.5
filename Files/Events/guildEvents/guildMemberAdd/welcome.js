module.exports = async (member) => {
  const row = await getWelcomeRes(member);
  if (!row) return;
  if (!row.channelid) return;

  const embed = await getEmbed(row, member);
  const channel = member.guild.channels.cache.get(row.channelid);
  let content = '';

  if (row.pingroles && row.pingroles.length) {
    content += row.pingroles.map((id) => `<@&${id}>`).join(' ');
    content += '\n';
  }
  if (row.pingusers && row.pingusers.length) {
    content += row.pingusers.map((id) => `<@${id}>`).join(' ');
  }
  if (!content.length) content = undefined;

  member.client.ch.send(
    channel,
    {
      embeds: [embed],
      content,
    },
    2000,
  );
};

const getWelcomeRes = async (member) => {
  const res = await member.client.ch.query(`SELECT * FROM welcome WHERE guildid = $1;`, [
    member.guild.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getEmbed = async (r, member) => {
  const getDefaultEmbed = async () => {
    const language = await member.client.ch.languageSelector(member.guild);

    return {
      description: language.welcome.author,
      color: member.client.ch.colorSelector(member),
    };
  };

  const options = [
    ['member', member],
    ['username', member.user.username],
    ['usertag', member.user.tag],
    ['user', member.user],
    ['serverName', member.guild.name],
  ];

  if (!r.embed) return member.client.ch.dynamicToEmbed(await getDefaultEmbed(), options);

  const res = await member.client.ch.query(
    `SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;`,
    [r.embed, member.guild.id],
  );

  let embed;

  if (res && res.rowCount) {
    const partialEmbed = member.client.ch.getDiscordEmbed(res.rows[0]);
    console.log(res.rows[0]);

    embed = member.client.ch.dynamicToEmbed(partialEmbed, options);
  } else {
    embed = member.client.ch.dynamicToEmbed(await getDefaultEmbed(), options);
  }

  return embed;
};
