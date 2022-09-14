import type Eris from 'eris';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'separators',
  type: 'multi',
  listEmbed: async (baseObject) => {
    const existing = await client.ch
      .query(`SELECT * FROM roleseparator WHERE guildid = $1;`, [
        baseObject.interactions[0].guildID,
      ])
      .then((r: DBT.roleseparator[] | null) => r);

    if (!existing) {
      baseObject.embed.footer = {
        text: baseObject.language.slashCommands.settings.noneFound,
        icon_url: client.constants.standard.error,
      };
      return;
    }

    baseObject.embed.fields = [];
    for (let i = 0; i < existing.length; i += 1) {
      const r = existing[i];

      baseObject.embed.fields.push({
        name: `${baseObject.language.Number}: \`${i + 1}\` | ${
          r.active
            ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
            : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`
        }`,
        value: `${baseObject.language.name}: ${r.name || baseObject.language.none}`,
        inline: true,
      });
    }
  },
  displayEmbed: async (baseObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.separators;
    const settings = await getSettings(baseObject);
    if (!settings) return;

    baseObject.embed.fields = [
      {
        name: lanSetting.active,
        value: settings.active
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.name.name,
        value: `${settings.name}`,
        inline: false,
      },
      {
        name: lan.isvarying.name,
        value: settings.isvarying
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,

        inline: false,
      },
      {
        name: lan.separator.name,
        value: `${settings.separator ? `<@&${settings.separator}>` : baseObject.language.none}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
    ];

    if (settings.isvarying) {
      baseObject.embed.fields.push({
        name: lan.stoprole.name,
        value: `${settings.stoprole ? `<@&${settings.stoprole}>` : baseObject.language.none}`,
        inline: false,
      });
    } else {
      baseObject.embed.fields.push({
        name: lan.roles.name,
        value: `${
          settings.roles && settings.roles.length
            ? settings.roles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      });
    }
  },
  buttons: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.separators;
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_${baseObject.uniquetimestamp}_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    const returnArray = [
      [
        {
          type: 2,
          label: baseObject.language.slashCommands.settings.active,
          custom_id: `${baseCustomID}_active`,
          style: settings.active ? 3 : 4,
        },
      ],
      [
        {
          type: 2,
          label: lan.name.name,
          custom_id: `${baseCustomID}_name`,
          style: 1,
        },
        {
          type: 2,
          label: lan.separator.name,
          custom_id: `${baseCustomID}_separator`,
          style: 1,
        },
        {
          type: 2,
          label: lan.isvarying.name,
          custom_id: `${baseCustomID}_isvarying`,
          style: settings.name ? 3 : 4,
        },
      ],
    ];

    if (settings.isvarying) {
      returnArray.push([
        {
          type: 2,
          label: lan.stoprole.name,
          custom_id: `${baseCustomID}_stoprole`,
          style: 1,
        },
      ]);
    } else {
      returnArray.push([
        {
          type: 2,
          label: lan.roles.name,
          custom_id: `${baseCustomID}_roles`,
          style: 1,
        },
      ]);
    }

    return returnArray as Eris.Button[][];
  },
};

export default setting;

const getSettings = (baseObject: CT.MultiSettingsObject) =>
  client.ch
    .query(`SELECT * FROM roleseparator WHERE guildid = $1 AND uniquetimestamp = $2;`, [
      baseObject.interactions[0].guildID,
      baseObject.uniquetimestamp,
    ])
    .then((r: DBT.roleseparator[] | null) => (r ? r[0] : r));
