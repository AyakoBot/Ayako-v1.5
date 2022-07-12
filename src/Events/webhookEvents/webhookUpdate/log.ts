import type * as Eris from 'eris';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  channel: Eris.GuildTextableChannel,
  webhook: Eris.Webhook,
  oldWebhook: Eris.Webhook,
  audit: Eris.GuildAuditLogEntry,
) => {
  const channels = (
    await client.ch
      .query('SELECT voiceevents FROM logchannels WHERE guildid = $1;', [channel.guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].voiceevents : null))
  )?.map((id: string) => channel.guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(channel.guild.id);
  const lan = language.events.webhookUpdate;
  const con = client.constants.events.webhookUpdate;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/users/${webhook.id}`,
    },
    color: con.color,
    description: client.ch.stp(lan.desc, {
      webhook,
      user: audit.user,
      type: language.channelTypes[channel.type],
      channel,
    }),
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];
  const files: Eris.FileContent[] = [];

  const basic = (key: 'name') => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldWebhook[key as never] || language.none,
        newValue: webhook[key as never] || language.none,
      }),
      inline: false,
    });
  };

  const channelID = () => {
    changedKeys.push('channel_id');
    embed.fields?.push({
      name: lan.channelID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldWebhook.channel_id ? `<#${oldWebhook.channel_id}>` : language.none,
        newValue: webhook.channel_id ? `<#${webhook.channel_id}>` : language.none,
      }),
      inline: false,
    });
  };

  const avatar = async () => {
    changedKeys.push('avatar');

    const newAvatar = webhook.avatar
      ? client.ch.stp(client.constants.standard.userAvatarURL, {
          user: webhook,
          fileEnd: webhook.avatar?.startsWith('a_') ? 'gif' : 'png',
        })
      : null;

    const [newAvatarFile] = await client.ch.fileURL2Buffer([newAvatar]);

    if (newAvatarFile) {
      newAvatarFile.name = `${webhook.avatar}.${webhook.avatar?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.thumbnail = {
        url: `attachment://${webhook.avatar}.${webhook.avatar?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(newAvatarFile);
    }

    if (newAvatarFile) {
      embed.fields?.push({
        name: lan.avatar,
        value: lan.avatarAppear,
        inline: false,
      });
    }
  };

  switch (true) {
    case webhook.avatar !== oldWebhook.avatar: {
      avatar();
      break;
    }
    case webhook.channel_id !== oldWebhook.channel_id: {
      channelID();
      break;
    }
    case webhook.name !== oldWebhook.name: {
      basic('name');
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed] }, language, null, 10000);
};
