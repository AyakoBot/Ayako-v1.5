import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

const run: CT.AutocompleteCommand = async (
  cmd,
  language,
  lan: typeof import('../../Languages/lan-en.json')['slashCommands']['settings'],
) => {
  const declaredCategory = cmd.data.options[0].name;
  if (!declaredCategory) return [{ name: lan.declareCategory, value: 'nothing' }];

  const category = client.constants.commands.settings.categories.find(
    (c) => c.name === declaredCategory,
  );
  if (!category) return [{ name: language.error, value: 'nothing' }];

  return category.categories.map((c) => ({
    name: lan.settingsNames[c.name as keyof typeof lan.settingsNames],
    value: c.name,
  }));
};

export default run;
