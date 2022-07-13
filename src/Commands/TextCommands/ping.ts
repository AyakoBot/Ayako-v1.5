import type CT from '../typings/CustomTypings';
import client from '../BaseClient/ErisClient';

const cmd: CT.Command = {
  name: 'ping',
  dm: true,
  takesFirstArg: false,
  aliases: [],
  type: 'other',
  async execute(msg, { language }) {
    const m = await client.ch.reply(msg, { content: '🏓​' }, language);
    msg.addReaction('🏓').catch(() => null);
    if (!m) return;

    let ping;
    if (msg.editedTimestamp) ping = m.createdAt - msg.editedTimestamp;
    else ping = m.createdAt - msg.createdAt;

    let shardPing = ping;
    if (msg.guildID && client.guilds.get(msg.guildID)) {
      shardPing = client.guilds.get(msg.guildID)?.shard.latency ?? ping;
      if (shardPing === Infinity) shardPing = ping;
    }

    client.ch.edit(m, {
      content: `🏓 \n**Response Time:** ${ping}ms\n**Last Heartbeat:** ${shardPing}ms`,
    });
  },
};

export default cmd;
