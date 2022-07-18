import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';
import client from '../../BaseClient/ErisClient';

export default async (
  cmd: CT.AutocompleteInteraction,
  { lan }: { lan: typeof import('../../Languages/lan-en.json')['slashCommands']['giveaway'] },
) => {
  const returnables = await getReturnables(cmd);
  if (!returnables.length) returnables.push({ name: lan.noneFound, value: 'nothing' });

  cmd.result(returnables).catch(() => null);
};

const getReturnables = async (cmd: CT.AutocompleteInteraction) => {
  const giveawaysRows = await client.ch
    .query(`SELECT * FROM giveaways WHERE guildid = $1 AND ended = $2;`, [
      cmd.guildID,
      cmd.data.options[0].name === 'reroll',
    ])
    .then((r: DBT.giveaways[] | null) => r || null);
  if (!giveawaysRows) return [];

  const messages = await Promise.all(
    giveawaysRows.map((g) => {
      const guild = client.guilds.get(g.guildid);
      if (!guild) return null;

      const channel = guild.channels.get(g.channelid) as Eris.TextableChannel;
      if (!channel) return null;

      return channel.getMessage(g.msgid).catch(() => null);
    }),
  );

  const returnables = giveawaysRows
    .map((g) => {
      const guild = client.guilds.get(g.guildid);
      if (!guild) return null;

      const channel = guild.channels.get(g.channelid) as Eris.TextableChannel;
      if (!channel) return null;

      const message = messages.find((m) => m?.id === g.msgid);
      if (!message) return null;

      return {
        name: g.description.slice(0, 100),
        value: g.msgid,
      };
    })
    .filter((g): g is { name: string; value: string } => !!g);

  return returnables;
};
