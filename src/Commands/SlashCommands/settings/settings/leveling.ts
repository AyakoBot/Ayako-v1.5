import moment from 'moment';
import 'moment-duration-format';
import type * as Eris from 'eris';
import type CT from '../../../../typings/CustomTypings';
import type DBT from '../../../../typings/DataBaseTypings';
import client from '../../../../BaseClient/ErisClient';

const setting: CT.SettingsFile = {
  name: 'leveling',
  type: 'single',
  displayEmbed: async (baseObject: CT.BaseSettingsObject) => {
    const lanSetting = baseObject.language.slashCommands.settings;
    const lan = baseObject.language.slashCommands.settings.settings.leveling;
    let settings = await getSettings(baseObject);

    if (!settings) {
      settings = await setup(baseObject);
      if (!settings) return;
    }

    let levelUpMode = Number(settings.lvlupmode) === 1 ? lan.embed : lan.react;
    if (!Number(settings.lvlupmode)) levelUpMode = lan.silent;

    baseObject.embed.fields = [
      {
        name: lanSetting.active,
        value: settings.active
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
      {
        name: lan.xppermsg.name,
        value: `${settings.xppermsg}`,
        inline: true,
      },
      {
        name: lan.xpmultiplier.name,
        value: `${settings.xpmultiplier}x`,
        inline: true,
      },
      {
        name: lan.rolemode.name,
        value: `${settings.rolemode ? lan.stack : lan.replace}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.lvlupmode.name,
        value: `${levelUpMode}`,
        inline: true,
      },
    ];

    switch (Number(settings.lvlupmode)) {
      case 1: {
        // embed
        baseObject.embed.fields.push(
          {
            name: lan.embed.name,
            value: `${
              settings.embed
                ? client.ch.getEmbed(Number(settings.embed))
                : baseObject.language.Default
            }`,
            inline: true,
          },
          {
            name: lan.lvlupdeltimeout.name,
            value: `${moment
              .duration(Number(settings.lvlupdeltimeout))
              .format(
                `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
                { trim: 'all' },
              )}`,
            inline: true,
          },
          {
            name: lan.lvlupchannels.name,
            value: `${
              settings.lvlupchannels && settings.lvlupchannels.length
                ? settings.lvlupchannels.map((id) => ` <#${id}>`)
                : baseObject.language.none
            }`,
            inline: true,
          },
        );
        break;
      }
      case 2: {
        // reaction
        baseObject.embed.fields.push(
          {
            name: lan.lvlupemotes.name,
            value:
              settings.lvlupemotes && settings.lvlupemotes.length
                ? settings.lvlupemotes.map((e) => `${e}`).join('')
                : client.stringEmotes.levelupemotes.map((e) => e).join(''),
            inline: true,
          },
          {
            name: lan.lvlupdeltimeout.name,
            value: `${moment
              .duration(Number(settings.lvlupdeltimeout))
              .format(
                `y [${baseObject.language.time.years}], M [${baseObject.language.time.months}], d [${baseObject.language.time.days}], h [${baseObject.language.time.hours}], m [${baseObject.language.time.minutes}], s [${baseObject.language.time.seconds}]`,
                { trim: 'all' },
              )}`,
            inline: true,
          },
        );
        break;
      }
      default: {
        // silent
        baseObject.embed.fields[baseObject.embed.fields.length - 1].inline = false;
        break;
      }
    }

    baseObject.embed.fields.push(
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.ignoreprefixes.name,
        value: settings.ignoreprefixes
          ? `${client.stringEmotes.enabled} ${baseObject.language.Enabled}`
          : `${client.stringEmotes.disabled} ${baseObject.language.Disabled}`,
        inline: false,
      },
    );

    if (settings.ignoreprefixes) {
      baseObject.embed.fields.push({
        name: lan.prefixes.name,
        value:
          settings.prefixes && settings.prefixes.length
            ? settings.prefixes.map((p) => `\`${p}\``).join(', ')
            : baseObject.language.none,
        inline: false,
      });
    }

    baseObject.embed.fields.push(
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: lan.blchannels.name,
        value: `${
          settings.blchannels && settings.blchannels.length
            ? settings.blchannels.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.blusers.name,
        value: `${
          settings.blusers && settings.blusers.length
            ? settings.blusers.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.blroles.name,
        value: `${
          settings.blroles && settings.blroles.length
            ? settings.blroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.wlchannels.name,
        value: `${
          settings.wlchannels && settings.wlchannels.length
            ? settings.wlchannels.map((id) => ` <#${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.wlusers.name,
        value: `${
          settings.wlusers && settings.wlusers.length
            ? settings.wlusers.map((id) => ` <@${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
      {
        name: lan.wlroles.name,
        value: `${
          settings.wlroles && settings.wlroles.length
            ? settings.wlroles.map((id) => ` <@&${id}>`)
            : baseObject.language.none
        }`,
        inline: false,
      },
    );
  },
  buttons: async (baseObject: CT.BaseSettingsObject) => {
    const lan = baseObject.language.slashCommands.settings.settings.leveling;
    const baseCustomID = `settings_${baseObject.interactions[0].user.id}_edit_0_${baseObject.setting.name}_`;
    const settings = await getSettings(baseObject);
    if (!settings) return [];

    const buttons = [
      [
        {
          type: 2,
          label: baseObject.language.slashCommands.settings.active,
          custom_id: `${baseCustomID}active`,
          style: settings.active ? 3 : 4,
        },
      ],
      [
        {
          type: 2,
          label: lan.xppermsg.name,
          custom_id: `${baseCustomID}xppermsg`,
          style: 1,
        },
        {
          type: 2,
          label: lan.xpmultiplier.name,
          custom_id: `${baseCustomID}xpmultiplier`,
          style: 1,
        },
        {
          type: 2,
          label: lan.rolemode.name,
          custom_id: `${baseCustomID}rolemode`,
          style: 1,
        },
        {
          type: 2,
          label: lan.ignoreprefixes.name,
          custom_id: `${baseCustomID}ignoreprefixes`,
          style: 1,
        },
        {
          type: 2,
          label: lan.prefixes.name,
          custom_id: `${baseCustomID}prefixes`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.lvlupmode.name,
          custom_id: `${baseCustomID}lvlupmode`,
          style: 1,
        },
      ],
      [
        {
          type: 2,
          label: lan.blroles.name,
          custom_id: `${baseCustomID}blroles`,
          style: 1,
        },
        {
          type: 2,
          label: lan.blusers.name,
          custom_id: `${baseCustomID}blusers`,
          style: 1,
        },
        {
          type: 2,
          label: lan.wlchannels.name,
          custom_id: `${baseCustomID}wlchannels`,
          style: 1,
        },
        {
          type: 2,
          label: lan.wlroles.name,
          custom_id: `${baseCustomID}wlroles`,
          style: 1,
        },
        {
          type: 2,
          label: lan.wlusers.name,
          custom_id: `${baseCustomID}wlusers`,
          style: 1,
        },
      ],
    ];

    switch (Number(settings.lvlupmode)) {
      case 1: {
        // embed
        buttons[2].push(
          {
            type: 2,
            label: lan.embed.name,
            custom_id: `${baseCustomID}embed`,
            style: 1,
          },
          {
            type: 2,
            label: lan.lvlupdeltimeout.name,
            custom_id: `${baseCustomID}lvlupdeltimeout`,
            style: 1,
          },
        );
        break;
      }
      case 2: {
        // reaction
        buttons[2].push(
          {
            type: 2,
            label: lan.lvlupemotes.name,
            custom_id: `${baseCustomID}lvlupemotes`,
            style: 1,
          },
          {
            type: 2,
            label: lan.lvlupdeltimeout.name,
            custom_id: `${baseCustomID}lvlupdeltimeout`,
            style: 1,
          },
        );
        break;
      }
      default: {
        // silent
        break;
      }
    }

    buttons[2].push({
      type: 2,
      label: lan.blchannels.name,
      custom_id: `${baseCustomID}blchannels`,
      style: 1,
    });

    return buttons as unknown as Promise<Eris.Button[][]>;
  },
};

export default setting;

const getSettings = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`SELECT * FROM leveling WHERE guildid = $1;`, [baseObject.interactions[0].guildID])
    .then((r: DBT.leveling[] | null) => (r ? r[0] : r));

const setup = (baseObject: CT.BaseSettingsObject) =>
  client.ch
    .query(`INSERT INTO leveling (guildid) VALUES ($1);`, [baseObject.interactions[0].guildID])
    .then((r: DBT.leveling[] | null) => (r ? r[0] : null));
