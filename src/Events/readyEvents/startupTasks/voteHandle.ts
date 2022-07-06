/* eslint-disable no-console */
import io from 'socket.io-client';
import client from '../../../BaseClient/ErisClient';
import type CT from '../../../typings/CustomTypings';

export default async () => {
  client.emit('voteAdd');

  const socket = io('https://ayakobot.com', {
    transports: ['websocket'],
    auth: {
      reason: 'top_gg_votes',
    },
  });

  socket.on('TOP_GG_BOT', async (voteData: CT.TopGGBotVote) => {
    console.log(`User ${voteData.user} has voted for Ayako`);
    client.emit('voteCreate', voteData);
  });

  socket.on('TOP_GG_SERVER', async (voteData: CT.TopGGBotVote) => {
    console.log(`User ${voteData.user} has voted for Animekos`);
    client.emit('voteCreate', voteData);
  });
};
