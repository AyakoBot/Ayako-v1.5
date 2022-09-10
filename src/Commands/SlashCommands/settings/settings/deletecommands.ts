import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'deletecommands',
  type: 'multi',
  listEmbed: async (baseObject) => {
    const existing = await client.ch
      .query(`SELECT * FROM deletecommands WHERE guildid = $1;`, [
        baseObject.interactions[0].guildID,
      ])
      .then((r: DBT.deletecommands[] | null) => r);

    if (!existing) {
      baseObject.embed.footer = {
        text: baseObject.language.slashCommands.settings.noneFound,
        icon_url: client.constants.standard.error,
      };
      return;
    }

    baseObject.embed.fields = [];
    for (let i = 0; i < existing.length; i += 1) {
      const r = existing[i];
      baseObject.embed.fields.push({
        name: `${baseObject.language.Number}: \`${i + 1}\` | ${
          r.active
            ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
            : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`
        }`,
        value: `${baseObject.language.Command}: ${r.command || baseObject.language.none}`,
        inline: true,
      });
    }
  },
  displayEmbed: async (baseObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings['delete-commands'];
    const settings = await getSettings(baseObject);
    if (!settings) return;

    baseObject.embed.fields = [
      {
        name: lanSetting.active,
        value: settings.active
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.command.name,
        value: `${settings.command || baseObject.language.none}`,
        inline: true,
      },
      {
        name: lan.deletetimeout.name,
        value: `${moment
          .duration(Number(settings.deletetimeout))
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
        name: lan.deletereply.name,
        value: settings.deletereply
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: true,
      },
      {
        name: lan.deletecommand.name,
        value: settings.deletecommand
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
        name: lan.activechannelid.name,
        value: `${
          settings.activechannelid && settings.activechannelid.length
            ? settings.activechannelid.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
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
    ];
  },
  buttons: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['delete-commands'];
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_${baseObject.uniquetimestamp}_${baseObject.setting.name}`;
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
          label: lan.command.name,
          custom_id: `${baseCustomID}_command`,
          style: 1,
        },
        {
          type: 2,
          label: lan.deletetimeout.name,
          custom_id: `${baseCustomID}_deletetimeout`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.deletereply.name,
          custom_id: `${baseCustomID}_deletereply`,
          style: 1,
        },
        {
          type: 2,
          label: lan.deletecommand.name,
          custom_id: `${baseCustomID}_deletecommand`,
          style: 1,
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
          label: lan.activechannelid.name,
          custom_id: `${baseCustomID}_activechannelid`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.MultiSettingsObject) =>
  client.ch
    .query(`SELECT * FROM deletecommands WHERE guildid = $1 AND uniquetimestamp = $2;`, [
      baseObject.interactions[0].guildID,
      baseObject.uniquetimestamp,
    ])
    .then((r: DBT.deletecommands[] | null) => (r ? r[0] : r));
