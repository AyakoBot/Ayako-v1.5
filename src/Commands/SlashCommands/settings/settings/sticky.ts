import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'sticky',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.sticky;
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    baseObject.embed.fields = [
      {
        name: lan.stickypermsactive.name,
        value: settings.stickypermsactive
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.stickyrolesactive.name,
        value: settings.stickyrolesactive
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.stickyrolesmode.name,
        value: settings.stickyrolesmode
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: settings.stickyrolesmode ? lan.stickyroles.name : lan.unstickyroles.name,
        value: `${
          settings.roles && settings.roles.length
            ? settings.roles.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.sticky;
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_0_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    return [
      [
        {
          type: 2,
          label: lan.stickypermsactive.name,
          custom_id: `${baseCustomID}_stickypermsactive`,
          style: settings.stickyrolesmode ? 3 : 4,
        },
        {
          type: 2,
          label: lan.stickyrolesactive.name,
          custom_id: `${baseCustomID}_stickyrolesactive`,
          style: settings.stickyrolesactive ? 3 : 4,
        },
        {
          type: 2,
          label: lan.stickyrolesmode.name,
          custom_id: `${baseCustomID}_stickyrolesmode`,
          style: settings.stickyrolesmode ? 3 : 4,
        },
        {
          type: 2,
          label: settings.stickyrolesmode ? lan.stickyroles.name : lan.unstickyroles.name,
          custom_id: `${baseCustomID}_roles`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM sticky WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.sticky[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO sticky (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.sticky[] | null) => (r ? r[0] : null));
