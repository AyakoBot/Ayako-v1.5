import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'disboard-reminders',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings['disboard-reminders'];
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
        value: settings.channelid ? `<#${settings.channelid}>` : baseObject.language.none,
        inline: true,
      },
      {
        name: lan.deletereply.name,
        value: settings.deletereply
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.repeatenabled.name,
        value: settings.repeatenabled
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.repeatreminder.name,
        value: `${moment
          .duration(Number(settings.repeatreminder))
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
        name: lan.channelid.name,
        value: `${settings.channelid ? `<#${settings.channelid}>` : baseObject.language.none}`,
        inline: true,
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
        name: lan.users.name,
        value: `${
          settings.users && settings.users.length
            ? settings.users.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['disboard-reminders'];
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
          label: lan.deletereply.name,
          custom_id: `${baseCustomID}_deletereply`,
          style: settings.deletereply ? 3 : 4,
        },
        {
          type: 2,
          label: lan.repeatenabled.name,
          custom_id: `${baseCustomID}_repeatenabled`,
          style: settings.repeatenabled ? 3 : 4,
        },
        {
          type: 2,
          label: lan.repeatreminder.name,
          custom_id: `${baseCustomID}_repeatreminder`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.channelid.name,
          custom_id: `${baseCustomID}_channelid`,
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
          label: lan.users.name,
          custom_id: `${baseCustomID}_users`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM disboard WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.disboard[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO disboard (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.disboard[] | null) => (r ? r[0] : null));
