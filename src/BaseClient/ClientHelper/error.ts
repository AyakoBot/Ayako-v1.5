import * as Eris from 'eris';
import client from '../ErisClient';
import type CT from '../../typings/CustomTypings';

export default ({
  msg,
  cmd,
  m,
  content,
  timeout,
  language,
}: {
  msg?: Eris.Message;
  cmd?: Eris.Interaction;
  m?: Eris.Message;
  content: string;
  timeout: number;
  language: CT.Language;
}) => {
  const embed = new Eris.EmbedOptions();
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: language.error,
      iconURL: client.objectEmotes.warning.link,
      url: client.constants.standard.invite,
    })
    .setColor(client.constants.error)
    .setDescription(content);

  if (cmd) {
    client.ch.reply(msg || cmd, { embeds: [embed], flags: 64 }, language);
    return;
  }

  if (m) {
    client.ch.edit(m, { embeds: [embed] });
    return;
  }
  client.ch.reply(msg, { embeds: [embed] }, language);
};
