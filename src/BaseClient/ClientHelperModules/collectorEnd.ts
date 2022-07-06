import type Eris from 'eris';
import constants from '../Other/Constants.json' assert { type: 'json' };
import edit from './edit';

export default (msg: Eris.Message, language: typeof import('../../Languages/lan-en.json')) => {
  const embed = {
    type: 'rich',
    description: language.timeError,
    color: constants.colors.warning,
  };

  return edit(msg, { embeds: [embed], components: [] });
};
