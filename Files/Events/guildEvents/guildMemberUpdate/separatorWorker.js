/* eslint-disable no-param-reassign */
const { parentPort, workerData } = require('worker_threads');

start(workerData);

async function start(wd) {
  const { res } = wd;
  const { obj } = wd;
  const membersWithRoles = [];
  const resolved = await new Promise((resolve) => {
    obj.members.forEach((member, indexMember) => {
      const giveThese = [];
      const takeThese = [];
      res.forEach(async (row) => {
        const sep = obj.separators.find((s) => s.separator.id === row.separator).separator;
        if (sep) {
          if (row.isvarying) {
            const stop = row.stoprole
              ? obj.separators.find((s) => s.separator.id === row.separator).stoprole
              : null;
            const affectedRoles = [];
            const roles = obj.roles.map((o) => o);
            if (row.stoprole) {
              if (sep.rawPosition > stop.rawPosition)
                for (let i = stop.rawPosition + 1; i < roles.length && i < sep.rawPosition; i += 1)
                  affectedRoles.push(obj.roles.find((r) => r.rawPosition === i));
              else
                for (let i = sep.rawPosition + 1; i < roles.length && i < stop.rawPosition; i += 1)
                  affectedRoles.push(obj.roles.find((r) => r.rawPosition === i));
            } else if (sep.rawPosition < obj.highestRole.rawPosition)
              for (
                let i = sep.rawPosition + 1;
                i < roles.length && i < obj.highestRole.rawPosition;
                i += 1
              )
                affectedRoles.push(obj.roles.find((r) => r.rawPosition === i));
            const has = [];
            affectedRoles.forEach((role) => {
              if (role) {
                if (member.roles.map((o) => o.id).includes(role.id)) has.push(true);
                else has.push(false);
              }
            });
            if (
              has.includes(true) &&
              !member.roles.map((o) => o.id).includes(sep.id) &&
              obj.clientHighestRole.rawPosition > sep.rawPosition
            )
              giveThese.push(sep.id);
            else if (
              !has.includes(true) &&
              member.roles.map((o) => o.id).includes(sep.id) &&
              obj.clientHighestRole.rawPosition > sep.rawPosition
            )
              takeThese.push(sep.id);
          } else {
            const has = [];
            row.roles.forEach((role) => {
              if (member.roles.map((o) => o.id).includes(role.id)) has.push(true);
              else has.push(false);
            });
            if (
              has.includes(true) &&
              !member.roles.map((o) => o.id).includes(sep.id) &&
              obj.clientHighestRole.rawPosition > sep.rawPosition
            )
              giveThese.push(sep.id);
            else if (
              !has.includes(true) &&
              member.roles.map((o) => o.id).includes(sep.id) &&
              obj.clientHighestRole.rawPosition > sep.rawPosition
            )
              takeThese.push(sep.id);
          }
        }
      });
      if (giveThese.length) member.giveTheseRoles = giveThese;
      if (takeThese.length) member.takeTheseRoles = takeThese;
      if (takeThese.length || giveThese.length) membersWithRoles.push(member);
      if (indexMember === obj.members.length - 1) resolve(true);
    });
  });
  setInterval(() => {
    if (resolved) parentPort.postMessage(membersWithRoles);
  }, 1000);
}
