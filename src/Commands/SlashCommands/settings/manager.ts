import type * as Eris from 'eris';
import fs from 'fs';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  cmd: CT.CommandInteraction | CT.ComponentInteraction,
  language: CT.Language,
) => {
  const selectedSetting = getSelectedSetting(cmd);
  if (!selectedSetting) return;

  const rawSettingsFile = await getSettingsFile(selectedSetting);
  if (!rawSettingsFile) {
    throw new Error(`Settings File for Setting ${selectedSetting} does not exist`);
  }
  const settingsFile = rawSettingsFile.default;
  settingsFile.name = selectedSetting;

  const con =
    client.constants.commands.settings.settings[
      selectedSetting as keyof typeof client.constants.commands.settings.settings
    ];
  if (!con) throw new Error(`Constants for Setting ${selectedSetting} do not exist`);

  const lan =
    language.slashCommands.settings.settings[
      selectedSetting as keyof typeof language.slashCommands.settings.settings
    ];
  if (!lan) throw new Error(`Lan for Setting ${selectedSetting} does not exist`);

  const baseObject: CT.BaseSettingsObject = {
    setting: settingsFile,
    interactions: [cmd],
    page: 0,
    language,
    embed: getBaseEmbed({ language, setting: settingsFile }),
  };

  await getDisplayEmbed(baseObject);
};

const getDisplayEmbed = async (baseObject: CT.BaseSettingsObject) => {
  if (baseObject.setting.type === 'single') return baseObject.setting.displayEmbed(baseObject);

  if (baseObject.setting.type === 'multi') {
    return getSelectedRowFromSetting(baseObject);
  }
  return null;
};

const getSelectedRowFromSetting = async (baseObject: CT.BaseSettingsObject) => {
  (baseObject.setting as CT.MultiSettings).listEmbed(baseObject);

  const rows = await getMultiRows(baseObject);

  const listMenu: Eris.SelectMenu = {
    type: 3,
    custom_id: `${baseObject.setting.name}_${baseObject.interactions[0].user.id}_settingsSelect_multi`,
    placeholder: baseObject.language.slashCommands.settings.mmrPlaceholder,
    disabled: !rows,
    min_values: 1,
    max_values: 1,
    options: rows
      ? rows.slice(0, 25).map((r, i) => {
          const identifiers =
            client.constants.commands.settings.mrmIdentifiers[
              baseObject.setting
                .name as keyof typeof client.constants.commands.settings.mrmIdentifiers
            ];

          let label = '';
          const emoji: { id?: string; animated?: boolean; name?: string } = {};

          identifiers.forEach((identifier) => {
            if (!identifier) return;
            if (label) return;

            switch (identifier.type) {
              case 'role': {
                label = `<@&${identifier.ident}>`;
                break;
              }
              case 'channel': {
                label = `<#${identifier.ident}>`;
                break;
              }
              case 'emote': {
                emoji.animated = identifier.ident.startsWith('<a');
                emoji.id = identifier.ident.split(/:/g)[emoji.animated ? 1 : 0].replace(/</g, '');
                emoji.name = identifier.ident.split(/:/g)[emoji.animated ? 2 : 1].replace(/>/g, '');
                break;
              }
              default: {
                label = String(r[identifier.ident]);
                break;
              }
            }
          });

          return {
            label: `${label ? `ID: ${i} | ${label}` : `ID: ${i}`}`,
            value: String(r.uniquetimestamp),
            emoji: emoji.name ? emoji : undefined,
          };
        })
      : [{ label: 'placeholder', value: 'placeholder' }],
  };

  const components = client.ch.buttonRower([
    [listMenu],
    [
      {
        type: 2,
        custom_id: `settings_${baseObject.interactions[0].user.id}_${baseObject.setting.name}_page_${baseObject.page}_prev`,
        emoji: { id: null, name: '⬅️' },
        style: 2,
      },
      {
        type: 2,
        custom_id: `settings_${baseObject.interactions[0].user.id}_${baseObject.setting.name}_page_${baseObject.page}_next`,
        emoji: { id: null, name: '➡️' },
        style: 2,
      },
    ],
    [
      {
        type: 2,
        custom_id: `settings_${baseObject.interactions[0].user.id}_goto_${
          client.constants.commands.settings.categories.find((c) =>
            c.categories.find((c2) => c2.name === baseObject.setting.name),
          )?.name
        }`,
        emoji: { id: null, name: '🔙' },
        style: 4,
      },
    ],
  ]);

  if (!('editParent' in baseObject.interactions[0])) {
    await client.ch.reply(
      baseObject.interactions[0],
      { embeds: [baseObject.embed], components },
      baseObject.language,
    );
  } else {
    await baseObject.interactions[0]
      .editParent({
        embeds: [baseObject.embed],
        components,
      })
      .catch(() => null);
  }
};

const getMultiRows = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(
      `SELECT * FROM ${
        client.constants.commands.settings.tableNames[
          baseObject.setting.name as keyof typeof client.constants.commands.settings.tableNames
        ]
      } WHERE guildid = $1;`,
      [baseObject.interactions[0].guildID],
    )
    .then((r: { [key: string]: string | number | null | boolean }[] | null) => r);

const getBaseEmbed = ({
  language,
  setting,
}: {
  language: CT.Language;
  setting: CT.SettingsFile;
}): Eris.Embed => ({
  type: 'rich',
  author: {
    name: client.ch.stp(language.slashCommands.settings.authorType, {
      type: language.slashCommands.settings.settingsNames[
        setting.name as keyof typeof language.slashCommands.settings.settingsNames
      ],
    }),
    icon_url: client.objectEmotes.settings.link,
    url: client.constants.standard.invite,
  },
  color: client.constants.colors.ephemeral,
});

const getSelectedSetting = (cmd: CT.CommandInteraction | CT.ComponentInteraction) => {
  if (!('values' in cmd.data) && !('options' in cmd.data)) return null;

  if ('values' in cmd.data) {
    return cmd.data.values[0];
  }

  if (
    !cmd.data.options ||
    !cmd.data.options[0] ||
    !('options' in cmd.data.options[0]) ||
    !(cmd.data.options[0].options?.[0] as Eris.InteractionDataOptionsString).value
  ) {
    return null;
  }

  return (
    ((cmd as CT.CommandInteraction).data.options?.[0] as Eris.InteractionDataOptionsSubCommand)
      .options?.[0] as Eris.InteractionDataOptionsString
  ).value as string;
};

const getSettingsFile = async (name: string) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/SlashCommands/settings/settings`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: { default: CT.SettingsFile } | undefined = files
    .map((fileName, i) => {
      const f: { default: CT.SettingsFile } = possibleFiles[i];
      if (fileName.replace('.js', '') === name) {
        return f;
      }
      return null;
    })
    .filter((f): f is { default: CT.SettingsFile } => !!f)
    .shift();

  return file;
};
