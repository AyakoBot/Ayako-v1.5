import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'blacklist',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.blacklist;
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    baseObject.embed.description = settings.words?.length
      ? `${settings.words.map((word) => `\`${word}\``).join(' | ')}`
      : undefined;

    baseObject.embed.fields = [
      {
        name: lanSetting.active,
        value: settings.active
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.bpchannelid.name,
        value: `${
          settings.bpchannelid && settings.bpchannelid.length
            ? settings.bpchannelid.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.bproleid.name,
        value: `${
          settings.bproleid && settings.bproleid.length
            ? settings.bproleid.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.bpuserid.name,
        value: `${
          settings.bpuserid && settings.bpuserid.length
            ? settings.bpuserid.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.blacklist;
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
          label: lan.bpchannelid.name,
          custom_id: `${baseCustomID}_bpchannelid`,
          style: 1,
        },
        {
          type: 2,
          label: lan.bproleid.name,
          custom_id: `${baseCustomID}_bproleid`,
          style: 1,
        },
        {
          type: 2,
          label: lan.bpuserid.name,
          custom_id: `${baseCustomID}_bpuserid`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.words.name,
          custom_id: `${baseCustomID}_words`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM blacklist WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.blacklist[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO blacklist (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.blacklist[] | null) => (r ? r[0] : null));
