import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'verification',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.verification;
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
        name: lan.finishedrole.name,
        value: `${
          settings.finishedrole ? `<@&${settings.finishedrole}>` : baseObject.language.none
        }`,
        inline: true,
      },
      {
        name: lan.pendingrole.name,
        value: `${settings.pendingrole ? `<@&${settings.pendingrole}>` : baseObject.language.none}`,
        inline: true,
      },
      {
        name: lan.startchannel.name,
        value: `${
          settings.startchannel ? `<#${settings.startchannel}>` : baseObject.language.none
        }`,
        inline: true,
      },
      {
        name: lan.selfstart.name,
        value: settings.selfstart
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.logchannel.name,
        value: `${settings.logchannel ? `<#${settings.logchannel}>` : baseObject.language.none}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.kicktof.name,
        value: settings.kicktof
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,

        inline: false,
      },
      {
        name: lan.kickafter.name,
        value: `${moment
          .duration(Number(settings.kickafter))
          .format(
            `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
            { trim: 'all' },
          )}`,
        inline: true,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.verification;
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
          label: lan.finishedrole.name,
          custom_id: `${baseCustomID}_channelid`,
          style: 2,
        },
        {
          type: 2,
          label: lan.pendingrole.name,
          custom_id: `${baseCustomID}_pendingrole`,
          style: 2,
        },
        {
          type: 2,
          label: lan.startchannel.name,
          custom_id: `${baseCustomID}_startchannel`,
          style: 2,
        },
        {
          type: 2,
          label: lan.selfstart.name,
          custom_id: `${baseCustomID}_selfstart`,
          style: settings.selfstart ? 3 : 4,
        },
        {
          type: 2,
          label: lan.logchannel.name,
          custom_id: `${baseCustomID}_logchannel`,
          style: 2,
        },
      ],
      [
        {
          type: 2,
          label: lan.kicktof.name,
          custom_id: `${baseCustomID}_kicktof`,
          style: settings.kicktof ? 3 : 4,
        },
        {
          type: 2,
          label: lan.kickafter.name,
          custom_id: `${baseCustomID}_kickafter`,
          style: 2,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM verification WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.verification[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO verification (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.verification[] | null) => (r ? r[0] : null));
