import type * as Eris from 'eris';
import Jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

type Language = typeof import('../../../Languages/lan-en.json');

export default async (guild: Eris.Guild) => {
  const language = await client.ch.languageSelector(guild.id);

  invites(guild);
  mutes(guild, language);
  bans(guild, language);
  channelBans(guild, language);
  disboardBumpReminders(guild, language);
  giveaways(guild, language);
  webhooks(guild);
};

const invites = async (guild: Eris.Guild) => {
  const guildInvites = await client.ch.getAllInvites(guild);
  if (!guildInvites) return;
  client.invites.set(guild.id, guildInvites);
};

const mutes = async (guild: Eris.Guild, language: Language) => {
  const pendingMutes = await client.ch
    .query(`SELECT duration, userid, uniquetimestamp from punish_tempmutes WHERE guildid = $1;`, [
      guild.id,
    ])
    .then((r: DBT.punish_tempmutes[] | null) => r || null);

  if (!pendingMutes) return;

  pendingMutes.forEach(async (mute) => {
    const timeLeft =
      Number(mute.duration) + Number(mute.uniquetimestamp) < Date.now()
        ? 100
        : Number(mute.duration);

    client.mutes.set(
      `${guild.id}-${mute.userid}`,
      Jobs.scheduleJob(new Date(Date.now() + timeLeft), async () => {
        const target = await client.ch.getUser(mute.userid);
        if (!target) return;

        const obj: CT.ModBaseEventOptions = {
          executor: client.user,
          target,
          reason: language.events.ready.unmute,
          guild,
          forceFinish: true,
          doDBonly: true,
          type: 'muteRemove',
        };

        client.emit('modBaseEvent', obj);
      }),
    );
  });
};

const bans = async (guild: Eris.Guild, language: Language) => {
  const pendingBans = await client.ch
    .query(`SELECT duration, userid, uniquetimestamp from punish_tempbans WHERE guildid = $1;`, [
      guild.id,
    ])
    .then((r: DBT.punish_tempbans[] | null) => r || null);

  if (!pendingBans) return;

  pendingBans.forEach(async (ban) => {
    const timeLeft =
      Number(ban.duration) + Number(ban.uniquetimestamp) < Date.now() ? 100 : Number(ban.duration);

    client.mutes.set(
      `${guild.id}-${ban.userid}`,
      Jobs.scheduleJob(new Date(Date.now() + timeLeft), async () => {
        const target = await client.ch.getUser(ban.userid);
        if (!target) return;

        const obj: CT.ModBaseEventOptions = {
          executor: client.user,
          target,
          reason: language.events.ready.unban,
          guild,
          forceFinish: true,
          type: 'banRemove',
        };

        client.emit('modBaseEvent', obj);
      }),
    );
  });
};

const channelBans = async (guild: Eris.Guild, language: Language) => {
  const pendingBans = await client.ch
    .query(
      `SELECT duration, userid, banchannelid, uniquetimestamp from punish_tempchannelbans WHERE guildid = $1;`,
      [guild.id],
    )
    .then((r: DBT.punish_tempchannelbans[] | null) => r || null);

  if (!pendingBans) return;

  pendingBans.forEach(async (ban) => {
    const timeLeft =
      Number(ban.duration) + Number(ban.uniquetimestamp) < Date.now() ? 100 : Number(ban.duration);

    const channel = guild.channels.get(ban.banchannelid);
    if (!channel) return;

    client.mutes.set(
      `${guild.id}-${ban.userid}`,
      Jobs.scheduleJob(new Date(Date.now() + timeLeft), async () => {
        const target = await client.ch.getUser(ban.userid);
        if (!target) return;

        const obj: CT.ModBaseEventOptions = {
          executor: client.user,
          target,
          reason: language.events.ready.channelunban,
          guild,
          forceFinish: true,
          type: 'banRemove',
        };

        client.emit('modBaseEvent', obj);
      }),
    );
  });
};

const disboardBumpReminders = async (guild: Eris.Guild, language: Language) => {
  const pendingBump = await client.ch
    .query(
      `SELECT channelid, uniquetimestamp, nextbump FROM disboard WHERE active = true AND guildid = $1 AND nextbump IS NOT NULL;`,
      [guild.id],
    )
    .then((r: DBT.disboard[] | null) => (r ? r[0] : null));
  if (!pendingBump) return;

  const deleteBump = () =>
    client.ch.query(`UPDATE disboard SET nextbump = NULL WHERE uniquetimestamp = $1;`, [guild.id]);

  if (!pendingBump.channelid) {
    deleteBump();
    return;
  }

  const channel = guild.channels.get(pendingBump.channelid);
  if (!channel) {
    deleteBump();
    return;
  }
  const timeLeft =
    Number(pendingBump.nextbump) < Date.now() ? Date.now() + 100 : Number(pendingBump.nextbump);

  client.disboardBumpReminders.set(
    guild.id,
    Jobs.scheduleJob(new Date(timeLeft), async () => {
      (await import('../../messageEvents/messageCreate/disboard')).endReminder(guild, language);
    }),
  );
};

const giveaways = async (guild: Eris.Guild, language: Language) => {
  const pendingGiveaways = await client.ch
    .query(`SELECT * FROM giveaways WHERE ended = false AND guildid = $1;`, [guild.id])
    .then((r: DBT.giveaways[] | null) => r || null);

  if (!pendingGiveaways) return;

  pendingGiveaways.forEach((giveaway) => {
    const endTime =
      Number(giveaway.endtime) < Date.now() ? Date.now() + 100 : Number(giveaway.endtime);

    client.giveaways.set(
      `${giveaway.msgid}-${giveaway.guildid}`,
      Jobs.scheduleJob(new Date(endTime), async () => {
        (await import('../../../SlashCommands/giveaway/end')).end(giveaway, language);
      }),
    );
  });
};

const webhooks = (guild: Eris.Guild) => {
  guild.channels.forEach(async (channel) => {
    if (!('getWebhooks' in channel)) return;
    const wh = await channel.getWebhooks().catch(() => null);

    if (!wh) return;
    client.webhooks.set(channel.id, wh);
  });
};
