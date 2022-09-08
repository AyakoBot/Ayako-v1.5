import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'anti-virus-punishments',
  type: 'multi',
  listEmbed: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['anti-virus-punishments'];
    const existing = await client.ch
      .query(`SELECT * FROM antiviruspunishments WHERE guildid = $1;`, [
        baseObject.interactions[0].guildID,
      ])
      .then((r: DBT.autopunish[] | null) => r);

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
      const punishment = r.punishment
        ? baseObject.language.punishments[
            r.punishment as keyof typeof baseObject.language.punishments
          ]
        : baseObject.language.none;
      baseObject.embed.fields.push({
        name: `${baseObject.language.Number}: \`${i + 1}\` | ${
          r.active
            ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
            : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`
        }`,
        value: `${baseObject.language.Punishment}: ${punishment}\n${lan.warnamount.name}: ${
          r.warnamount ? r.warnamount : baseObject.language.none
        }`,
        inline: true,
      });
    }
  },
  displayEmbed: async (baseObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings['anti-virus-punishments'];
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
        name: lan.warnamount.name,
        value: `${Number(settings.warnamount) || '-'}`,
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
        name: lan.duration.name,
        value: `${moment
          .duration(Number(settings.duration))
          .format(
            `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
            { trim: 'all' },
          )}`,
        inline: true,
      },
    ];
  },

  buttons: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['anti-virus-punishments'];
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
          label: lan.warnamount.name,
          custom_id: `${baseCustomID}_warnamount`,
          style: 1,
        },
        {
          type: 2,
          label: lan.punishment.name,
          custom_id: `${baseCustomID}_punishment`,
          style: 1,
        },
        {
          type: 2,
          label: lan.duration.name,
          custom_id: `${baseCustomID}_duration`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.MultiSettingsObject) =>
  client.ch
    .query(`SELECT * FROM antiviruspunishments WHERE guildid = $1 AND uniquetimestamp = $2;`, [
      baseObject.interactions[0].guildID,
      baseObject.uniquetimestamp,
    ])
    .then((r: DBT.antiviruspunishments[] | null) => (r ? r[0] : r));
