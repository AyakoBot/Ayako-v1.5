const { parentPort } = require('worker_threads');
const Discord = require('discord.js');
const eris = require('../../../BaseClient/ErisClient');

parentPort.on('message', (data) => {
  start(data);
});

async function start(data) {
  const { roles, userid, guildid, language } = data;

  const guildroles = new Discord.Collection(data.guildroles);
  const highestRole = data.highest;
  const rows = data.res;

  const giveThese = [];
  const takeThese = [];

  if (rows && rows.length) {
    rows.forEach(async (row) => {
      const sep = guildroles.get(row.separator);
      if (sep) {
        if (row.isvarying) {
          const stop = row.stoprole ? guildroles.get(row.stoprole) : null;
          const affectedRoles = [];
          if (stop) {
            if (sep.rawPosition > stop.rawPosition)
              for (
                let i = stop.rawPosition + 1;
                i < highestRole.rawPosition && i < sep.rawPosition;
                i += 1
              ) {
                affectedRoles.push(guildroles.find((r) => r.rawPosition === i));
              }
            else
              for (
                let i = sep.rawPosition + 1;
                i < highestRole.rawPosition && i < stop.rawPosition;
                i += 1
              ) {
                affectedRoles.push(guildroles.find((r) => r.rawPosition === i));
              }
          } else if (sep.rawPosition < highestRole.rawPosition)
            for (
              let i = sep.rawPosition + 1;
              i < highestRole.rawPosition && i < highestRole.rawPosition;
              i += 1
            )
              affectedRoles.push(guildroles.find((r) => r.rawPosition === i));

          const has = [];

          affectedRoles
            .map((o) => o)
            .forEach((role) => {
              if (role) {
                if (roles.includes(role.id)) has.push(true);
                else has.push(false);
              }
            });

          if (has.includes(true) && !roles.includes(sep.id)) giveThese.push(sep.id);
          else if (!has.includes(true) && roles.includes(sep.id)) takeThese.push(sep.id);
        } else {
          const has = [];
          row.roles?.forEach((role) => {
            if (roles.includes(role)) has.push(true);
            else has.push(false);
          });
          if (has.includes(true) && !roles.includes(sep.id)) giveThese.push(sep.id);
          else if (!has.includes(true) && roles.includes(sep.id)) takeThese.push(sep.id);
        }
      } else parentPort.postMessage('NO_SEP', { text: 'NO_SEP', sep: row.separator });
    });
  }
  const newRoles = [...roles, ...giveThese];
  takeThese.forEach((r) => newRoles.splice(newRoles.indexOf(r), 1));
  if ((giveThese && giveThese.length) || (takeThese && takeThese.length))
    await eris
      .editGuildMember(guildid, userid, { roles: newRoles }, language.autotypes.separators)
      .catch(() => {});
}
