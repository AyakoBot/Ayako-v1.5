import type * as Eris from 'eris';
import fs from 'fs';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

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
      edit(cmd);
      break;
    }
    default: {
      break;
    }
  }
};

const edit = async (cmd: CT.ComponentInteraction) => {
  const [, , , uniquetimestamp, name, field] = cmd.data.custom_id.split(/_/g);
  if (!name) return;
  if (!field) return;

  if (!(name in client.constants.commands.settings.settings)) {
    throw new Error(`${name} does not exist in Settings Constants`);
  }

  const constantsField =
    client.constants.commands.settings.settings[
      name as keyof typeof client.constants.commands.settings.settings
    ];

  if (!(field in constantsField)) throw new Error(`${field} does not exist in ${name}`);

  const typeOfField = constantsField[field as keyof typeof constantsField];

  const editor = await getEditor(typeOfField);
  if (!editor) throw new Error(`Editor for Type ${typeOfField} not found`);

  const earlierRow = await getSetting(cmd, name, Number(uniquetimestamp));
  if (!earlierRow) return;

  const newRow = await editor.run(cmd, earlierRow, typeOfField);
  if (newRow) {
    await putNewSettings(cmd, name, newRow, Number(uniquetimestamp));
  }

  (cmd.data as Eris.ComponentInteractionSelectMenuData).values = [name];
  (await import('../SlashCommands/settings/manager')).default(cmd, cmd.language);
};

const putNewSettings = async (
  cmd: CT.ComponentInteraction,
  name: string,
  newRow: CT.BasicReturnType,
  uniquetimestamp: number,
) => {
  await client.ch.query(
    `DELETE FROM ${
      client.constants.commands.settings.tableNames[
        name as keyof typeof client.constants.commands.settings.tableNames
      ]
    } WHERE ${uniquetimestamp === 0 ? `guildid = $1` : `uniquetimestamp = $1`};`, // js
    [uniquetimestamp === 0 ? cmd.guildID : uniquetimestamp],
  );

  await client.ch.query(
    `INSERT INTO ${
      client.constants.commands.settings.tableNames[
        name as keyof typeof client.constants.commands.settings.tableNames
      ]
    } (${Object.keys(newRow).join(', ')}) VALUES (${Object.values(newRow)
      .map((_v, i) => `$${i + 1}`)
      .join(', ')});`,
    Object.values(newRow),
  );
};

const getSetting = async (cmd: CT.ComponentInteraction, name: string, uniquetimestamp: number) =>
  client.ch
    .query(
      `SELECT * FROM ${
        client.constants.commands.settings.tableNames[
          name as keyof typeof client.constants.commands.settings.tableNames
        ]
      } WHERE ${uniquetimestamp === 0 ? `guildid = $1` : `uniquetimestamp = $1`};`,
      [uniquetimestamp === 0 ? cmd.guildID : uniquetimestamp],
    )
    .then((r) => (r ? r[0] : null));

const getEditor = async (type: string) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/ComponentCommands/editors`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.Editor | undefined | null = files
    .map((f, i) => {
      const { default: possibleFile }: { default: CT.Editor } = possibleFiles[i];

      if (possibleFile.handles?.includes(type) || f.replace('.js', '') === type) {
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};

export const getEditingEmbed = async (
  cmd: CT.ComponentInteraction,
  row: CT.BasicReturnType,
  editor: CT.Editor,
  command: Eris.ApplicationCommand,
): Promise<Eris.Embed> => {
  const [, , , , name, field] = cmd.data.custom_id.split(/_/g);

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: cmd.language.slashCommands.settings.editingAuthor,
      icon_url: client.objectEmotes.settings.link,
      url: client.constants.standard.invite,
    },
    color: client.constants.colors.ephemeral,
    description: await getSelected(cmd, row, field, name, editor),
    fields: [
      {
        name: '\u200b',
        value: client.ch.stp(cmd.language.slashCommands.settings.useToEdit, { command }),
      },
    ],
  };

  return embed;
};

const getSelected = (
  cmd: CT.ComponentInteraction,
  row: CT.BasicReturnType,
  field: string,
  settingsName: string,
  editor: CT.Editor,
) => {
  const error = (
    expected: string,
    actual: string | number | boolean | (string | number | boolean | null)[] | null,
  ) => {
    throw new Error(
      `Wrong type of data passed\nExpected: "${expected}", actual: "${JSON.stringify(
        actual,
        null,
        2,
      )}"`,
    );
  };

  if (!cmd.guild) return '';
  if (!cmd.guildID) return '';

  const data = row[field as keyof typeof row];

  const settingsType =
    client.constants.commands.settings.fieldTypes[
      settingsName as keyof typeof client.constants.commands.settings.fieldTypes
    ];
  if (!settingsType) throw new Error(`Missing settingsType for "${settingsName}"`);

  const type = settingsType[field as keyof typeof settingsType];
  if (!type) throw new Error(`Missing type for "${type}" in "${settingsName}"`);
  if (!data || (Array.isArray(data) && !data.length)) return cmd.language.none;

  switch (type) {
    case 'users': {
      if (!Array.isArray(data)) {
        error('User Array', data);
        return '';
      }

      return data.map((id) => `<@${id}>`).join(', ');
    }
    case 'user': {
      if (typeof data !== 'string') {
        error('User String', data);
        return '';
      }

      return `<@${data}>`;
    }
    case 'channels': {
      if (!Array.isArray(data)) {
        error('Channel Array', data);
        return '';
      }

      return data.map((id) => `<#${id}>`).join(', ');
    }
    case 'channel': {
      if (typeof data !== 'string') {
        error('Channel String', data);
        return '';
      }

      return `<#${data}>`;
    }
    case 'roles': {
      if (!Array.isArray(data)) {
        error('Role Array', data);
        return '';
      }

      return data.map((id) => `<@&${id}>`).join(', ');
    }
    case 'role': {
      if (typeof data !== 'string') {
        error('Role String', data);
        return '';
      }

      return `<@&${data}>`;
    }
    case 'number': {
      if (typeof data !== 'string' || Number.isNaN(+data)) {
        error('Number', data);
        return '';
      }

      return data;
    }
    case 'string':
    case 'command': {
      if (typeof data !== 'string') {
        error('String or Command', data);
        return '';
      }

      return data;
    }
    case 'strings':
    case 'commands': {
      if (!Array.isArray(data)) {
        error('String Array or Command Array', data);
        return '';
      }

      return data.map((s) => `\`${s}\``).join(', ');
    }
    default: {
      if (!editor.getSelected) throw new Error(`Type for ${type} has no handler`);
      return editor.getSelected();
    }
  }
};
