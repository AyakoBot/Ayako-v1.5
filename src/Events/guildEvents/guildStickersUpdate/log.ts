/* eslint-disable no-fallthrough */
import type * as Eris from 'eris';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild, stickers: Eris.Sticker[], oldStickers: Eris.Sticker[]) => {
  if (!oldStickers) return;

  const channels = (
    await client.ch
      .query('SELECT stickerevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].stickerevents : null))
  )?.map((id: string) => guild.channels.get(id));

  if (!channels) return;
  const language = await client.ch.languageSelector(guild.id);

  let payload: CT.MessagePayload | null;

  switch (true) {
    case stickers.length > oldStickers.length: {
      const createdSticker = stickers.filter(
        (a1) => !oldStickers.map((a2) => a2.id).includes(a1.id),
      )[0];
      payload = await stickerCreated(guild, createdSticker, language);
      break;
    }
    case stickers.length < oldStickers.length: {
      const deletedSticker = oldStickers.filter(
        (a1) => !stickers.map((a2) => a2.id).includes(a1.id),
      )[0];
      payload = await stickerDeleted(guild, deletedSticker, language);
      break;
    }
    default: {
      const updatedSticker = stickers.filter(
        (a1) => JSON.stringify(oldStickers.find((e) => e.id === a1.id)) !== JSON.stringify(a1),
      )[0];
      const oldUpdatedSticker = oldStickers.find((e) => e.id === updatedSticker.id);
      if (!oldUpdatedSticker) return;
      payload = await stickerUpdated(guild, updatedSticker, oldUpdatedSticker, language);
      break;
    }
  }

  if (!payload) return;
  client.ch.send(channels, payload, language, null, 10000);
};

const stickerCreated = async (
  guild: Eris.Guild,
  sticker: Eris.Sticker,
  language: typeof import('../../../Languages/en.json'),
) => {
  const con = client.constants.events.stickerCreate;
  const lan = language.events.stickerCreate;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      fields: [],
    };

    const audit = await client.ch.getAudit(guild, 90, sticker);
    if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        sticker,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        sticker,
      });
    }

    embed.author = {
      name: lan.title,
      icon_url: con.image,
    };

    return embed;
  };

  const embed = await getEmbed();

  return { embeds: [embed] };
};

const stickerDeleted = async (
  guild: Eris.Guild,
  sticker: Eris.Sticker,
  language: typeof import('../../../Languages/en.json'),
) => {
  const con = client.constants.events.stickerDelete;
  const lan = language.events.stickerDelete;

  const getEmbed = async () => {
    const embed: Eris.Embed = {
      type: 'rich',
      color: con.color,
      fields: [],
    };

    const audit = await client.ch.getAudit(guild, 92, sticker);
    if (audit) {
      embed.description = client.ch.stp(lan.descDetails, {
        user: audit.user,
        sticker,
      });

      if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
    } else {
      embed.description = client.ch.stp(lan.desc, {
        sticker,
      });
    }

    embed.author = {
      name: lan.title,
      icon_url: con.image,
    };

    return embed;
  };

  const embed = await getEmbed();

  return { embeds: [embed] };
};

const stickerUpdated = async (
  guild: Eris.Guild,
  sticker: Eris.Sticker,
  oldSticker: Eris.Sticker,
  language: typeof import('../../../Languages/en.json'),
) => {
  const con = client.constants.events.stickerUpdate;
  const lan = language.events.stickerUpdate;

  const changedKeys: string[] = [];
  const audit = await client.ch.getAudit(guild, 91, sticker);

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    color: con.color,
    description: audit
      ? client.ch.stp(lan.descDetails, {
          user: audit.user,
          oldSticker,
          newsticker: sticker,
        })
      : client.ch.stp(lan.desc, {
          oldSticker,
          newsticker: sticker,
        }),
    fields: [],
  });

  const embed = getEmbed();

  const basic = (key: 'tags' | 'description' | 'name') => {
    changedKeys.push(key);
    embed.fields?.push({
      name: lan[key],
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldSticker[key as never] || language.none,
        newValue: sticker[key as never] || language.none,
      }),
      inline: false,
    });
  };

  switch (true) {
    case sticker.name !== oldSticker.name: {
      basic('name');
      break;
    }
    case sticker.description !== oldSticker.description: {
      basic('description');
      break;
    }
    case sticker.tags !== oldSticker.tags: {
      basic('tags');
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return null;
  return { embeds: [embed] };
};
