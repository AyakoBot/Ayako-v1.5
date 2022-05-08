module.exports = {
  name: 'giveaway',
  perm: 32n,
  dm: false,
  type: 'giveaway',
  execute: async (cmd) => {
    if (cmd.isAutocomplete()) {
      getExistingGiveaways(cmd);
      return;
    }

    switch (cmd.options._subcommand) {
      case 'create': {
        require('./giveaway/create')(cmd);
        break;
      }
      case 'edit': {
        require('./giveaway/edit')(cmd);
        break;
      }
      case 'end': {
        require('./giveaway/end').manualEnd(cmd);
        break;
      }
      case 'reroll': {
        require('./giveaway/reroll')(cmd);
        break;
      }
      default: {
        break;
      }
    }
  },
};

const getExistingGiveaways = async (cmd) => {
  const giveaways = await getGiveaways(cmd);

  await Promise.all(
    giveaways.map((g) => {
      const channel = cmd.client.channels.cache.get(g.channelid);
      if (!channel) return null;

      return channel.messages.fetch(g.msgid).catch(() => {});
    }),
  );

  const returnables = giveaways
    .map((g) => {
      const channel = cmd.client.channels.cache.get(g.channelid);
      if (!channel) return null;

      const message = channel.messages.cache.get(g.msgid);
      if (!message) return null;

      return {
        name: g.description.slice(0, 100),
        value: g.msgid,
      };
    })
    .filter((g) => !!g);

  cmd.respond(returnables).catch(() => {});
};

const getGiveaways = async (cmd) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM giveaways WHERE guildid = $1 AND ended = $2;`,
    [cmd.guild.id, cmd.options._subcommand === 'reroll'],
  );

  if (res && res.rowCount) return res.rows;
  return [];
};
