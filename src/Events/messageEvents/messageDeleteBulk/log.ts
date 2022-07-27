import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  msgs: (Eris.Message | { id: string; guildID: string; channel: { id: string } })[],
) => {
  if (!msgs[0]) return;
  if (!msgs[0].guildID) return;

  const guild = client.guilds.get(msgs[0].guildID);
  if (!guild) return;

  const channels = (
    await client.ch
      .query('SELECT messageevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].messageevents : null))
  )?.map((id: string) => guild?.channels.get(id));
  if (!channels) return;

  const language = await client.ch.languageSelector(guild.id);
  const lan = language.events.messageDeleteBulk;
  const con = client.constants.events.messageDeleteBulk;
  const audit = await client.ch.getAudit(guild, 73, msgs[0].channel);

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
    },
    color: con.color,
    fields: [],
  };

  if (audit) {
    embed.description = client.ch.stp(lan.descDetails, {
      user: audit.user,
      channel: guild.channels.get(msgs[0].channel.id),
      amount: msgs.length,
    });

    if (audit.reason) embed.fields?.push({ name: language.reason, value: audit.reason });
  } else {
    embed.description = client.ch.stp(lan.desc, {
      channel: guild.channels.get(msgs[0].channel.id),
      amount: msgs.length,
    });
  }

  const getFirstFiles = () => {
    const attachments: Eris.FileContent[] = [];

    const embedCodes = `${language.Embeds}:${msgs
      .map(
        (m) =>
          'embeds' in m &&
          `${client.ch.stp(client.constants.standard.discordUrlDB, {
            guildid: m.guildID,
            channelid: m.channel.id,
            msgid: m.id,
          })}\n${m.embeds?.map((e) => `${JSON.stringify(e, null, 2)}`).join('\n')}`,
      )
      .join('\n\n')}`;
    if (msgs.map((m) => ('embeds' in m ? m.embeds : [])).flat(1).length) {
      attachments.push({ name: 'Embeds.txt', file: Buffer.from(embedCodes) });
    }

    const contents = msgs
      .map(
        (msg) =>
          `${client.ch.stp(lan.log, {
            msg,
            jumpLink: client.ch.stp(client.constants.standard.discordUrlDB, {
              guildid: msg.guildID,
              channelid: msg.channel.id,
              msgid: msg.id,
            }),
            createdTime: new Date(client.ch.getUnix(msg.id)).toDateString(),
            author: {
              id: 'author' in msg ? msg.author.id : language.unknown,
              tag:
                'author' in msg && 'discriminator' in msg.author && 'username' in msg.author
                  ? `${msg.author.username}#${msg.author.discriminator}`
                  : language.unknown,
            },
            embedLength: 'embeds' in msg ? String(msg.embeds.length) : '0',
            attachmentsLength: 'attachments' in msg ? String(msg.attachments.length) : '0',
            content: 'content' in msg && msg.content ? msg.content : lan.noContent,
          })}`,
      )
      .join('\n\n');

    if (msgs.map((m) => ('content' in m ? m.content : null)).flat(1).length) {
      attachments.push({ name: 'Contents.txt', file: Buffer.from(contents) });
    }

    return attachments;
  };

  const getSecondFiles = async () => {
    if (!msgs.map((m) => ('attachments' in m ? m.attachments : [])).flat(1).length) {
      return [];
    }

    return getAllAttachments(msgs);
  };

  const secondMsgFiles = await getSecondFiles();
  const firstMsgFiles = getFirstFiles();

  const m = await client.ch.send(
    channels,
    { embeds: [embed], files: firstMsgFiles },
    language,
    null,
    secondMsgFiles.length ? undefined : 10000,
  );

  if (!m) return;
  if (!secondMsgFiles.length) return;

  await Promise.all(await Promise.all(secondMsgFiles.map((p) => Promise.all(p))));

  m.forEach(async (message) => {
    const noticeEmbed: Eris.Embed = {
      type: 'rich',
      description: client.ch.stp(lan.attachmentsLog, { jumpLink: message.jumpLink }),
      color: client.constants.colors.ephemeral,
    };

    let noticeEmbed2: Eris.Embed | undefined;

    const promises = await Promise.all(
      secondMsgFiles.map((attachments) => {
        const attachmentsToSend = attachments.filter((f) => !!f);

        if (!attachmentsToSend.length) return null;
        return client.ch.send(
          message.channel,
          {
            embeds: [noticeEmbed],
            files: attachmentsToSend,
          },
          language,
        );
      }),
    );

    promises.forEach((m2) => {
      if (!m2) return;

      noticeEmbed2 = {
        type: 'rich',
        description: client.ch.stp(lan.deleteLog, { jumpLink: m2.jumpLink }),
        color: client.constants.colors.ephemeral,
      };
    });

    if (!noticeEmbed2) return;

    message
      .edit({
        embeds: [embed, noticeEmbed2],
      })
      .catch(() => null);
  });
};

const getAllAttachments = async (
  msgs: (Eris.Message | { id: string; guildID: string; channel: { id: string } })[],
) => {
  const returnable: Eris.FileContent[][] = [];
  await new Promise((res) => {
    let finishedIndex = 0;

    msgs.map(async (m, i) => {
      if ('attachments' in m) {
        const attachment = (await client.ch.fileURL2Buffer(m.attachments.map((a) => a.url))).filter(
          (a) => !!a,
        );
        if (attachment !== null) returnable.push(attachment as Eris.FileContent[]);
      }
      finishedIndex = i;
      if (finishedIndex === msgs.length - 1) res(true);
    });
  });

  return returnable;
};
