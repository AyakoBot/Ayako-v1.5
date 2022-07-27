import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';

export default async (msg: CT.Message) => {
  if (!msg.guildID) return;
  if (!msg.guild) return;

  const channels = (
    await client.ch
      .query('SELECT messageevents FROM logchannels WHERE guildid = $1;', [msg.guildID])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].messageevents : null))
  )?.map((id: string) => msg.guild?.channels.get(id));

  if (!channels) return;

  const lan = msg.language.events.messageDelete;
  const con = client.constants.events.messageDelete;

  const audit = await client.ch.getAudit(
    msg.guild,
    72,
    msg.author,
    (a) => a.channel?.id === msg.channel.id,
  );
  const getEmbedWithEntry = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: lan.title,
        icon_url: con.image,
      },
      description: client.ch.stp(lan.descDetails, {
        user: audit?.user,
        target: msg.author,
        channel: msg.channel,
      }),
      color: con.color,
      fields: [],
    };

    if (audit?.reason) {
      embed.fields?.push({ name: msg.language.reason, value: audit.reason });
    }

    return embed;
  };

  const getEmbedWithoutEntry = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: lan.title,
        icon_url: con.image,
      },
      description: client.ch.stp(lan.desc, {
        user: msg.author,
        channel: msg.channel,
      }),
      color: con.color,
      fields: [],
    };

    return embed;
  };

  const maxFieldSize = 1024;
  const embed = audit ? getEmbedWithEntry() : getEmbedWithoutEntry();

  const getContentFields = () => {
    if (!msg.content?.length) return;
    if (msg.content.length <= maxFieldSize) {
      embed.fields?.push({ name: msg.language.content, value: msg.content });
      return;
    }

    const chunks: string[] = [];

    let content = String(msg.content);
    while (content.length > maxFieldSize) {
      const chunk = content.slice(0, maxFieldSize);
      chunks.push(chunk);
      content = content.slice(maxFieldSize);
    }
    const chunk = content.slice(0, maxFieldSize);
    chunks.push(chunk);

    chunks.forEach((c) => {
      embed.fields?.push({ name: '\u200b', value: c });
    });
  };

  getContentFields();

  const getBuffers = async () => {
    if (!msg.attachments?.length) return [];
    const attachments = await client.ch.fileURL2Buffer(msg.attachments.map((a) => a.url));
    return attachments;
  };

  const files: {
    name: string;
    file: Buffer;
  }[] = [];
  const secondMessageFiles = await getBuffers();

  let embedCodes = null;

  if (msg.embeds?.length) {
    embedCodes = `${msg.language.Embeds}:\n\n${msg.embeds
      ?.map((e) => JSON.stringify(e, null, 2))
      .join('\n\n')}`;

    files.push({ name: 'Embeds.txt', file: Buffer.from(embedCodes) });
  }

  const m = await client.ch.send(
    channels,
    { embeds: [embed], files: files?.filter((f) => !!f) },
    msg.language,
    null,
    !secondMessageFiles?.length ? 5000 : undefined,
  );

  if (!secondMessageFiles?.length) return;
  if (!m?.[0]) return;

  m.forEach(async (message) => {
    const noticeEmbed: Eris.Embed = {
      type: 'rich',
      description: client.ch.stp(lan.attachmentsLog, { jumpLink: message.jumpLink }),
      color: client.constants.colors.ephemeral,
    };

    const m2 = await client.ch.send(
      message.channel,
      {
        embeds: [noticeEmbed],
        files: secondMessageFiles.filter((f) => !!f) as never,
      },
      msg.language,
    );

    if (!m2) return;

    const noticeEmbed2: Eris.Embed = {
      type: 'rich',
      description: client.ch.stp(lan.deleteLog, { jumpLink: m2.jumpLink }),
      color: client.constants.colors.ephemeral,
    };

    message
      .edit({
        embeds: [embed, noticeEmbed2],
      })
      .catch(() => null);
  });
};
