import moment from 'moment';
import 'moment-duration-format';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'expiry',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.expiry;
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    baseObject.embed.description = lan.desc;
    baseObject.embed.fields = [];

    ['bans', 'channelbans', 'kicks', 'mutes', 'warns'].forEach((name, i) => {
      const ntime = `${name}time` as keyof typeof settings;
      const n = name as keyof typeof settings;
      const s = settings as DBT.expiry;

      baseObject.embed.fields?.push(
        {
          name: (lan[n as keyof typeof lan] as { name: string }).name,
          value: s[n]
            ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
            : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
          inline: true,
        },
        {
          name: (lan[ntime as keyof typeof lan] as { name: string }).name,
          value: `${
            Number(s[ntime])
              ? moment
                  .duration(Number(s[ntime]))
                  .format(
                    `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
                    { trim: 'all' },
                  )
              : baseObject.language.none
          }`,
          inline: true,
        },
      );

      if (i !== 4) {
        baseObject.embed.fields?.push({
          name: '\u200b',
          value: '\u200b',
          inline: false,
        });
      }
    });
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.expiry;
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_0_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    return [
      [
        {
          type: 2,
          label: lan.bans.name,
          custom_id: `${baseCustomID}_bans`,
          style: settings.bans ? 3 : 4,
        },
        {
          type: 2,
          label: lan.channelbans.name,
          custom_id: `${baseCustomID}_channelbans`,
          style: settings.channelbans ? 3 : 4,
        },
        {
          type: 2,
          label: lan.kicks.name,
          custom_id: `${baseCustomID}_kicks`,
          style: settings.kicks ? 3 : 4,
        },
        {
          type: 2,
          label: lan.mutes.name,
          custom_id: `${baseCustomID}_mutes`,
          style: settings.mutes ? 3 : 4,
        },
        {
          type: 2,
          label: lan.warns.name,
          custom_id: `${baseCustomID}_warns`,
          style: settings.warns ? 3 : 4,
        },
      ],
      [
        {
          type: 2,
          label: lan.banstime.name,
          custom_id: `${baseCustomID}_banstime`,
          style: 1,
        },
        {
          type: 2,
          label: lan.channelbanstime.name,
          custom_id: `${baseCustomID}_channelbanstime`,
          style: 1,
        },
        {
          type: 2,
          label: lan.kickstime.name,
          custom_id: `${baseCustomID}_kickstime`,
          style: 1,
        },
        {
          type: 2,
          label: lan.mutestime.name,
          custom_id: `${baseCustomID}_mutestime`,
          style: 1,
        },
        {
          type: 2,
          label: lan.warnstime.name,
          custom_id: `${baseCustomID}_warnstime`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM expiry WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.expiry[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO expiry (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.expiry[] | null) => (r ? r[0] : null));
