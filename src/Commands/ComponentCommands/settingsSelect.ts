import type CT from '../../typings/CustomTypings';

export default async (
  cmd: CT.ComponentInteraction,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  if (!('values' in cmd.data)) return;
  const selectedSetting = cmd.data.values[0];
  if (!selectedSetting) return;

  (await import('../SlashCommands/settings/manager')).default(cmd, language);
};
