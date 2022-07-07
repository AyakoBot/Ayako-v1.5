import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default (
  channel: Eris.NewsThreadChannel | Eris.PrivateThreadChannel | Eris.PublicThreadChannel,
) => {
  client.emit('channelDelete', channel);
};
