import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';
import client from '../../BaseClient/ErisClient';

type AutoCompleteOptionsString = {
  value: string;
  type: 3;
  name: string;
  focused: boolean;
};

const run: CT.AutocompleteCommand = async (cmd: CT.AutocompleteInteraction) => {
  const enteredLetters = (
    cmd.data.options.find((o) => o.name === 'reason') as AutoCompleteOptionsString
  )?.value;

  const allPunishmentsArrays = await getAllPunishments(cmd);
  if (!allPunishmentsArrays) {
    return [
      {
        name: cmd.language.slashCommands.strike.noneFound,
        value: cmd.language.noReasonProvided,
      },
    ];
  }

  const countedReasons: { reason: string; amount: number }[] = [];

  allPunishmentsArrays
    .flat(1)
    .map((r) => r.reason)
    .filter((r): r is string => !!r)
    .filter((r) => r.includes(enteredLetters))
    .forEach((r) => {
      const existing = countedReasons.find((c) => c.reason === r);
      if (existing && existing.reason === r) existing.amount += 1;
      countedReasons.push({ reason: r, amount: 1 });
    });

  return countedReasons
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 25)
    .map((c) => ({ name: c.reason, value: c.reason }));
};

const getAllPunishments = async (cmd: CT.AutocompleteInteraction) =>
  client.ch
    .query(
      `SELECT * FROM punish_bans WHERE guildid = $1 AND executorid != $2;
  SELECT * FROM punish_channelbans WHERE guildid = $1 AND executorid != $2;
  SELECT * FROM punish_mutes WHERE guildid = $1 AND executorid != $2;
  SELECT * FROM punish_kicks WHERE guildid = $1 AND executorid != $2;
  SELECT * FROM punish_warns WHERE guildid = $1 AND executorid != $2;`,
      [cmd.guildID, client.user.id],
    )
    .then(
      (
        r:
          | (
              | DBT.punish_bans[]
              | DBT.punish_channelbans[]
              | DBT.punish_kicks[]
              | DBT.punish_mutes[]
              | DBT.punish_warns[]
            )[]
          | null,
      ) => r,
    );

export default run;
