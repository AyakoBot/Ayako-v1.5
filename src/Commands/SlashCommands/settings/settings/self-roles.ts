import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'self-roles',
  type: 'multi',
  listEmbed: async (baseObject) => {
    const existing = await client.ch
      .query(`SELECT * FROM selfroles WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
      .then((r: DBT.selfroles[] | null) => r);

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
    const lan = baseObject.language.slashCommands.settings.settings['self-roles'];
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
        value: `${settings.name || baseObject.language.none}`,
        inline: false,
      },
      {
        name: lan.roles.name,
        value: `${
          settings.roles && settings.roles.length
            ? settings.roles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.onlyone.name,
        value: settings.onlyone
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,

        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.blacklistedroles.name,
        value: `${
          settings.blacklistedroles && settings.blacklistedroles.length
            ? settings.blacklistedroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.blacklistedusers.name,
        value: `${
          settings.blacklistedusers && settings.blacklistedusers.length
            ? settings.blacklistedusers.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.whitelistedroles.name,
        value: `${
          settings.whitelistedroles && settings.whitelistedroles.length
            ? settings.whitelistedroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.whitelistedusers.name,
        value: `${
          settings.whitelistedusers && settings.whitelistedusers.length
            ? settings.whitelistedusers.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },

  buttons: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['self-roles'];
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_${baseObject.uniquetimestamp}_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    return [
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
          label: lan.roles.name,
          custom_id: `${baseCustomID}_roles`,
          style: 1,
        },
        {
          type: 2,
          label: lan.onlyone.name,
          custom_id: `${baseCustomID}_onlyone`,
          style: settings.name ? 3 : 4,
        },
      ],
      [
        {
          type: 2,
          label: lan.blacklistedroles.name,
          custom_id: `${baseCustomID}_blacklistedroles`,
          style: 1,
        },
        {
          type: 2,
          label: lan.blacklistedusers.name,
          custom_id: `${baseCustomID}_blacklistedusers`,
          style: 1,
        },
        {
          type: 2,
          label: lan.whitelistedroles.name,
          custom_id: `${baseCustomID}_whitelistedroles`,
          style: 1,
        },
        {
          type: 2,
          label: lan.whitelistedusers.name,
          custom_id: `${baseCustomID}_whitelistedusers`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.MultiSettingsObject) =>
  client.ch
    .query(`SELECT * FROM selfroles WHERE guildid = $1 AND uniquetimestamp = $2;`, [
      baseObject.interactions[0].guildID,
      baseObject.uniquetimestamp,
    ])
    .then((r: DBT.selfroles[] | null) => (r ? r[0] : r));
