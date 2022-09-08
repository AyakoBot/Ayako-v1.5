import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'anti-virus',
  type: 'single',
  relatedSettings: ['anti-virus-punishments'],
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings['anti-virus'];
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
        name: lan.minimizetof.name,
        value: settings.minimizetof
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.minimize.name,
        value: `${moment
          .duration(Number(settings.minimize))
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
        name: lan.deletetof.name,
        value: settings.deletetof
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.delete.name,
        value: `${moment
          .duration(Number(settings.delete))
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
        name: lan.linklogging.name,
        value: settings.linklogging
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.linklogchannels.name,
        value: `${
          settings.linklogchannels && settings.linklogchannels.length
            ? settings.linklogchannels.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['anti-virus'];
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
          label: lan.minimizetof.name,
          custom_id: `${baseCustomID}_minimizetof`,
          style: settings.minimizetof ? 3 : 4,
        },
        {
          type: 2,
          label: lan.minimize.name,
          custom_id: `${baseCustomID}_minimize`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.deletetof.name,
          custom_id: `${baseCustomID}_deletetof`,
          style: settings.deletetof ? 3 : 4,
        },
        {
          type: 2,
          label: lan.delete.name,
          custom_id: `${baseCustomID}_delete`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.linklogging.name,
          custom_id: `${baseCustomID}_linklogging`,
          style: settings.linklogging ? 3 : 4,
        },
        {
          type: 2,
          label: lan.linklogchannels.name,
          custom_id: `${baseCustomID}_linklogchannels`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM antivirus WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.antivirus[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO antivirus (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.antivirus[] | null) => (r ? r[0] : null));
