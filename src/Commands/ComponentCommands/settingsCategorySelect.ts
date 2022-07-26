import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (
  cmd: CT.ComponentInteraction,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  const lan = language.slashCommands.settings;

  if (!('values' in cmd.data)) return;
  const selectedCategory = cmd.data.values[0];
  if (!selectedCategory) return;

  const settingsObj = client.constants.commands.settings.categories.find(
    (c) => c.name === selectedCategory,
  );
  if (!settingsObj) return;

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
    fields: settingsObj.categories.map((s) => ({
      name: `${
        client.constants.commands.settings.colors[
          s.category as keyof typeof client.constants.commands.settings.colors
        ]
      } ${lan.settingsNames[s.name as keyof typeof lan.settingsNames]}`,
      value: `> ${lan.settingsDescriptions[s.name as keyof typeof lan.settingsDescriptions]}`,
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
      default: c.name === selectedCategory,
    })),
  };

  const settingsSelect: Eris.SelectMenu = {
    type: 3,
    custom_id: 'settingsSelect',
    options: settingsObj.categories.map((c) => ({
      label: lan.settingsNames[c.name as keyof typeof lan.settingsNames],
      value: c.name,
      emoji: {
        name: client.constants.commands.settings.colors[
          c.category as keyof typeof client.constants.commands.settings.colors
        ],
        id: null,
      },
    })),
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

  cmd.editParent({ embeds: [embed], components }).catch(() => null);
};
