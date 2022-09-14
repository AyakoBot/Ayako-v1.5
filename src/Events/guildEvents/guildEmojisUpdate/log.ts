import type * as Eris from 'eris';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild, emojis: Eris.Emoji[], oldEmojis: Eris.Emoji[]) => {
  if (!oldEmojis) return;

  const channels = (
    await client.ch
      .query('SELECT emojievents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].emojievents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;
  const language = await client.ch.languageSelector(guild.id);

  let payload: CT.MessagePayload | null;

  switch (true) {
    case emojis.length > oldEmojis.length: {
      const createdEmoji = emojis.filter((a1) => !oldEmojis.map((a2) => a2.id).includes(a1.id))[0];
      payload = await emojiCreated(guild, createdEmoji, language);
      break;
    }
    case emojis.length < oldEmojis.length: {
      const deletedEmoji = oldEmojis.filter((a1) => !emojis.map((a2) => a2.id).includes(a1.id))[0];
      payload = await emojiDeleted(guild, deletedEmoji, language);
      break;
    }
    default: {
      const updatedEmoji = emojis.filter(
        (a1) => JSON.stringify(oldEmojis.find((e) => e.id === a1.id)) !== JSON.stringify(a1),
      )[0];
      const oldUpdatedEmoji = oldEmojis.find((e) => e.id === updatedEmoji.id);
      if (!oldUpdatedEmoji) return;
      payload = await emojiUpdated(guild, updatedEmoji, oldUpdatedEmoji, language);
      break;
    }
  }

  if (!payload) return;
  client.ch.send(channels, payload, language, null, 10000);
};

const emojiCreated = async (
  guild: Eris.Guild,
  emoji: Eris.Emoji,
  language: typeof import('../../../Languages/en.json'),
) => {
  const con = client.constants.events.emojiCreate;
  const lan = language.events.emojiCreate;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      thumbnail: { url: `attachment://${emoji.id}.${emoji.animated ? 'gif' : 'png'}` },
      fields: [],
    };

    const audit = await client.ch.getAudit(guild, 60, emoji);
    if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        emoji,
        emojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        emoji,
        emojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
      });
    }

    embed.author = {
      name: lan.title,
      icon_url: con.image,
    };

    return embed;
  };

  const getFile = async () => {
    const buffers = await client.ch.fileURL2Buffer([
      client.ch.stp(client.constants.standard.emojiURL, {
        emoji,
        fileEnd: emoji.animated ? 'gif' : 'png',
      }),
    ]);
    return buffers[0];
  };

  const embed = await getEmbed();
  const file = await getFile();

  return { embeds: [embed], files: file ? [file] : undefined };
};

const emojiDeleted = async (
  guild: Eris.Guild,
  emoji: Eris.Emoji,
  language: typeof import('../../../Languages/en.json'),
) => {
  const con = client.constants.events.emojiDelete;
  const lan = language.events.emojiDelete;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      thumbnail: { url: `attachment://${emoji.id}.${emoji.animated ? 'gif' : 'png'}` },
      fields: [],
    };

    const audit = await client.ch.getAudit(guild, 62, emoji);
    if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        emoji,
        emojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        emoji,
        emojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
      });
    }

    embed.author = {
      name: lan.title,
      icon_url: con.image,
    };

    return embed;
  };

  const getFile = async () => {
    const buffers = await client.ch.fileURL2Buffer([
      client.ch.stp(client.constants.standard.emojiURL, {
        emoji,
        fileEnd: emoji.animated ? 'gif' : 'png',
      }),
    ]);
    return buffers[0];
  };

  const embed = await getEmbed();
  const file = await getFile();

  return { embeds: [embed], files: file ? [file] : undefined };
};

const emojiUpdated = async (
  guild: Eris.Guild,
  emoji: Eris.Emoji,
  oldEmoji: Eris.Emoji,
  language: typeof import('../../../Languages/en.json'),
) => {
  const con = client.constants.events.emojiUpdate;
  const lan = language.events.emojiUpdate;

  const changedKeys: string[] = [];
  const audit = await client.ch.getAudit(guild, 61, emoji);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    color: con.color,
    thumbnail: { url: `attachment://${emoji.id}.${emoji.animated ? 'gif' : 'png'}` },
    description: audit
      ? client.ch.stp(lan.descDetails, {
          user: audit.user,
          oldEmoji,
          newEmoji: emoji,
          oldEmojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
          newEmojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
        })
      : client.ch.stp(lan.desc, {
          oldEmoji,
          newEmoji: emoji,
          oldEmojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
          newEmojiMention: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
        }),
    fields: [],
  });

  const embed = getEmbed();

  const roles = () => {
    changedKeys.push('roles');
    const addedRoles = emoji.roles.filter((a1) => !oldEmoji.roles.map((a2) => a2).includes(a1));
    const removedRoles = oldEmoji.roles.filter((a1) => !emoji.roles.map((a2) => a2).includes(a1));

    if (addedRoles.length) {
      embed.fields?.push({
        name: lan.rolesAdded,
        value: addedRoles.map((r) => `<@&${r}>`).join(', '),
        inline: false,
      });
    }
    if (removedRoles.length) {
      embed.fields?.push({
        name: lan.rolesRemoved,
        value: removedRoles.map((r) => `<@&${r}>`).join(', '),
        inline: false,
      });
    }
  };

  const nameChange = () => {
    changedKeys.push('name');

    embed.fields?.push({
      name: language.name,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldEmoji.name,
        newValue: emoji.name,
      }),
      inline: false,
    });
  };

  switch (true) {
    case emoji.roles.join(' ') !== oldEmoji.roles.join(' '): {
      roles();
      break;
    }
    case emoji.name !== oldEmoji.name: {
      nameChange();
      break;
    }
    default: {
      break;
    }
  }

  const getFile = async () => {
    const buffers = await client.ch.fileURL2Buffer([
      client.ch.stp(client.constants.standard.emojiURL, {
        emoji,
        fileEnd: emoji.animated ? 'gif' : 'png',
      }),
    ]);
    return buffers[0];
  };
  const file = await getFile();

  if (!changedKeys.length) return null;
  return { embeds: [embed], files: file ? [file] : undefined };
};
