const { parentPort, workerData } = require('worker_threads');
const jobs = require('node-schedule');

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
              if (sep.position > stop.position)
                for (let i = stop.position + 1; i < roles.length && i < sep.position; i += 1)
                  affectedRoles.push(obj.roles.find((r) => r.position === i));
              else
                for (let i = sep.position + 1; i < roles.length && i < stop.position; i += 1)
                  affectedRoles.push(obj.roles.find((r) => r.position === i));
            } else if (sep.position < obj.highestRole.position)
              for (
                let i = sep.position + 1;
                i < roles.length && i < obj.highestRole.position;
                i += 1
              )
                affectedRoles.push(obj.roles.find((r) => r.position === i));
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
              obj.clientHighestRole.position > sep.position
            )
              giveThese.push(sep.id);
            else if (
              !has.includes(true) &&
              member.roles.map((o) => o.id).includes(sep.id) &&
              obj.clientHighestRole.position > sep.position
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
              obj.clientHighestRole.position > sep.position
            )
              giveThese.push(sep.id);
            else if (
              !has.includes(true) &&
              member.roles.map((o) => o.id).includes(sep.id) &&
              obj.clientHighestRole.position > sep.position
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

  jobs.scheduleJob('*/1 * * * * *', () => {
    if (resolved) parentPort.postMessage(membersWithRoles);
  });
}
