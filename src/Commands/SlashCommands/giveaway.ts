import type CT from '../../typings/CustomTypings';

export default {
  name: 'giveaway',
  perm: 32n,
  dm: false,
  type: 'giveaway',
  execute: async (
    cmd: CT.CommandInteraction,
    langArgs: {
      language: typeof import('../../Languages/lan-en.json');
      lan: typeof import('../../Languages/lan-en.json')['slashCommands']['giveaway'];
    },
  ) => {
    if (!cmd.data.options) return;

    switch (cmd.data.options[0].name) {
      case 'create': {
        (await import('./giveaway/create')).default(cmd, langArgs);
        break;
      }
      case 'edit': {
        (await import('./giveaway/edit')).default(cmd, langArgs);
        break;
      }
      case 'end': {
        (await import('./giveaway/end')).manualEnd(cmd, langArgs);
        break;
      }
      case 'reroll': {
        (await import('./giveaway/reroll')).default(cmd, langArgs);
        break;
      }
      default: {
        break;
      }
    }
  },
};
