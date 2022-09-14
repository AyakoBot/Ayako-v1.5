import type Eris from 'eris';
import constants from '../Other/Constants.json' assert { type: 'json' };

export default (msg: Eris.Message, language: typeof import('../../Languages/en.json')) => {
  const embed = {
    type: 'rich',
    description: language.errors.time,
    color: constants.colors.warning,
  };

  return msg.edit({ embeds: [embed], components: [] }).catch(() => null);
};
