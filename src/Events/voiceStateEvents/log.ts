import type * as Eris from 'eris';
import type DBT from '../../typings/DataBaseTypings';
import client from '../../BaseClient/ErisClient';

export default async (member: Eris.Member, oldState: Eris.OldVoiceState) => {
  const channels = (
    await client.ch
      .query('SELECT voiceevents FROM logchannels WHERE guildid = $1;', [member.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].voiceevents : null))
  )?.map((id: string) => member.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(member.guild.id);
  const lan = language.events.voiceStateUpdate;
  const con = client.constants.events.voiceStateUpdate;
  const audit = await getAuditLogEntry(member.guild, member.user);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/users/${member.user.id}`,
    },
    color: con.color,
    description: audit
      ? client.ch.stp(lan.descDetails, {
          target: member.user,
          user: audit.user,
        })
      : client.ch.stp(lan.desc, {
          user: member.user,
        }),
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];

  const basic = (key: 'deaf' | 'mute' | 'selfDeaf' | 'selfMute' | 'selfStream' | 'selfVideo') => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldState[key as never] || language.none,
        newValue: member.voiceState[key as never] || language.none,
      }),
      inline: false,
    });
  };

  switch (true) {
    case member.voiceState.deaf !== oldState.deaf: {
      basic('deaf');
      break;
    }
    case member.voiceState.mute !== oldState.mute: {
      basic('mute');
      break;
    }
    case member.voiceState.selfDeaf !== oldState.selfDeaf: {
      basic('selfDeaf');
      break;
    }
    case member.voiceState.selfMute !== oldState.selfMute: {
      basic('selfMute');
      break;
    }
    case member.voiceState.selfStream !== oldState.selfStream: {
      basic('selfStream');
      break;
    }
    case member.voiceState.selfVideo !== oldState.selfVideo: {
      basic('selfVideo');
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};

const getAuditLogEntry = async (guild: Eris.Guild, user: Eris.User) => {
  if (!guild.members.get(client.user.id)?.permissions.has(128n)) return null;

  const audits = await guild.getAuditLog({ limit: 5, actionType: 24 });
  if (!audits || !audits.entries) return null;

  return audits.entries
    .filter((a) => a.targetID === user.id)
    .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
};
