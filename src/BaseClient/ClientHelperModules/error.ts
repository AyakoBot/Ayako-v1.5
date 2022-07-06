import Eris from 'eris';
import edit from './edit';
import reply from './reply';
import objectEmotes from '../Other/ObjectEmotes.json' assert { type: 'json' };
import constants from '../Other/Constants.json' assert { type: 'json' };

export default (
  msg: Eris.Message | Eris.CommandInteraction | Eris.ComponentInteraction,
  content: string,
  language: typeof import('../../Languages/lan-en.json'),
  m?: Eris.Message,
) => {
  const embed: Eris.EmbedOptions = {
    author: {
      name: language.error,
      icon_url: objectEmotes.warning.link,
      url: constants.standard.invite,
    },
    color: constants.colors.warning,
    description: content,
  };

  if (!(msg instanceof Eris.Message)) {
    return reply(msg, { embeds: [embed], flags: 64 }, language);
  }

  if (m) return edit(m, { embeds: [embed] });
  return reply(msg, { embeds: [embed] }, language);
};
