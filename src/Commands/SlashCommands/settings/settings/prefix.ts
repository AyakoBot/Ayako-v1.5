import type CT from '../../../../typings/CustomTypings';

const setting: CT.SettingsFile = {
  name: 'language',
  type: 'single',
  async displayEmbed(BaseSettingsObject) {
    return (await import('./overview')).default.displayEmbed(BaseSettingsObject);
  },
  async buttons(BaseSettingsObject) {
    return (await import('./overview')).default.buttons(BaseSettingsObject);
  },
};

export default setting;
