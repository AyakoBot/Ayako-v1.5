import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';

export default async (cmd: CT.ComponentInteraction, language: CT.Language) => {
  const args = cmd.data.custom_id.split(/_/g);

  if (args[2] !== 'goto') return;

  switch (args[3]) {
    case 'base': {
      (await import('../SlashCommands/settings/settingsSelection')).default(cmd, {
        lan: language.slashCommands.settings,
        language,
      });
      break;
    }
    default: {
      (cmd.data as unknown as Eris.ComponentInteractionSelectMenuData).values = [args[2]];
      (await import('./settingsCategorySelect')).default(cmd, language);
      break;
    }
  }
};
