import type CT from '../../typings/CustomTypings';

export default async (cmd: CT.ComponentInteraction, language: CT.Language) => {
  const args = cmd.data.custom_id.split(/_/g);

  if (args[1] !== 'goto') return;

  switch (args[2]) {
    case 'base': {
      (await import('../SlashCommands/settings/settingsSelection')).default(cmd, {
        lan: language.slashCommands.settings,
        language,
      });
      break;
    }
    default: {
      break;
    }
  }
};
