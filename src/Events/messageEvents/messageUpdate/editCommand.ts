import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';
import { getCommand } from '../messageCreate/commandHandler';

export default async (msg: CT.Message, oldMsg: Eris.OldMessage) => {
  editCommand(msg, oldMsg);

  if (!msg.edits) msg.edits = [oldMsg];
  else msg.edits.push(oldMsg);
};

const editCommand = async (msg: CT.Message, oldMsg: Eris.OldMessage) => {
  if (!oldMsg || !msg || !oldMsg.content || !msg.content) return;
  if (oldMsg.content === msg.content) return;
  if (oldMsg.pinned !== msg.pinned) return;

  let prefix;
  const prefixStandard = client.constants.standard.prefix;
  let prefixCustom;

  if (msg.channel.type !== 1) {
    prefixCustom = await client.ch
      .query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guildID])
      .then((r: DBT.guildsettings[] | null) => (r ? r[0].prefix : null));
  }

  if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
  else if (prefixCustom && msg.content.toLowerCase().startsWith(prefixCustom)) {
    prefix = prefixCustom;
  } else return;

  if (!prefix) return;

  const args = msg.content.slice(prefix.length).split(/ +/);
  const { file: command } = await getCommand(args);

  if (!command) return;

  client.emit('messageCreate', msg);
};
