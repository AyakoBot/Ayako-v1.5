import jobs from 'node-schedule';
import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

const tables = ['punish_tempbans', 'punish_tempchannelbans', 'punish_tempmutes'];
const types = ['banRemove', 'channelbanRemove', 'muteRemove'];
const setter = [client.bans, client.channelBans, client.mutes];

export default async () => {
  tables.forEach(async (table, i) => {
    const punishmentRows = (
      await client.ch
        .query(`SELECT * FROM ${table};`)
        .then(
          (r: (DBT.punish_tempbans | DBT.punish_tempchannelbans | DBT.punish_tempmutes)[] | null) =>
            r || null,
        )
    )?.filter((r) => client.guilds.has(r.guildid));
    if (!punishmentRows) return;

    punishmentRows.forEach(async (row) => {
      const guild = client.guilds.get(row.guildid);
      if (!guild) return;

      if (!row.channelid) return;
      const channel = guild.channels.get(row.channelid) as Eris.TextChannel;
      if (!row.msgid) return;
      const rawMsg = await channel.getMessage(row.msgid);
      const msg = await client.ch.msgCTConvert(rawMsg);

      const timeLeft =
        Number(row.duration) + Number(row.uniquetimestamp) < Date.now()
          ? 100
          : Number(row.duration);
      const language = await client.ch.languageSelector(guild.id);

      setter[i].set(
        `${'banchannelid' in row ? row.banchannelid : row.guildid}-${row.userid}`,
        jobs.scheduleJob(new Date(Date.now() + timeLeft), async () => {
          const user = await client.ch.getUser(row.userid);
          if (!user) return;

          const obj: CT.ModBaseEventOptions = {
            target: user,
            executor: client.user,
            reason: language.events.ready.unmute,
            guild,
            msg: msg || undefined,
            forceFinish: true,
            doDBonly: true,
            type: types[i] as never,
          };

          client.emit('modBaseEvent', obj);
        }),
      );
    });
  });
};
