import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'anti-spam',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings['anti-spam'];
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
        name: lan.msgthreshold.name,
        value: `${settings.msgthreshold}`,
        inline: true,
      },
      {
        name: lan.dupemsgthreshold.name,
        value: `${settings.dupemsgthreshold}`,
        inline: true,
      },
      {
        name: lan.timeout.name,
        value: `${moment
          .duration(Number(settings.timeout))
          .format(
            `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
            { trim: 'all' },
          )}`,
        inline: true,
      },
      {
        name: lan.deletespam.name,
        value: settings.deletespam
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.wlchannelid.name,
        value: `${
          settings.wlchannelid && settings.wlchannelid.length
            ? settings.wlchannelid.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.wluserid.name,
        value: `${
          settings.wluserid && settings.wluserid.length
            ? settings.wluserid.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.wlroleid.name,
        value: `${
          settings.wlroleid && settings.wlroleid.length
            ? settings.wlroleid.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['anti-spam'];
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
          label: lan.wlchannelid.name,
          custom_id: `${baseCustomID}_wlchannelid`,
          style: 1,
        },
        {
          type: 2,
          label: lan.wluserid.name,
          custom_id: `${baseCustomID}_wluserid`,
          style: 1,
        },
        {
          type: 2,
          label: lan.wlroleid.name,
          custom_id: `${baseCustomID}_wlroleid`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.deletespam.name,
          custom_id: `${baseCustomID}_deletespam`,
          style: settings.deletespam ? 1 : 2,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM antispam WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.antispam[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO antispam (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.antispam[] | null) => (r ? r[0] : null));
