import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';
import client from '../../BaseClient/ErisClient';

export default async (
  cmd: CT.ComponentInteraction,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  if (!cmd.member) return;
  if (!cmd.guildID) return;
  if (!cmd.guild) return;

  const lan = language.slashCommands.giveaway.participate;
  const giveaway = await client.ch
    .query(`SELECT * FROM giveaways WHERE msgid = $1 AND guildid = $2 AND ended = false;`, [
      cmd.message.id,
      cmd.guild.id,
    ])
    .then((r: DBT.giveaways[] | null) => (r ? r[0] : null));

  if (!giveaway) return;

  if (giveaway.reqrole && !cmd.member.roles.includes(giveaway.reqrole)) {
    client.ch.error(cmd, lan.cantEnter, language);
    return;
  }

  if (!giveaway.participants) giveaway.participants = [];

  if (giveaway.participants.includes(cmd.user.id)) {
    giveaway.participants.splice(giveaway.participants.indexOf(cmd.user.id), 1);
    const embed: Eris.Embed = {
      type: 'rich',
      color: client.constants.colors.warning,
      description: lan.left,
    };

    client.ch.reply(cmd, { embeds: [embed], ephemeral: true }, language);
  } else {
    giveaway.participants.push(cmd.user.id);

    const embed: Eris.Embed = {
      type: 'rich',
      color: client.constants.colors.success,
      description: lan.entered,
    };

    client.ch.reply(cmd, { embeds: [embed], ephemeral: true }, language);
  }

  const embed = cmd.message.embeds[0];
  embed.title = `${giveaway.participants.length} ${lan.participants}`;

  await cmd.message.edit({ embeds: [embed] }).catch(() => null);
  await client.ch.query(
    `UPDATE giveaways SET participants = $1 WHERE msgid = $2 AND guildid = $3;`,
    [giveaway.participants, cmd.message.id, cmd.guild.id],
  );
};
