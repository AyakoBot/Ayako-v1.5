import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

export default async (guild: Eris.Guild, user: Eris.User, oldUser: CT.OldUser) => {
  const channels = (
    await client.ch
      .query('SELECT inviteevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].inviteevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);

  const lan = language.events.userUpdate;
  const con = client.constants.events.userUpdate;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
      url: `https://discord.com/users/${user.id}`,
    },
    color: con.color,
    description: client.ch.stp(lan.desc, { user }),
    fields: [],
  });

  const embed = getEmbed();
  const changedKeys: string[] = [];
  const files: Eris.FileContent[] = [];

  const basic = (key: 'username' | 'discriminator') => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        before: oldUser[key as never] || language.none,
        after: user[key as never] || language.none,
      }),
      inline: false,
    });
  };

  const avatar = async () => {
    changedKeys.push('avatar');
    const oldAvatar = oldUser.avatar
      ? client.ch.stp(client.constants.standard.userAvatarURL, {
          guild,
          fileEnd: oldUser.avatar.startsWith('a_') ? 'gif' : 'png',
        })
      : null;
    const newAvatar = user.avatar
      ? client.ch.stp(client.constants.standard.userAvatarURL, {
          guild,
          fileEnd: user.avatar.startsWith('a_') ? 'gif' : 'png',
        })
      : null;

    const [oldAvatarFile, newAvatarFile] = await client.ch.fileURL2Buffer([oldAvatar, newAvatar]);

    if (oldAvatarFile) {
      oldAvatarFile.name = `avatarOld.${oldUser.avatar?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.thumbnail = {
        url: `attachment://avatarOld.${oldUser.avatar?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(oldAvatarFile);
    }
    if (newAvatarFile) {
      newAvatarFile.name = `avatarNew.${user.avatar?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.image = {
        url: `attachment://avatarNew.${user.avatar?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(newAvatarFile);
    }

    if (oldAvatarFile || newAvatarFile) {
      embed.fields?.push({
        name: lan.avatar,
        value: lan.avatarAppear,
        inline: false,
      });
    }
  };

  switch (true) {
    case user.username !== oldUser.username: {
      basic('username');
      break;
    }
    case user.discriminator !== oldUser.discriminator: {
      basic('discriminator');
      break;
    }
    case user.avatar !== oldUser.avatar: {
      avatar();
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed], files }, language, null, 10000);
};
