import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'guildsettings',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.overview;
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    baseObject.embed.fields = [
      {
        name: lan.prefix.name,
        value: `\`${client.constants.standard.prefix}\`${
          settings.prefix ? ` or \`${settings.prefix}\`` : ''
        }`,
        inline: true,
      },
      {
        name: lan.interactionsmode.name,
        value: `${
          settings.interactionsmode
            ? `${client.stringEmotes.small1}${client.stringEmotes.small2}`
            : client.stringEmotes.big
        }`,
        inline: true,
      },
      {
        name: lan.lan.name,
        value:
          baseObject.language.languages[settings.lan as keyof typeof baseObject.language.languages],
        inline: false,
      },
      {
        name: lan.errorchannel.name,
        value: `${
          settings.errorchannel ? `<#${settings.errorchannel}>` : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.vanity.name,
        value: `${
          hasAdminPerms(baseObject)
            ? settings.vanity || baseObject.language.none
            : `⚠️ ${lan.requiresAdmin}`
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.overview;
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_0_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    return [
      [
        {
          type: 2,
          label: lan.prefix.name,
          custom_id: `${baseCustomID}_prefix`,
          style: 1,
        },
        {
          type: 2,
          label: lan.interactionsmode.name,
          custom_id: `${baseCustomID}_interactionsmode`,
          style: settings.interactionsmode ? 3 : 2,
        },
        {
          type: 2,
          label: lan.lan.name,
          custom_id: `${baseCustomID}_lan`,
          style: 1,
        },
        {
          type: 2,
          label: lan.errorchannel.name,
          custom_id: `${baseCustomID}_errorchannel`,
          style: 1,
        },
        {
          type: 2,
          label: lan.vanity.name,
          custom_id: `${baseCustomID}_vanity`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM guildsettings WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.guildsettings[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO guildsettings (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.guildsettings[] | null) => (r ? r[0] : null));

const hasAdminPerms = (baseObject: CT.BaseSettingsObject) =>
  baseObject.interactions[0].guild?.members.get(client.user.id)?.permissions.has(8n);
