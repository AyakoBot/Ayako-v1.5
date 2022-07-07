import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default (
  channel: Eris.NewsThreadChannel | Eris.PrivateThreadChannel | Eris.PublicThreadChannel,
  oldChannel: Eris.OldThread,
) => {
  client.emit('channelDelete', channel, oldChannel);
};
