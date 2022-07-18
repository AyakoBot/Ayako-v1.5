import * as Eris from 'eris';
import jobs from 'node-schedule';
import query from './query';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';
import objectEmotes from '../Other/ObjectEmotes.json' assert { type: 'json' };

export default async (
  msg:
    | Eris.CommandInteraction
    | Eris.ComponentInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>
    | void,
  payload: CT.MessagePayload,
  language: typeof import('../../Languages/lan-en.json'),
  command?: CT.Command,
) => {
  if (!msg) return null;
  if (payload.ephemeral) {
    payload.ephemeral = undefined;
    payload.flags = payload.flags ? payload.flags + 64 : 64;
  }

  payload.messageReference = {
    failIfNotExists: false,
    channelID: msg.channel.id,
    messageID: msg.id,
  };

  const sentMessage =
    msg instanceof Eris.Message
      ? await msg.channel.createMessage(payload, payload.files).catch((err) => {
          // eslint-disable-next-line no-console
          console.log('reply err', err);
        })
      : await msg.createMessage(payload, payload.files).catch((err) => {
          // eslint-disable-next-line no-console
          console.log('reply err', err);
        });

  cooldownHandler(msg, sentMessage, command);
  deleteCommandHandler(msg, sentMessage, language, command);

  return sentMessage;
};

const cooldownHandler = async (
  msg:
    | Eris.CommandInteraction
    | Eris.ComponentInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>,
  sentMessage:
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>
    | void,
  command?: CT.Command,
) => {
  if (!msg) return;
  if (!sentMessage) return;
  if (!command) return;
  if (!command.cooldown) return;

  let author;
  if ('author' in msg) {
    author = msg.author;
  } else if ('user' in msg) {
    author = msg.user;
  }

  const r = await getCooldownRow(msg, command);
  if (!r) return;
  if (!author) return;
  if (r.bpuserid?.includes(author.id)) return;
  if (r.bpchannelid?.includes(msg.channel.id)) return;
  if (r.bproleid?.some((id: string) => msg.member?.roles.includes(id))) return;
  if (r.activechannelid?.length && !r.activechannelid?.includes(msg.channel.id)) return;

  let emote: string;

  if (Number(r.cooldown) <= 60000) {
    const emoteToUse = objectEmotes.timers[Number(r.cooldown) / 1000];
    emote = `${emoteToUse.name}:${emoteToUse.id}`;
  } else {
    emote = '⌛';
  }

  const reaction = await sentMessage.addReaction(emote).catch(() => null);
  if (reaction === null) return;
  const reactions = [emote];

  if (emote === '⌛') {
    const emoteToUse = objectEmotes.timers[60];
    emote = `${emoteToUse.name}:${emoteToUse.id}`;

    jobs.scheduleJob(new Date(Date.now() + (Number(r.cooldown) - 60000)), async () => {
      const secondReaction = await sentMessage.addReaction(emote).catch(() => null);
      if (secondReaction === null) return;
      reactions.push(emote);
    });
  }

  jobs.scheduleJob(new Date(Date.now() + Number(r.cooldown)), async () => {
    reactions.forEach((react) => {
      sentMessage.removeReactionEmoji(react).catch(() => null);
    });
  });
};

const deleteCommandHandler = (
  msg:
    | Eris.CommandInteraction
    | Eris.ComponentInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>
    | void,
  sentMessage:
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | void
    | Eris.Message<Eris.TextableChannel>,
  language: typeof import('../../Languages/lan-en.json'),
  command?: CT.Command,
) => {
  if (!msg) return;
  if (!sentMessage) return;
  if (!command) return;

  const r = command.deleteCommandRow;
  if (!r) return;
  if (!r.commands?.includes(command.name)) return;
  if (!r.deletetimeout || Number(r.deletetimeout) === 0) return;

  if (r.deletecommand && r.deletetimeout) {
    jobs.scheduleJob(new Date(Date.now() + Number(r.deletetimeout)), () => {
      if (
        !(msg instanceof Eris.CommandInteraction) &&
        !(msg instanceof Eris.ComponentInteraction)
      ) {
        msg.delete(language.commands.deleteHandler.reasonCommand).catch(() => null);
      }
    });
  } else if (r.deletecommand) {
    if (!(msg instanceof Eris.CommandInteraction) && !(msg instanceof Eris.ComponentInteraction)) {
      msg.delete(language.commands.deleteHandler.reasonCommand).catch(() => null);
    }
  }

  if (r.deletereply && r.deletetimeout) {
    jobs.scheduleJob(new Date(Date.now() + Number(r.deletetimeout)), () => {
      sentMessage.delete(language.commands.deleteHandler.reasonReply).catch(() => null);
    });
  } else if (r.deletereply) {
    sentMessage.delete(language.commands.deleteHandler.reasonReply).catch(() => null);
  }
};

const getCooldownRow = (
  msg:
    | Eris.CommandInteraction
    | Eris.ComponentInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>,
  command: CT.Command,
) =>
  query(
    `SELECT * FROM cooldowns WHERE guildid = $1 AND active = true AND command = $2 and cooldown = $3;`,
    [msg.guildID, command.name, command.cooldown],
  ).then((r: DBT.cooldowns[] | null) => (r ? r[0] : null));
