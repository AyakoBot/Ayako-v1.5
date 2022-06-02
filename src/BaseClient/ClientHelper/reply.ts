import type Eris from 'eris';
import jobs from 'node-schedule';
import type CT from '../../typings/CustomTypings';
import client from '../ErisClient.js';

export default async (
  msg:
    | Eris.CommandInteraction
    | Eris.ComponentInteraction
    | Eris.AutocompleteInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>
    | void,
  payload: CT.MessagePayload,
  language: CT.Language,
  command?: CT.Command,
) => {
  if (!msg) return null;

  payload.messageReference = {
    failIfNotExists: false,
    channelID: msg.channel.id,
    messageID: msg.id,
  };

  const sentMessage = await msg.channel.createMessage(payload, payload.files).catch((err) => {
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
    | Eris.AutocompleteInteraction
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
  if (!sentMessage) return;
  if (!command) return;
  if (!command.cooldownRow) return;
  if (!command.cooldownRow.cooldown) return;

  const author = msg.author || msg.member?.user || msg.user;

  const r = command.cooldownRow;
  if (r.bpuserid?.includes(author.id)) return;
  if (r.bpchannelid?.includes(msg.channel.id)) return;
  if (r.bproleid?.some((id: string) => msg.member?.roles.includes(id))) return;
  if (r.activechannelid?.length && !r.activechannelid?.includes(msg.channel.id)) return;

  let emote: string;

  if (Number(r.cooldown) <= 60000) {
    const emoteToUse = client.objectEmotes.timers[Number(r.cooldown) / 1000];
    emote = `${emoteToUse.name}:${emoteToUse.id}`;
  } else {
    emote = '⌛';
  }

  const reaction = await sentMessage.addReaction(emote).catch(() => null);
  if (reaction === null) return;
  const reactions = [emote];

  if (emote === '⌛') {
    const emoteToUse = client.objectEmotes.timers[60];
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
    | Eris.AutocompleteInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>
    | void,
  sentMessage:
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | void
    | Eris.Message<Eris.TextableChannel>,
  language: CT.Language,
  command?: CT.Command,
) => {
  if (!sentMessage) return;
  if (!command) return;

  const r = command.deleteCommandRow;
  if (!r) return;
  if (!r.commands?.includes(command.name)) return;
  if (!r.deletetimeout || Number(r.deletetimeout) === 0) return;

  if (r.deletecommand && r.deletetimeout) {
    jobs.scheduleJob(new Date(Date.now() + Number(r.deletetimeout)), () => {
      msg.delete(language.commands.deleteHandler.reasonCommand).catch(() => null);
    });
  } else if (r.deletecommand) {
    msg.delete(language.commands.deleteHandler.reasonCommand).catch(() => null);
  }

  if (r.deletereply && r.deletetimeout) {
    jobs.scheduleJob(new Date(Date.now() + Number(r.deletetimeout)), () => {
      sentMessage.delete(language.commands.deleteHandler.reasonReply).catch(() => null);
    });
  } else if (r.deletereply) {
    sentMessage.delete(language.commands.deleteHandler.reasonReply).catch(() => null);
  }
};
