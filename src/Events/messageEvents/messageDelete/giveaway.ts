import client from '../../../BaseClient/ErisClient';
import type CT from '../../../typings/CustomTypings';

export default async (msg: CT.Message) => {
  client.ch.query(`DELETE FROM giveaways WHERE msgid = $1;`, [msg.id]);

  const g = client.giveaways.get(msg.id);
  if (g) {
    g.cancel();
    client.giveaways.delete(`${msg.id}-${msg.guildID}`);
  }
};
