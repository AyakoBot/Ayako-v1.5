import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';

export default async (cmd: CT.ComponentInteraction, language: CT.Language) => {
  const args = cmd.data.custom_id.split(/_/g);

  switch (args[2]) {
    case 'goto': {
      switch (args[3]) {
        case 'base': {
          (await import('../SlashCommands/settings/settingsSelection')).default(cmd, {
            lan: language.slashCommands.settings,
            language,
          });
          break;
        }
        default: {
          (cmd.data as unknown as Eris.ComponentInteractionSelectMenuData).values = [args[3]];
          (await import('./settingsCategorySelect')).default(cmd, language);
          break;
        }
      }
      break;
    }
    case 'edit': {
      (await import('./settingsEdit')).default(cmd);
      break;
    }
    case 'add': {
      (await import('./settingsAdd')).default(cmd);
      break;
    }
    case 'view': {
      (await import('./settingsView')).default(cmd);
      break;
    }
    case 'delete': {
      (await import('./settingsDelete')).default(cmd);
      break;
    }
    case 'gotosetting': {
      (cmd.data as unknown as Eris.ComponentInteractionSelectMenuData).values = [args[3]];
      (await import('../SlashCommands/settings/manager')).default(cmd, cmd.language);
      break;
    }
    default: {
      break;
    }
  }
};
