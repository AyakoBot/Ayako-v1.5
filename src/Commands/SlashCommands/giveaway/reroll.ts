import type * as Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  cmd: CT.CommandInteraction,
  {
    lan: lang,
    language,
  }: {
    language: typeof import('../../../Languages/lan-en.json');
    lan: typeof import('../../../Languages/lan-en.json')['slashCommands']['giveaway'];
  },
) => {
  if (!cmd.guild) return;
  if (!cmd.data.options?.[0]) return;
  if (!('options' in cmd.data.options[0])) return;
  const { options } = cmd.data.options[0];
  if (!options) return;

  const msgid = client.ch.util.checkVal(options.find((o) => o.name === 'giveaway'));
  const lan = lang.reroll;
  const giveawaysRow = await client.ch
    .query(`SELECT * FROM giveaways WHERE msgid = $1;`, [msgid])
    .then((r: DBT.giveaways[] | null) => (r ? r[0] : null));

  if (!giveawaysRow) return;

  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.success,
    description: lan.rerolled,
  };

  const getToGiveawayButton: Eris.Button = {
    type: 2,
    url: client.ch.stp(client.constants.standard.discordUrlDB, {
      guildid: giveawaysRow.guildid,
      channelid: giveawaysRow.channelid,
      messageid: giveawaysRow.msgid,
    }),
    label: lan.button,
    style: 5,
  };

  client.ch.reply(
    cmd,
    {
      embeds: [embed],
      ephemeral: true,
      components: client.ch.buttonRower([[getToGiveawayButton]]),
    },
    language,
  );

  (await import('./end')).end(giveawaysRow, lang.end, language, true);
};
