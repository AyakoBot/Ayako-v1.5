import pool from './DataBase';
import type Eris from 'eris';
import type CT from '../typings/CustomTypings';
import jobs from 'node-schedule';

export const query = async (string: string, args?: any[], debug?: boolean) => {
  if (debug) console.log(string, args);
  const res = await pool.query(string, args);
  if (!res || !res.rowCount) return null;
  return res.rows;
};

export const send = async (channel: Eris.Channel, payload: CT.MessagePayload, timeout?: number) => {
  if (timeout) {
    combineMessages(channel, payload, timeout);
    return;
  }
};

export const reply = async (msg: Eris.Message, payload: CT.MessagePayload) => {};

const combineMessages = async (
  channel: Eris.Channel,
  payload: CT.MessagePayload,
  timeout: number,
) => {
  const client = require('./ErisClient');

  if (!payload.embeds || !payload.embeds.length || !payload.files || !payload.files.length) {
    send(channel, payload);
    return;
  }

  if (client.channelQueue.has(channel.id)) {
    const updatedQueue = client.channelQueue.get(channel.id);
    const charsToPush = getEmbedCharLens(payload.embeds as Eris.EmbedOptions[]);

    if (updatedQueue.length < 10 && client.channelCharLimit.get(channel.id) + charsToPush <= 5000) {
      updatedQueue.push(payload);
      client.channelCharLimit.set(
        channel.id,
        client.channelCharLimit.get(channel.id) + charsToPush,
      );
      client.channelQueue.set(channel.id, updatedQueue);

      client.channelTimeout.get(channel.id)?.cancel();

      queueSend(channel, timeout, client);
    } else if (
      updatedQueue.length === 10 ||
      client.channelCharLimit.get(channel.id) + charsToPush >= 5000
    ) {
      send(channel, { embeds: updatedQueue.map((p: CT.MessagePayload) => p.embeds).flat(1) });
      client.channelQueue.set(channel.id, [payload]);

      client.channelTimeout.get(channel.id)?.cancel();

      client.channelCharLimit.set(
        channel.id,
        getEmbedCharLens(payload.embeds as Eris.EmbedOptions[]),
      );
      queueSend(channel, timeout, client);
    }
  } else {
    client.channelQueue.set(channel.id, [payload]);
    client.channelCharLimit.set(
      channel.id,
      getEmbedCharLens(payload.embeds as Eris.EmbedOptions[]),
    );
    client.channelTimeout.get(channel.id)?.cancel();

    queueSend(channel, timeout, client);
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

      if (!field) continue;

      if (typeof field.name === 'string') total += field.name.length;
      if (typeof field.value === 'string') total += field.value.length;
    }
  });
  return total > 6000 ? 1000 : total;
};

const queueSend = (channel: Eris.Channel, timeout: number, client: CT.Client) => {
  client.channelTimeout.set(
    channel.id,
    jobs.scheduleJob(new Date(Date.now() + timeout), () => {
      send(channel, {
        embeds: client.channelQueue
          .get(channel.id)
          ?.map((p) => p.embeds)
          ?.flat(1)
          .filter((p) => !!p),
        files: client.channelQueue
          .get(channel.id)
          ?.map((p) => p.files)
          ?.flat(1)
          .filter((p) => !!p),
      });

      client.channelQueue.delete(channel.id);
      client.channelTimeout.delete(channel.id);
      client.channelCharLimit.delete(channel.id);
    }),
  );
};
