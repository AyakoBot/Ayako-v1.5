import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (stage: Eris.StageInstance, oldStage: Eris.OldStageInstance) => {
  const guild = client.guilds.get(stage.guild.id);
  if (!guild) return;

  const channels = (
    await client.ch
      .query('SELECT stageevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].stageevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.stageUpdate;
  const con = client.constants.events.stageUpdate;

  const audit = await getAudit(guild);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/channels/${guild.id}/${stage.channel.id}`,
    },
    color: con.color,
    description: audit
      ? client.ch.stp(lan.descDetails, { user: audit.user, channel: stage.channel })
      : client.ch.stp(lan.desc, { channel: stage.channel }),
    fields: [],
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];

  if (audit && audit.reason) {
    embed.fields?.push({ name: language.reason, value: audit.reason, inline: false });
  }

  const privacyLevel = () => {
    changedKeys.push('privacyLevel');
    embed.fields?.push({
      name: lan.privacyLevel,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: language.stagePrivacyLevels[oldStage.privacyLevel] || language.none,
        newValue: language.stagePrivacyLevels[stage.privacyLevel] || language.none,
      }),
      inline: false,
    });
  };

  const basic = (key: 'discoverableDisabled' | 'topic') => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldStage[key as never] || language.none,
        newValue: stage[key as never] || language.none,
      }),
      inline: false,
    });
  };

  switch (true) {
    case stage.discoverableDisabled !== oldStage.discoverableDisabled: {
      basic('discoverableDisabled');
      break;
    }
    case stage.privacyLevel !== oldStage.privacyLevel: {
      privacyLevel();
      break;
    }
    case stage.topic !== oldStage.topic: {
      basic('topic');
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const getAudit = async (guild: Eris.Guild) => {
  if (!guild?.members.get(client.user.id)?.permissions.has(128n)) return null;

  const audits = await guild.getAuditLog({ limit: 5, actionType: 83 });
  if (!audits || !audits.entries) return null;

  return audits.entries.sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
};
