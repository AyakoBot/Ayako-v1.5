import type CT from '../../typings/CustomTypings';

export default {
  name: 'settings',
  perm: 32n,
  dm: false,
  type: 'other',
  execute: async (
    cmd: CT.CommandInteraction,
    langArgs: {
      language: typeof import('../../Languages/lan-en.json');
      lan: typeof import('../../Languages/lan-en.json')['slashCommands']['settings'];
    },
  ) => {
    if (!cmd.data.options || cmd.data.options[0].name === 'base') {
      (await import('./settings/settingsSelection')).default(cmd, langArgs);
    }
    (await import('./settings/manager')).default(cmd, langArgs.language);
  },
};
