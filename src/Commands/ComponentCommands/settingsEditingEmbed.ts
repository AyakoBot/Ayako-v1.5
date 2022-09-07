import type * as Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (
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
        inline: false,
      },
    ],
  };

  if (!name) return embed;
  if (!field) return embed;

  const settingsLan =
    cmd.language.slashCommands.settings.settings[
      name as keyof typeof cmd.language.slashCommands.settings.settings
    ];

  if (!settingsLan) {
    throw new Error(`${name} does not exist in Settings Language`);
  }

  if (!(field in settingsLan)) throw new Error(`${field} does not exist in ${name} Language`);
  const fieldLan = settingsLan[field as keyof typeof settingsLan] as { name: string; desc: string };

  if (embed.fields) {
    embed.fields.push({
      name: fieldLan.name,
      value: fieldLan.desc,
      inline: false,
    });
  }

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
    client.constants.commands.settings.settings[
      settingsName as keyof typeof client.constants.commands.settings.settings
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
    case 'punishment': {
      if (typeof data !== 'string') {
        error('String', data);
        return '';
      }

      return cmd.language.punishments[data as keyof typeof cmd.language.punishments];
    }
    case 'duration': {
      if (typeof data !== 'string') {
        error('String', data);
        return '';
      }

      return moment
        .duration(data)
        .format(
          `y [${cmd.language.time.years}], M [${cmd.language.time.months}], d [${cmd.language.time.days}], h [${cmd.language.time.hours}], m [${cmd.language.time.minutes}], s [${cmd.language.time.seconds}]`,
          { trim: 'all' },
        );
    }
    default: {
      if (!editor.getSelected) throw new Error(`Type for ${type} has no handler`);
      return editor.getSelected();
    }
  }
};
