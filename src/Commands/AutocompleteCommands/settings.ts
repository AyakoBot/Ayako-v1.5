import type CT from '../../typings/CustomTypings';

const run: CT.AutocompleteCommand = async (
  cmd,
  language,
  lan: typeof import('../../Languages/lan-en.json')['slashCommands']['settings'],
) => {
  const declaredCategory = cmd.data.options.find((o) => o.name === 'category');
  if (!declaredCategory) return [{ name: lan.declareCategory, value: 'nothing' }];
  if (!('value' in declaredCategory)) return [{ name: language.error, value: 'nothing' }];

  const categoryLan = lan.categories[declaredCategory.value as keyof typeof lan.categories];
  return categoryLan.map((l) => ({ name: l, value: l }));
};

export default run;
