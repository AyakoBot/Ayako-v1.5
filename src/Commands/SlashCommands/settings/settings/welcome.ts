import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'welcome',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.welcome;
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
        name: lan.channelid.name,
        value: `${settings.channelid ? `<#${settings.channelid}>` : baseObject.language.none}`,
        inline: true,
      },
      {
        name: lan.embed.name,
        value:
          (await client.ch.getEmbed(Number(settings.embed)))?.name || baseObject.language.Default,
        inline: true,
      },
      {
        name: lan.pingjoin.name,
        value: settings.pingjoin
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.pingroles.name,
        value: `${
          settings.pingroles && settings.pingroles.length
            ? settings.pingroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.pingusers.name,
        value: `${
          settings.pingusers && settings.pingusers.length
            ? settings.pingusers.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.welcome;
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
          label: lan.channelid.name,
          custom_id: `${baseCustomID}_channelid`,
          style: 2,
        },
        {
          type: 2,
          label: lan.embed.name,
          custom_id: `${baseCustomID}_embed`,
          style: 2,
        },
        {
          type: 2,
          label: lan.pingjoin.name,
          custom_id: `${baseCustomID}_pingjoin`,
          style: settings.pingjoin ? 3 : 4,
        },
      ],
      [
        {
          type: 2,
          label: lan.pingroles.name,
          custom_id: `${baseCustomID}_pingroles`,
          style: 2,
        },
        {
          type: 2,
          label: lan.pingusers.name,
          custom_id: `${baseCustomID}_pingusers`,
          style: 2,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM welcome WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.welcome[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO welcome (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.welcome[] | null) => (r ? r[0] : null));
