import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'auto-roles',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings['auto-roles'];
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    baseObject.embed.fields = [
      {
        name: lanSetting.active,
        value: settings.active
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.userroleid.name,
        value: `${
          settings.userroleid && settings.userroleid.length
            ? settings.userroleid.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.botroleid.name,
        value: `${
          settings.botroleid && settings.botroleid.length
            ? settings.botroleid.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.allroleid.name,
        value: `${
          settings.allroleid && settings.allroleid.length
            ? settings.allroleid.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['auto-roles'];
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_0_${baseObject.setting.name}`;
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
          label: lan.userroleid.name,
          custom_id: `${baseCustomID}_userroleid`,
          style: 1,
        },
        {
          type: 2,
          label: lan.botroleid.name,
          custom_id: `${baseCustomID}_botroleid`,
          style: 1,
        },
        {
          type: 2,
          label: lan.allroleid.name,
          custom_id: `${baseCustomID}_allroleid`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM autoroles WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.autoroles[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO autoroles (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.autoroles[] | null) => (r ? r[0] : null));
