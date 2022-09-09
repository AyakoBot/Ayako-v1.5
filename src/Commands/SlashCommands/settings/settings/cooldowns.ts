import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'cooldowns',
  type: 'multi',
  listEmbed: async (baseObject) => {
    const existing = await client.ch
      .query(`SELECT * FROM cooldowns WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
      .then((r: DBT.cooldowns[] | null) => r);

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
        value: `${baseObject.language.Command}: ${r.command || null}`,
        inline: true,
      });
    }
  },
  displayEmbed: async (baseObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.cooldowns;
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
        name: lan.cooldown.name,
        value: `${moment
          .duration(Number(settings.cooldown))
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
        name: lan.activechannelid.name,
        value: `${
          settings.activechannelid && settings.activechannelid.length
            ? settings.activechannelid.map((id) => ` <#${id}>`)
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
        name: lan.bpchannelid.name,
        value: `${
          settings.bpchannelid && settings.bpchannelid.length
            ? settings.bpchannelid.map((id) => ` <#${id}>`)
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
      {
        name: lan.bproleid.name,
        value: `${
          settings.bproleid && settings.bproleid.length
            ? settings.bproleid.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    ];
  },
  buttons: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.cooldowns;
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
          label: lan.cooldown.name,
          custom_id: `${baseCustomID}_cooldown`,
          style: 1,
        },
        {
          type: 2,
          label: lan.activechannelid.name,
          custom_id: `${baseCustomID}_activechannelid`,
          style: 1,
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
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.MultiSettingsObject) =>
  client.ch
    .query(`SELECT * FROM cooldowns WHERE guildid = $1 AND uniquetimestamp = $2;`, [
      baseObject.interactions[0].guildID,
      baseObject.uniquetimestamp,
    ])
    .then((r: DBT.cooldowns[] | null) => (r ? r[0] : r));
