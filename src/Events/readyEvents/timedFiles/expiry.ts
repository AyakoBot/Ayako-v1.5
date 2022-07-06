import moment from 'moment';
import 'moment-duration-format';
import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async () => {
  const settingsRows = await client.ch
    .query(
      `SELECT * FROM modsettings WHERE warns = true AND warnstime IS NOT NULL OR mutes = true AND mutestime IS NOT NULL OR kicks = true AND kickstime IS NOT NULL OR channelbans = true AND channelbanstime IS NOT NULL OR bans = true AND banstime IS NOT NULL;`,
    )
    .then((r: DBT.modsettings[] | null) => r || null);

  if (!settingsRows) return;

  settingsRows.forEach(async (settingsRow) => {
    if (!client.guilds.get(settingsRow.guildid)) return;

    if (settingsRow.warns && settingsRow.warnstime) {
      expire({ expire: settingsRow.warnstime, guildid: settingsRow.guildid }, 'punish_warns');
    }
    if (settingsRow.mutes && settingsRow.mutestime) {
      expire({ expire: settingsRow.mutestime, guildid: settingsRow.guildid }, 'punish_mutes');
    }
    if (settingsRow.kicks && settingsRow.kickstime) {
      expire({ expire: settingsRow.kickstime, guildid: settingsRow.guildid }, 'punish_kicks');
    }
    if (settingsRow.bans && settingsRow.banstime) {
      expire({ expire: settingsRow.banstime, guildid: settingsRow.guildid }, 'punish_bans');
    }
    if (settingsRow.channelbans && settingsRow.channelbanstime) {
      expire(
        { expire: settingsRow.channelbanstime, guildid: settingsRow.guildid },
        'punish_channelbans',
      );
    }
  });
};

const expire = async (row: { expire: string; guildid: string }, tableName: string) => {
  const tableRows = (await client.ch
    .query(`SELECT * FROM ${tableName} WHERE guildid = $1 AND uniquetimestamp < $2;`, [
      row.guildid,
      Date.now() - Number(row.expire),
    ])
    .then((r) => r || null)) as unknown as
    | DBT.punish_warns[]
    | DBT.punish_mutes[]
    | DBT.punish_kicks[]
    | DBT.punish_bans[]
    | DBT.punish_channelbans[]
    | null;

  if (!tableRows) return;

  tableRows.forEach((r) => {
    client.ch.query(`DELETE FROM ${tableName} WHERE uniquetimestamp = $1 AND guildid = $2;`, [
      r.uniquetimestamp,
      r.guildid,
    ]);
  });

  logExpire(tableRows, row.guildid);
};

const logExpire = async (
  rows:
    | DBT.punish_warns[]
    | DBT.punish_mutes[]
    | DBT.punish_kicks[]
    | DBT.punish_bans[]
    | DBT.punish_channelbans[],
  guildid: string,
) => {
  const guild = client.guilds.get(guildid);
  if (!guild) return;

  const channels = (
    await client.ch
      .query('SELECT inviteevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].inviteevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  await guild.getRESTMembers().catch(() => null);
  await Promise.all(rows.map((p) => client.ch.getMember(guildid, p.userid).catch(() => null)));
  await Promise.all(rows.map((p) => client.ch.getUser(p.userid).catch(() => null)));

  const language = await client.ch.languageSelector(guildid);
  const lan = language.expire;
  const con = client.constants.expire;

  const embeds: Eris.Embed[] = rows.map((p) => {
    const user = client.users.get(p.userid);

    const embed: Eris.Embed = {
      type: 'rich',
      description: `**${language.reason}:**\n${p.reason}`,
      author: {
        name: client.ch.stp(lan.punishmentOf, { target: user }),
        url: client.ch.stp(client.constants.standard.discordUrlDB, {
          guildid: guild.id,
          channelid: p.channelid,
          msgid: p.msgid,
        }),
      },
      color: con.color,
      fields: [
        {
          name: lan.punishmentIssue,
          value: `<t:${p.uniquetimestamp.slice(0, -3)}:F> (<t:${p.uniquetimestamp.slice(
            0,
            -3,
          )}:R>)`,
          inline: false,
        },
        {
          name: lan.punishmentIn,
          value: `<#${p.channelid}>\n\`${p.channelname}\` (\`${p.channelid}\`)`,
          inline: false,
        },
        {
          name: lan.punishmentBy,
          value: `<@${p.executorid}>\n\`${p.executorname}\` (\`${p.executorid}\`)`,
          inline: false,
        },
      ],
    };

    if ('duration' in p) {
      const endedAt = client.ch.stp(lan.endedAt, {
        time: `<t:${String(Number(p.uniquetimestamp) + Number(p.duration)).slice(
          0,
          -3,
        )}:F> (<t:${String(Number(p.uniquetimestamp) + Number(p.duration)).slice(0, -3)}:R>)`,
      });

      embed.fields?.push(
        {
          name: lan.duration,
          value: `${
            p.duration
              ? moment
                  .duration(Number(p.duration))
                  .format(
                    `d [${language.time.days}], h [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                  )
              : '∞'
          }`,
          inline: false,
        },
        {
          name: lan.end,
          value: endedAt,
          inline: false,
        },
      );
    }

    embed.fields?.push({
      name: lan.pardonedBy,
      value: `${client.user.username}#${client.user.discriminator}\n\`${client.user.username}\` (\`${client.user.id}\`)`,
      inline: false,
    });

    return embed;
  });

  embeds.forEach((e) => client.ch.send(channels, { embeds: [e] }, language, null, 10000));
};
