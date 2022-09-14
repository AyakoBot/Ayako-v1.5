import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'logs',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.logs;
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    baseObject.embed.fields = [];

    baseObject.embed.fields.push({
      name: '\u200b',
      value: `**${lan.guild}**`,
      inline: false,
    });

    [
      'emoji',
      'guild',
      'invite',
      'message',
      'role',
      'role',
      'user',
      'voice',
      'webhook',
      'channel',
      'sticker',
      'thread',
      'guildmember',
      'stage',
    ].forEach((name) => {
      const n = `${name}events` as keyof typeof settings;
      const s = settings as DBT.logchannels;
      const channels = s[n] as string[];

      baseObject.embed.fields?.push({
        name: (lan[n as keyof typeof lan] as { name: string }).name,
        value: `${
          channels && channels.length
            ? channels.map((id: string) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: true,
      });
    });

    baseObject.embed.fields.push({
      name: '\u200b',
      value: `**${lan.ayako}**`,
      inline: false,
    });

    ['settingslog', 'modlogs'].forEach((name) => {
      const n = name as keyof typeof settings;
      const s = settings as DBT.logchannels;
      const channels = s[n] as string[];

      baseObject.embed.fields?.push({
        name: (lan[n as keyof typeof lan] as { name: string }).name,
        value: `${
          channels && channels.length
            ? channels.map((id: string) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: true,
      });
    });
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.logs;
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_0_${baseObject.setting.name}`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    return [
      [
        {
          type: 2,
          label: lan.emojievents.name,
          custom_id: `${baseCustomID}_emojievents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.guildevents.name,
          custom_id: `${baseCustomID}_guildevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.inviteevents.name,
          custom_id: `${baseCustomID}_inviteevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.messageevents.name,
          custom_id: `${baseCustomID}_messageevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.roleevents.name,
          custom_id: `${baseCustomID}_roleevents`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.userevents.name,
          custom_id: `${baseCustomID}_userevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.voiceevents.name,
          custom_id: `${baseCustomID}_voiceevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.webhookevents.name,
          custom_id: `${baseCustomID}_webhookevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.channelevents.name,
          custom_id: `${baseCustomID}_channelevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.stickerevents.name,
          custom_id: `${baseCustomID}_stickerevents`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.threadevents.name,
          custom_id: `${baseCustomID}_threadevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.guildmemberevents.name,
          custom_id: `${baseCustomID}_guildmemberevents`,
          style: 1,
        },
        {
          type: 2,
          label: lan.stageevents.name,
          custom_id: `${baseCustomID}_stageevents`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.modlogs.name,
          custom_id: `${baseCustomID}_modlogs`,
          style: 2,
        },
        {
          type: 2,
          label: lan.settingslog.name,
          custom_id: `${baseCustomID}_settingslog`,
          style: 2,
        },
      ],
    ];
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM logchannels WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.logchannels[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO logchannels (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.logchannels[] | null) => (r ? r[0] : null));
