import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

const cmd: CT.Command = {
  name: 'ping',
  dm: true,
  takesFirstArg: false,
  aliases: [],
  type: 'other',
  async execute(msg) {
    const m = await client.ch.reply(msg, { content: '🏓​' });
    msg.addReaction('🏓').catch(() => null);
    if (!m) return;

    let ping: number;
    if (msg.editedTimestamp) ping = m.createdAt - msg.editedTimestamp;
    else ping = m.createdAt - msg.createdAt;

    let shardPing = Number(ping);
    if (msg.guildID && client.guilds.get(msg.guildID)) {
      shardPing = client.guilds.get(msg.guildID)?.shard.latency ?? ping;
      if (shardPing === Infinity) shardPing = ping;
    }

    m.edit({
      content: `🏓 \n**Response Time:** ${ping}ms\n**Last Heartbeat:** ${shardPing}ms`,
    }).catch(() => null);
  },
};

export default cmd;
