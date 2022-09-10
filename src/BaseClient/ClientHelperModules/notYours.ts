import type Eris from 'eris';
import constants from '../Other/Constants.json' assert { type: 'json' };
import reply from './reply';

export default (
  interaction: Eris.CommandInteraction | Eris.ComponentInteraction,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: language.error,
      icon_url: constants.standard.error,
      url: constants.standard.invite,
    },
    color: constants.colors.warning,
    description: language.errors.notYours,
  };

  reply(interaction, { embeds: [embed], ephemeral: true });
};
