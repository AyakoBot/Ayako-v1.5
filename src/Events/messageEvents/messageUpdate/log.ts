import type Eris from 'eris';
import Discord from 'discord.js';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message, oldMsg: Eris.OldMessage) => {
  if (!msg.guildID) return;

  const channels = (
    await client.ch
      .query('SELECT messageevents FROM logchannels WHERE guildid = $1;', [msg.guildID])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].messageevents : null))
  )?.map((id: string) => msg.guild?.channels.get(id));

  if (!channels) return;

  publishLog(msg, oldMsg, channels);
  updateLog(msg, oldMsg, channels);
  pinLog(msg, oldMsg, channels);
};

const publishLog = async (
  msg: CT.Message,
  oldMsg: Eris.OldMessage,
  channels: (Eris.AnyGuildChannel | undefined)[],
) => {
  if (!msg.guildID) return;
  if (
    new Discord.MessageFlagsBitField(msg.flags).has(1) &&
    new Discord.MessageFlagsBitField(oldMsg.flags).has(1)
  ) {
    return;
  }

  if (
    !new Discord.MessageFlagsBitField(msg.flags).has(1) &&
    !new Discord.MessageFlagsBitField(oldMsg.flags).has(1)
  ) {
    return;
  }

  const lan = msg.language.events.messageUpdate.LogPublish;
  const con = client.constants.events.messageUpdate;

  const getEmbed = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: lan.title,
        icon_url: con.MessageUpdate,
        url: msg.jumpLink,
      },
      description: client.ch.stp(lan.description, {
        msg,
      }),
      fields: [],
    };

    return embed;
  };

  const embed = getEmbed();
  embed.color = con.color;

  const payload: { embeds: Eris.Embed[] } = {
    embeds: [embed],
  };

  await client.ch.send(channels, payload, msg.language, null, 10000);
};

const updateLog = async (
  msg: CT.Message,
  oldMsg: Eris.OldMessage,
  channels: (Eris.AnyGuildChannel | undefined)[],
) => {
  if (!msg.guildID) return;
  if (
    !new Discord.MessageFlagsBitField(msg.flags).has(1) &&
    new Discord.MessageFlagsBitField(oldMsg.flags).has(1)
  ) {
    return;
  }

  if (
    !new Discord.MessageFlagsBitField(msg.flags).has(1) &&
    new Discord.MessageFlagsBitField(oldMsg.flags).has(1)
  ) {
    return;
  }

  const lan = msg.language.events.messageUpdate.update;
  const con = client.constants.events.messageUpdate;

  const getEmbed = () => {
    const description =
      msg.content !== oldMsg.content
        ? client.ch.stp(lan.contentUpdate, {
            msg,
          })
        : client.ch.stp(lan.otherUpdates, { msg });

    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: lan.title,
        icon_url: con.MessageUpdate,
        url: msg.jumpLink,
      },
      description,
      color: con.color,
      fields: [],
    };

    return embed;
  };

  const embed = getEmbed();
  const firstMessageFiles: Eris.FileContent[] = [];
  const secondMessageFiles: Eris.FileContent[] = [];
  const changes: string[] = [];

  const attachmentsUpdated = async () => {
    changes.push('attachments');

    const updatedAttachments: Eris.Attachment[] = [];
    const addedAttachments = msg.attachments.filter(
      (a1) => !oldMsg.attachments.map((a2) => a2.id).includes(a1.id),
    );
    const removedAttachments = oldMsg.attachments.filter(
      (a1) => !msg.attachments.map((a2) => a2.id).includes(a1.id),
    );

    updatedAttachments.push(...addedAttachments, ...removedAttachments);

    const buffers: { name: string; file: Buffer }[] = (
      await client.ch.fileURL2Buffer(updatedAttachments.map((a) => a.url))
    ).filter((b): b is typeof buffers[0] => !!b);

    secondMessageFiles.push(...buffers);
  };

  const embedsUpdated = () => {
    changes.push('embeds');

    const updatedEmbeds: Eris.Embed[] = [];
    const addedEmbeds = msg.embeds.filter(
      (a1) => !oldMsg.embeds.map((a2) => JSON.stringify(a2)).includes(JSON.stringify(a1)),
    );
    const removedEmbeds = oldMsg.embeds.filter(
      (a1) => !msg.embeds.map((a2) => JSON.stringify(a2)).includes(JSON.stringify(a1)),
    );

    updatedEmbeds.push(...addedEmbeds, ...removedEmbeds);

    if (!updatedEmbeds?.length) return;

    const embedCodes = `${msg.language.Embeds}:\n\n${updatedEmbeds
      ?.map((e) => JSON.stringify(e, null, 2))
      .join('\n\n')}`;

    firstMessageFiles.push({ name: 'Embeds.txt', file: Buffer.from(embedCodes) });
  };

  const contentUpdated = () => {
    changes.push('content');

    if (!embed.fields) embed.fields = [];

    if (!msg.content?.length && oldMsg.content?.length) {
      chunker(lan.oldContent, oldMsg.content);
      return;
    }

    if (msg.content?.length && !oldMsg.content?.length) {
      chunker(lan.newContent, msg.content);
      return;
    }

    chunker(lan.oldContent, oldMsg.content);
    chunker(lan.newContent, msg.content);
  };

  const chunker = (contentName: string, c: string) => {
    if (c.length <= 1024) {
      embed.fields?.push({ name: contentName, value: c });
      return;
    }

    const chunks: string[] = [];

    let content = String(c);
    while (content.length > 1024) {
      const chunk = content.slice(0, 1024);
      chunks.push(chunk);
      content = content.slice(1024);
    }
    const chunk = content.slice(0, 1024);
    chunks.push(chunk);

    chunks.forEach((thisChunk) => {
      embed.fields?.push({ name: '\u200b', value: thisChunk });
    });
  };

  switch (true) {
    case oldMsg.attachments.map((a) => a.id).join(' ') !==
      msg.attachments.map((a) => a.id).join(' '): {
      await attachmentsUpdated();
      break;
    }
    case JSON.stringify(
      msg.embeds
        .map((e) => {
          if (e.thumbnail) {
            e.thumbnail.width = 0;
            e.thumbnail.height = 0;
          }

          if (e.image) {
            e.image.width = 0;
            e.image.height = 0;
          }

          return e;
        })
        .filter((e) => e.type === 'rich'),
    ) !==
      JSON.stringify(
        oldMsg.embeds
          .map((e) => {
            if (e.thumbnail) {
              e.thumbnail.width = 0;
              e.thumbnail.height = 0;
            }

            if (e.image) {
              e.image.width = 0;
              e.image.height = 0;
            }

            return e;
          })
          .filter((e) => e.type === 'rich'),
      ): {
      embedsUpdated();
      break;
    }
    case oldMsg.content !== msg.content: {
      contentUpdated();
      break;
    }
    default: {
      break;
    }
  }

  if (!changes.length) return;

  const m = await client.ch.send(
    channels,
    {
      embeds: [embed],
      files: firstMessageFiles,
    },
    msg.language,
    null,
    !secondMessageFiles.length ? 10000 : undefined,
  );

  if (!secondMessageFiles.length) return;
  if (!m?.[0]) return;

  m.forEach(async (message) => {
    const noticeEmbed: Eris.Embed = {
      type: 'rich',
      description: client.ch.stp(lan.attachmentsLog, { jumpLink: message.jumpLink }),
      color: client.constants.colors.ephemeral,
    };

    const m2 = (await client.ch.send(
      message.channel,
      {
        embeds: [noticeEmbed],
        files: secondMessageFiles.filter((f) => !!f),
      },
      msg.language,
    )) as Eris.Message | null;

    if (!m2) return;

    const noticeEmbed2: Eris.Embed = {
      type: 'rich',
      description: client.ch.stp(lan.updateLog, { jumpLink: m2.jumpLink }),
      color: client.constants.colors.ephemeral,
    };

    client.ch.edit(message, {
      embeds: [embed, noticeEmbed2],
    });
  });
};

const pinLog = async (
  msg: CT.Message,
  oldMsg: Eris.OldMessage,
  channels: (Eris.AnyGuildChannel | undefined)[],
) => {
  if (!msg.guild) return;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    fields: [],
  });

  const getAuditLogEntry = async (actionType: 74 | 75) => {
    if (!msg.guild?.members.get(client.user.id)?.permissions.has(128n)) return null;

    const audits = await msg.guild?.getAuditLog({ limit: 5, actionType });
    if (!audits || !audits.entries) return null;

    return audits.entries
      .filter((a) => a.targetID === msg.id)
      .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
  };

  const embed = getEmbed();
  const changedKeys: string[] = [];

  const pinned = async () => {
    changedKeys.push('pin');
    const con = client.constants.events.channelPin;
    const lan = msg.language.events.channelPin;
    const audit = await getAuditLogEntry(74);

    if (audit) embed.description = client.ch.stp(lan.descDetails, { user: audit.user, msg });
    else embed.description = client.ch.stp(lan.desc, { msg });

    embed.color = con.color;

    embed.author = {
      name: lan.title,
      icon_url: con.image,
      url: msg.jumpLink,
    };
  };

  const unpinned = async () => {
    changedKeys.push('unpin');
    const con = client.constants.events.channelUnPin;
    const lan = msg.language.events.channelUnPin;
    const audit = await getAuditLogEntry(75);

    if (audit) embed.description = client.ch.stp(lan.descDetails, { user: audit.user, msg });
    else embed.description = client.ch.stp(lan.desc, { msg });

    embed.color = con.color;

    embed.author = {
      name: lan.title,
      icon_url: con.image,
      url: msg.jumpLink,
    };
  };

  switch (true) {
    case !oldMsg.pinned && msg.pinned: {
      await pinned();
      break;
    }
    case oldMsg.pinned && !msg.pinned: {
      unpinned();
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  client.ch.send(channels, { embeds: [embed] }, msg.language, null, 10000);
};
