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
    const lan = baseObject.language.slashCommands.settings.settings['anti-raid'];
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
        name: lan.jointhreshold.name,
        value: `${settings.jointhreshold}`,
        inline: true,
      },
      {
        name: lan.time.name,
        value: `${moment
          .duration(Number(settings.time))
          .format(
            `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
            { trim: 'all' },
          )}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.punishmenttof.name,
        value: settings.punishmenttof
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.punishment.name,
        value: `${
          baseObject.language.punishments[
            settings.punishment as keyof typeof baseObject.language.punishments
          ] || baseObject.language.none
        }`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.posttof.name,
        value: settings.posttof
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.postchannel.name,
        value: `${settings.postchannel ? `<#${settings.postchannel}>` : baseObject.language.none}`,
        inline: true,
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
    const lan = baseObject.language.slashCommands.settings.settings['anti-raid'];
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
          label: lan.jointhreshold.name,
          custom_id: `${baseCustomID}_jointhreshold`,
          style: 1,
        },
        {
          type: 2,
          label: lan.time.name,
          custom_id: `${baseCustomID}_time`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.punishmenttof.name,
          custom_id: `${baseCustomID}_punishmenttof`,
          style: settings.punishmenttof ? 3 : 4,
        },
        {
          type: 2,
          label: lan.punishment.name,
          custom_id: `${baseCustomID}_punishment`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.posttof.name,
          custom_id: `${baseCustomID}_posttof`,
          style: settings.posttof ? 3 : 4,
        },
        {
          type: 2,
          label: lan.postchannel.name,
          custom_id: `${baseCustomID}_postchannel`,
          style: 1,
        },
        {
          type: 2,
          label: lan.pingroles.name,
          custom_id: `${baseCustomID}_pingroles`,
          style: 1,
        },
        {
          type: 2,
          label: lan.pingusers.name,
          custom_id: `${baseCustomID}_pingusers`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM antiraid WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.antiraid[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO antiraid (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.antiraid[] | null) => (r ? r[0] : null));
