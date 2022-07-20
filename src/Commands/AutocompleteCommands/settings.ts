import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

const run: CT.AutocompleteCommand = async (
  cmd,
  language,
  lan: typeof import('../../Languages/lan-en.json')['slashCommands']['settings'],
) => {
  const declaredCategory = cmd.data.options.find((o) => o.name === 'category');
  if (!declaredCategory) return [{ name: lan.declareCategory, value: 'nothing' }];
  if (!('value' in declaredCategory)) return [{ name: language.error, value: 'nothing' }];

  const categories =
    client.constants.commands.settings.categories[
      declaredCategory.value as keyof typeof client.constants.commands.settings.categories
    ];
  return categories.map((c) => ({ name: c, value: c }));
};

export default run;
