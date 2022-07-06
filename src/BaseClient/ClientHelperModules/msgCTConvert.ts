import type Eris from 'eris';
import type CT from '../../typings/CustomTypings';

type PartialMessage = { id: string; channel: { id: string }; guildID: string };

export default async (rawMsg: Eris.Message | PartialMessage) => {
  const { default: client } = await import('../ErisClient');

  const msg = await getMessage(rawMsg, client);
  if (!msg) return null;
  getGuild(msg as CT.Message, client);
  await getLanguage(msg as CT.Message);
  await getChannel(msg.channel, client);

  return msg as CT.Message;
};

const getGuild = (msg: CT.Message, client: Eris.Client) => {
  if (!msg.guildID) return;
  msg.guild = client.guilds.get(msg.guildID);
};

const getLanguage = async (msg: CT.Message) => {
  const { default: client } = await import('../ErisClient');

  msg.language = await client.ch.languageSelector(msg.guildID);
};

const getMessage = async (msg: Eris.Message | PartialMessage, client: Eris.Client) => {
  Object.entries(msg).forEach((entry) => {
    if (entry === undefined) delete msg[entry];
  });

  if (!('jumpLink' in msg)) {
    return client.getMessage(msg.channel.id, msg.id).catch(() => null);
  }
  return msg;
};

const getChannel = async (channel: Eris.Channel, client: Eris.Client) => {
  Object.entries(channel).forEach((entry) => {
    if (entry === undefined) delete channel[entry];
  });

  if (Object.entries(channel).length === 1) {
    channel = (await client.getRESTChannel(channel.id)) as typeof channel;
  }
};
