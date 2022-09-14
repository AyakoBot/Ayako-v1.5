import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'suggestions',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.suggestions;
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
        name: lan.anonvote.name,
        value: settings.anonvote
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.anonsuggestion.name,
        value: settings.anonsuggestion
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.approverroleid.name,
        value: `${
          settings.approverroleid && settings.approverroleid.length
            ? settings.approverroleid.map((id) => ` <#${id}>`)
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
        name: lan.novoteroles.name,
        value: `${
          settings.novoteroles && settings.novoteroles.length
            ? settings.novoteroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.novoteusers.name,
        value: `${
          settings.novoteusers && settings.novoteusers.length
            ? settings.novoteusers.map((id) => ` <@${id}>`)
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
        name: lan.nosendroles.name,
        value: `${
          settings.nosendroles && settings.nosendroles.length
            ? settings.nosendroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.nosendusers.name,
        value: `${
          settings.nosendusers && settings.nosendusers.length
            ? settings.nosendusers.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.suggestions;
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
          label: lan.anonvote.name,
          custom_id: `${baseCustomID}_anonvote`,
          style: settings.anonvote ? 3 : 4,
        },
        {
          type: 2,
          label: lan.anonsuggestion.name,
          custom_id: `${baseCustomID}_anonsuggestion`,
          style: settings.anonsuggestion ? 3 : 4,
        },
        {
          type: 2,
          label: lan.approverroleid.name,
          custom_id: `${baseCustomID}_approverroleid`,
          style: 2,
        },
      ],
      [
        {
          type: 2,
          label: lan.novoteroles.name,
          custom_id: `${baseCustomID}_novoteroles`,
          style: 2,
        },
        {
          type: 2,
          label: lan.novoteusers.name,
          custom_id: `${baseCustomID}_novoteusers`,
          style: settings.anonvote ? 3 : 4,
        },
      ],
      [
        {
          type: 2,
          label: lan.nosendroles.name,
          custom_id: `${baseCustomID}_nosendroles`,
          style: 2,
        },
        {
          type: 2,
          label: lan.nosendusers.name,
          custom_id: `${baseCustomID}_nosendusers`,
          style: settings.anonvote ? 3 : 4,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM suggestionsettings WHERE guildid = $1;`, [
      baseObject.interactions[0].guildID,
    ])
    .then((r: DBT.suggestionsettings[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO suggestionsettings (guildid) VALUES ($1);`, [
      baseObject.interactions[0].guildID,
    ])
    .then((r: DBT.suggestionsettings[] | null) => (r ? r[0] : null));
