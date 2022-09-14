import type * as Eris from 'eris';
import jobs from 'node-schedule';
import type CT from '../../typings/CustomTypings';

type ChannelTypes =
  | Eris.PrivateChannel
  | Eris.AnyGuildChannel
  | Eris.TextableChannel
  | Eris.AnyThreadChannel
  | undefined;

async function send(
  channel: ChannelTypes,
  payload: CT.MessagePayload,
  language: typeof import('../../Languages/en.json'),
  command?: CT.Command | null,
  timeout?: number,
): Promise<Eris.Message | null>;
async function send(
  channel: ChannelTypes[],
  payload: CT.MessagePayload,
  language: typeof import('../../Languages/en.json'),
  command?: CT.Command | null,
  timeout?: number,
): Promise<Eris.Message[] | null>;
async function send(
  channel: ChannelTypes | ChannelTypes[],
  payload: CT.MessagePayload,
  language: typeof import('../../Languages/en.json'),
  command?: CT.Command | null,
  timeout?: number,
): Promise<Eris.Message | Eris.Message[] | null> {
  if (!channel) return null;

  if (Array.isArray(channel)) {
    const sentMessages = await Promise.all(
      channel.map((c) => send(c, payload, language, command, timeout)),
    );
    return sentMessages as Eris.Message[];
  }

  if (!('createMessage' in channel)) return null;

  if (timeout) {
    combineMessages(channel, payload, timeout, language);
    return null;
  }

  const sentMessage = await channel.createMessage(payload, payload.files).catch((err) => {
    // eslint-disable-next-line no-console
    console.log('send err', err);
  });

  return sentMessage as Eris.Message;
}

export default send;

const combineMessages = async (
  channel:
    | Eris.PrivateChannel
    | Eris.AnyGuildChannel
    | Eris.TextableChannel
    | Eris.AnyThreadChannel,
  payload: CT.MessagePayload,
  timeout: number,
  language: typeof import('../../Languages/en.json'),
) => {
  if (!('createMessage' in channel)) return;

  if (!payload.embeds?.length || (!payload.embeds?.length && !payload.files?.length)) {
    send(channel, payload, language);
    return;
  }

  const { default: client } = await import('../ErisClient');

  if (!client.channelQueue.has(channel.id)) {
    client.channelQueue.set(channel.id, [payload]);
    client.channelCharLimit.set(channel.id, getEmbedCharLens(payload.embeds));
    client.channelTimeout.get(channel.id)?.cancel();

    queueSend(channel, timeout, language);
    return;
  }

  const updatedQueue = client.channelQueue.get(channel.id);
  const charsToPush = getEmbedCharLens(payload.embeds);
  const charLimit = client.channelCharLimit.get(channel.id);

  if (updatedQueue && updatedQueue.length < 10 && charLimit && charLimit + charsToPush <= 5000) {
    updatedQueue.push(payload);
    client.channelCharLimit.set(channel.id, charLimit + charsToPush);
    client.channelQueue.set(channel.id, updatedQueue);

    client.channelTimeout.get(channel.id)?.cancel();

    queueSend(channel, timeout, language);
    return;
  }

  if (
    updatedQueue &&
    (updatedQueue.length === 10 || (charLimit && charLimit + charsToPush >= 5000))
  ) {
    const embeds =
      updatedQueue
        .map((p: CT.MessagePayload) => p.embeds)
        .flat(1)
        .filter((e): e is Eris.EmbedOptions => !!e) || [];
    send(channel, { embeds }, language);

    client.channelQueue.set(channel.id, [payload]);
    client.channelTimeout.get(channel.id)?.cancel();
    client.channelCharLimit.set(channel.id, getEmbedCharLens(payload.embeds));

    queueSend(channel, timeout, language);
  }
};

const getEmbedCharLens = (embeds: Eris.EmbedOptions[]) => {
  let total = 0;
  embeds.forEach((embed) => {
    Object.values(embed).forEach((data) => {
      if (typeof data === 'string') {
        total += data.length;
      }
    });

    for (let i = 0; i < (embed.fields ? embed.fields.length : 0); i += 1) {
      const field = embed.fields ? embed.fields[i] : null;

      if (!field) return;

      if (typeof field.name === 'string') total += field.name.length;
      if (typeof field.value === 'string') total += field.value.length;
    }
  });
  return total > 6000 ? 1000 : total;
};

const queueSend = async (
  channel:
    | Eris.PrivateChannel
    | Eris.AnyGuildChannel
    | Eris.TextableChannel
    | Eris.AnyThreadChannel,
  timeout: number,
  language: typeof import('../../Languages/en.json'),
) => {
  if (!('createMessage' in channel)) return;
  const { default: client } = await import('../ErisClient');

  client.channelTimeout.set(
    channel.id,
    jobs.scheduleJob(new Date(Date.now() + timeout), () => {
      send(
        channel,
        {
          embeds: client.channelQueue
            .get(channel.id)
            ?.map((p) => (p.embeds && p.embeds.length ? p.embeds : []))
            ?.flat(1)
            .filter((e) => !!e),
          files: client.channelQueue
            .get(channel.id)
            ?.map((p) => (p.files && p.files.length ? p.files : []))
            ?.flat(1)
            .filter((f) => !!f),
        },
        language,
      );

      client.channelQueue.delete(channel.id);
      client.channelTimeout.delete(channel.id);
      client.channelCharLimit.delete(channel.id);
    }),
  );
};
