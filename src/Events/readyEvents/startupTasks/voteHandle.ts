/* eslint-disable no-console */
import io from 'socket.io-client';
import client from '../../../BaseClient/ErisClient';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import auth from '../../../BaseClient/auth.json' assert { type: 'json' };

export default async () => {
  const socket = io('https://ayakobot.com', {
    transports: ['websocket'],
    auth: {
      reason: 'top_gg_votes',
      code: auth.socketToken,
    },
  });

  socket.on('TOP_GG', async (voteData: CT.TopGGBotVote | CT.TopGGGuildVote) => {
    const tokenRow = await client.ch
      .query(`SELECT guildid FROM votetokens WHERE token = $1;`, [voteData.authorization])
      .then((r: DBT.votetokens[] | null) => (r ? r[0] : null));
    if (!tokenRow) return;

    const guild = client.guilds.get(tokenRow.guildid);
    if (!guild) return;

    if (!('bot' in voteData)) voteData.guildID = String(voteData.guild);
    voteData.guild = guild;

    client.emit('voteCreate', voteData);
  });
};
