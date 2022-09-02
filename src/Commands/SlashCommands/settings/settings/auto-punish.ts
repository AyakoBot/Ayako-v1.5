import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.MultiSettings = {
  name: 'auto-punish',
  type: 'multi',
  listEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings['auto-punish'];
    const existing = await client.ch
      .query(`SELECT * FROM autopunish WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
      .then((r: DBT.autopunish[] | null) => r);

    baseObject.embed.description = client.ch.stp(lan.description, {
      prefix: client.constants.standard.prefix,
    });

    if (!existing) {
      baseObject.embed.footer = {
        text: baseObject.language.slashCommands.settings.noneFound,
        icon_url: client.constants.standard.error,
      };
      return;
    }

    for (let i = 0; i < existing.length; i += 1) {
      const r = existing[i];
      const punishment = r.punishment
        ? baseObject.language.autopunish[Number(r.punishment)]
        : baseObject.language.none;
      baseObject.embed.fields = [
        {
          name: `${baseObject.language.Number}: \`${i + 1}\` | ${
            r.active
              ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
              : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`
          }`,
          value: `${baseObject.language.Punishment}: ${punishment}\n${lan.requiredWarns} ${
            r.warnamount ? r.warnamount : baseObject.language.none
          }`,
          inline: true,
        },
      ];
    }
  },
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    baseObject.embed.title = 'displayEmbed';
  },
  buttons: async () =>
    client.ch.buttonRower([{ type: 2, label: 'test', custom_id: 'test', style: 1 }]),
};

export default setting;
