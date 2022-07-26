import type * as Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default (
  cmd: CT.CommandInteraction,
  {
    language,
    lan,
  }: {
    language: typeof import('../../../Languages/lan-en.json');
    lan: typeof import('../../../Languages/lan-en.json')['slashCommands']['settings'];
  },
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.author,
      icon_url: client.objectEmotes.settings.link,
      url: client.constants.standard.invite,
    },
    color: client.constants.colors.ephemeral,
    description: `${lan.nameDescription}\n\`\`\`${Object.entries(lan.colorNames)
      .map(
        ([key, name]) =>
          `${
            client.constants.commands.settings.colors[
              key as keyof typeof client.constants.commands.settings.colors
            ]
          } = ${name}`,
      )
      .join('\n')}\`\`\`\n\u200b`,
    fields: client.constants.commands.settings.categories.map((category) => ({
      name: lan.categories[category.name as keyof typeof lan.categories],
      value: `\`\`\`${chunk(
        category.categories.map((cat) =>
          spaces(
            25,
            `${
              client.constants.commands.settings.colors[
                cat.category as keyof typeof client.constants.commands.settings.colors
              ]
            }${lan.settingsNames[cat.name as keyof typeof lan.settingsNames]}`,
          ),
        ),
      )}\`\`\``,
      inline: false,
    })),
  };

  const categorySelect: Eris.SelectMenu = {
    type: 3,
    disabled: false,
    custom_id: 'settingsCategorySelect',
    placeholder: lan.selectCategory,
    options: client.constants.commands.settings.categories.map((c) => ({
      label: lan.categories[c.name as keyof typeof lan.categories],
      value: c.name,
    })),
  };

  const settingsSelect: Eris.SelectMenu = {
    type: 3,
    disabled: true,
    custom_id: 'placeholder',
    placeholder: lan.selectSetting,
    options: [{ label: 'placeholder', value: 'placeholder' }],
  };

  const components: Eris.ActionRow[] = [
    {
      type: 1,
      components: [categorySelect],
    },
    {
      type: 1,
      components: [settingsSelect],
    },
  ];

  client.ch.reply(cmd, { embeds: [embed], components }, language);
};

const spaces = (amount: number, text: string) =>
  `${text}${' '.repeat(Math.abs(amount - text.length))}`;

const chunk = (arr: string[]) => {
  const nestedArrs: string[][] = [[]];
  let lastI = 0;

  arr.forEach((entry) => {
    if (nestedArrs[lastI].length === 2) {
      lastI += 1;
      nestedArrs[lastI] = [entry];
    } else nestedArrs[lastI].push(entry);
  });

  return nestedArrs.map((arrs) => arrs.join('')).join('\n');
};
