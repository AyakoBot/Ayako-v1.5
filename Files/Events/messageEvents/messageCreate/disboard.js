module.exports = {
  execute: async (msg) => {
    if (msg.author.id !== '302050872383242240') return;
    if (!msg.embeds[0]) return;
    if (!msg.embeds[0].data.color) return;

    if (
      msg.embeds[0].data.color === '2406327' &&
      msg.embeds[0].data.image?.url?.includes('bot-command-image-bump.png')
    ) {
      const res = await msg.client.ch.query(
        'SELECT * FROM disboard WHERE guildid = $1 AND active = true;',
        [msg.guild.id],
      );

      if (res && res.rowCount > 0) {
        if (res.rows[0].enabled) msg.react(msg.client.objectEmotes.tick.id).catch(() => {});

        if (res.rows[0].channelid) {
          msg.client.ch.query(
            'UPDATE disboard SET lastbump = $2, channelid = $3 WHERE guildid = $1;',
            [msg.guild.id, +Date.now() + 7200000, res.rows[0].channelid],
          );
        } else {
          msg.client.ch.query(
            'UPDATE disboard SET lastbump = $2, channelid = $3 WHERE guildid = $1;',
            [msg.guild.id, +Date.now() + 7200000, msg.channel.id],
          );
        }

        getUser(msg);
      }
    }
  },
};

const getUser = async (msg) => {
  const msgs = await msg.channel.messages.fetch({ limit: 10 }).catch(() => []);

  if (msgs.size) {
    const possibleMsgs = msgs.filter((m) => m.content === '!d bump');
    const answer = msgs
      .filter(
        (m) =>
          m.author.id === '302050872383242240' &&
          m.embeds[0]?.data?.image?.url?.includes('bot-command-image-bump.png'),
      )
      .first();

    const timestamp = possibleMsgs
      .map((m) => m.createdTimestamp)
      .reduce((prev, curr) =>
        Math.abs(curr - answer.createdTimestamp) < Math.abs(prev - answer.createdTimestamp)
          ? curr
          : prev,
      )[0];

    const m = msgs.find((me) => me.createdTimestamp === timestamp);

    msg.client.ch.query(
      `INSERT INTO disboardleaderboard (guildid, userid, bumps) VALUES ($1, $2, 1) ON CONFLICT (guildid, userid) DO UPDATE SET bumps = bumps + 1;`,
      [msg.guild.id, m.author.id],
    );
  }
};
