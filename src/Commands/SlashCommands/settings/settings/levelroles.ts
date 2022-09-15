import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'level-roles',
  type: 'multi',
  listEmbed: async (baseObject) => {
    const existing = await client.ch
      .query(`SELECT * FROM levelingroles WHERE guildid = $1;`, [
        baseObject.interactions[0].guildID,
      ])
      .then((r: DBT.levelingroles[] | null) => r);

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
        name: `${baseObject.language.Number}: \`${i + 1}\``,
        value: `${baseObject.language.Level}: ${r.level}`,
        inline: true,
      });
    }
  },
  displayEmbed: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['level-roles'];
    const settings = await getSettings(baseObject);
    if (!settings) return;

    baseObject.embed.fields = [
      {
        name: lan.level.name,
        value: `${Number(settings.level) || baseObject.language.none}`,
        inline: true,
      },
      {
        name: lan.roles.name,
        value: `${
          settings.roles && settings.roles.length
            ? settings.roles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: true,
      },
    ];
  },

  buttons: async (baseObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['level-roles'];
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_${baseObject.uniquetimestamp}_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    return [
      [
        {
          type: 2,
          label: lan.level.name,
          custom_id: `${baseCustomID}_level`,
          style: 1,
        },
        {
          type: 2,
          label: lan.roles.name,
          custom_id: `${baseCustomID}_roles`,
          style: 1,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.MultiSettingsObject) =>
  client.ch
    .query(`SELECT * FROM levelingroles WHERE guildid = $1 AND uniquetimestamp = $2;`, [
      baseObject.interactions[0].guildID,
      baseObject.uniquetimestamp,
    ])
    .then((r: DBT.levelingroles[] | null) => (r ? r[0] : r));
