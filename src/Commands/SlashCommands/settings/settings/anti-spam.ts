import type Eris from 'eris';
import type CT from '../../../../typings/CustomTypings';

const setting: CT.SettingsFile = {
  displayEmbed: async (
    interaction: Eris.Interaction,
    language: typeof import('../../../../Languages/lan-en.json'),
    embed: Eris.Embed,
  ) => {},
};

export default setting;
