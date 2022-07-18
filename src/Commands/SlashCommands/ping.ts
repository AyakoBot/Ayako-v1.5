import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';
import client from '../../BaseClient/ErisClient';

export default {
  name: 'ping',
  perm: null,
  dm: true,
  type: 'other',
  execute: async (
    cmd: CT.CommandInteraction,
    { language }: { language: typeof import('../../Languages/lan-en.json') },
  ) => {
    const heartbeat = await client.ch
      .query('SELECT heartbeat FROM stats;')
      .then((r: DBT.stats[] | null) => (r ? Number(r[0].heartbeat) : null));

    let shardPing = Number(heartbeat);
    if (cmd.guildID && client.guilds.get(cmd.guildID)) {
      shardPing = client.guilds.get(cmd.guildID)?.shard.latency ?? Number(heartbeat);
      if (shardPing === Infinity) shardPing = Number(heartbeat);
    }

    client.ch.reply(
      cmd,
      {
        content: `🏓 \n**Response Time:** ${shardPing}ms\n**Last Heartbeat:** ${heartbeat}ms`,
        ephemeral: true,
      },
      language,
    );
  },
};
