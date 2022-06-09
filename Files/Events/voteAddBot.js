const Discord = require('discord.js');
const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');
const client = require('../BaseClient/DiscordClient');

const timeouts = new Map();

module.exports = async (voteData) => {
  if (!voteData) {
    queryCheck();
    return;
  }

  deleteStuff();

  const res = await client.ch.query(
    `SELECT * FROM votereminder WHERE userid = $1 AND voted = $2 AND removetime > $3;`,
    [voteData.user, voteData.bot, Date.now()],
  );

  if (res && res.rowCount) return;

  const voter = await client.users.fetch(voteData.user);

  jobs.scheduleJob(new Date(Date.now() + 1000), () => {
    roleReward(voteData);
    coinReward(voter);
    reminder(voter, voteData);
  });
};

const roleReward = async (voteData) => {
  const guild = client.guilds.cache.get('298954459172700181');
  const member = await guild.members.fetch(voteData.user).catch(() => {});
  const voter = await client.users.fetch(voteData.user);

  if (!member) {
    announcement(voter);
    return;
  }

  const res = await client.ch.query(`SELECT * FROM voterewards WHERE userid = $1 AND voted = $2;`, [
    voteData.user,
    voteData.bot,
  ]);
  if (res && res.rowCount) {
    client.ch.query(`UPDATE voterewards SET removetime = $1 WHERE userid = $2 AND voted = $3;`, [
      Date.now() + 43200000,
      voteData.user,
      voteData.bot,
    ]);

    timeouts.get(voteData.user)?.cancel();
    timeouts.set(
      voteData.user,
      jobs.scheduleJob(new Date(Date.now() + 43200000), () => {
        removeRoles(voteData.user, Date.now() + 43200000, member, guild, voteData.bot);
      }),
    );
    announcement(voter, guild.roles.cache.get(res.rows[0].roleid));
    return;
  }

  const roles = [
    guild.roles.cache.get('327424359016824842'),
    guild.roles.cache.get('910079633477730364'),
    guild.roles.cache.get('910079643267252235'),
  ];

  let index;
  roles.forEach((r, i) => {
    if (typeof index === 'number') return;
    if (!member.roles.cache.has(r.id) || i === roles.length - 1) index = i;
  });

  if (voteData.isWeekend && index !== roles.length - 1) index += 1;

  const gettingThisRole = roles[index];

  console.log(gettingThisRole);
  await member.roles.add(gettingThisRole);
  announcement(voter, gettingThisRole);

  const delTime = Date.now() + 43200000;

  client.ch.query(
    `INSERT INTO voterewards (userid, roleid, removetime, voted) VALUES ($1, $2, $3, $4);`,
    [voteData.user, gettingThisRole.id, delTime, voteData.bot],
  );

  timeouts.set(
    voteData.user,
    jobs.scheduleJob(new Date(Date.now() + 43200000), () => {
      removeRoles(voteData.user, delTime, member, guild);
    }),
  );
};

const removeRoles = (userid, delTime, member, guild, votedid) => {
  if (!member) return;
  const roles = [
    guild.roles.cache.get('327424359016824842'),
    guild.roles.cache.get('910079633477730364'),
    guild.roles.cache.get('910079643267252235'),
  ];

  client.ch.query(`DELETE FROM voterewards WHERE userid = $1 AND removetime = $2 AND voted = $3;`, [
    userid,
    delTime,
    votedid,
  ]);

  if (member.roles.cache.has(roles[2].id)) member.roles.remove(roles[2].id).catch(() => {});
  else if (member.roles.cache.has(roles[1].id)) member.roles.remove(roles[1].id).catch(() => {});
  else if (member.roles.cache.has(roles[0].id)) member.roles.remove(roles[0].id).catch(() => {});
};

const announcement = async (voter, usedRole) => {
  // eslint-disable-next-line no-unused-vars
  const webhook = await client.fetchWebhook(
    '937523756669239347',
    'owoDfJHBLZiD7NzuYPZ5m8jAoeGOHXUSa1o3YkLgDxKGsedip4xke_5aQSt66hks4zQF',
  );

  /*
    // eslint-disable-next-line no-unused-vars
    const debugWebhook = await client.fetchWebhook(
      '941900464876818452',
      'xEb6FpCGOZJTD-GSZZ35okCzkfWQXeiP4ibNpqCMQwC3SDqvepM8jv8SX9lRoX80D9R5',
    );
    */

  webhook.send({
    content: `Thanks **${
      voter.tag
    }** for [voting for Ayako](<https://top.gg/bot/650691698409734151/vote> "Click me to Vote too!")!${
      usedRole
        ? `\nYou have been given ${usedRole} as gift for the next 12 Hours and 120 <a:AMLantern:982432370814759003>~`
        : 'You have been given 120 <a:AMLantern:982432370814759003> ~'
    }`,
    allowedMentions: {
      users: [],
      roles: [],
    },
    components: client.ch.buttonRower([
      new Builders.UnsafeButtonBuilder()
        .setURL('https://top.gg/bot/650691698409734151/vote')
        .setStyle(Discord.ButtonStyle.Link)
        .setLabel('Vote Here'),
    ]),
  });
};

const reminder = async (voter, voteData) => {
  const allowsReminder = await getReminder(voter);
  if (!allowsReminder) return;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(client.constants.standard.color)
    .setAuthor({
      name: 'Ayako Vote Reminder',
      iconURL: 'https://ayakobot.com/cdn/Ayako_Assets/ayakolove.png',
      url: client.constants.standard.invite,
    })
    .setDescription(
      `Thank you for Voting for Ayako!\nI will send you a reminder once you can vote again`,
    );

  const dm = await voter.createDM();
  client.ch.send(dm, { embeds: [embed] }).catch(() => {});

  const endTime = Date.now() + 43200000;
  client.ch.query(`INSERT INTO votereminder (userid, removetime, voted) VALUES ($1, $2, $3);`, [
    voter.id,
    endTime,
    voteData.bot,
  ]);

  jobs.scheduleJob(new Date(Date.now() + 43200000), async () => {
    endReminder(voter, endTime, voteData);
  });
};

const endReminder = async (voter, endTime, voteData) => {
  const allowsReminder = await getReminder(voter);
  if (!allowsReminder) return;

  client.ch.query(
    `DELETE FROM votereminder WHERE userid = $1 AND removetime = $2 AND voted = $3;`,
    [voter.id, endTime, voteData.bot],
  );

  const disable = new Builders.UnsafeButtonBuilder()
    .setLabel('Disable Vote Reminder')
    .setStyle(Discord.ButtonStyle.Danger)
    .setCustomId('vote_reminder_disable');

  const vote = new Builders.UnsafeButtonBuilder()
    .setLabel('Vote for Ayako')
    .setStyle(Discord.ButtonStyle.Link)
    .setURL('https://top.gg/bot/650691698409734151/vote');

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(client.constants.standard.color)
    .setAuthor({
      name: 'Ayako Vote Reminder',
      iconURL: 'https://ayakobot.com/cdn/Ayako_Assets/ayakolove.png',
      url: client.constants.standard.invite,
    })
    .setDescription(
      'You can now Vote for Ayako again!\n[Click here to Vote](https://top.gg/bot/650691698409734151/vote "Click me to Vote!")',
    );

  const dm = await voter.createDM();
  client.ch
    .send(dm, { embeds: [embed], components: client.ch.buttonRower([vote, disable]) })
    .catch(() => {});
};

const getReminder = async (user) => {
  const res = await client.ch.query(`SELECT votereminders FROM users WHERE userid = $1;`, [
    user.id,
  ]);
  if (!res || !res.rowCount || res.rows[0].votereminders === true) return true;
  return false;
};

const queryCheck = async () => {
  const rewardsRes = await client.ch.query(`SELECT * FROM voterewards;`);

  if (rewardsRes && rewardsRes.rowCount) {
    rewardsRes.rows.forEach(async (row) => {
      if (row.removetime < Date.now()) {
        removeRoles(
          row.userid,
          Number(row.removetime),
          await client.guilds.cache
            .get('298954459172700181')
            ?.members.fetch(row.userid)
            .catch(() => {}),
          client.guilds.cache.get('298954459172700181'),
          row.voted,
        );
      } else {
        timeouts.set(
          row.userid,
          jobs.scheduleJob(new Date(Date.now() + Number(row.removetime) - Date.now()), async () => {
            removeRoles(
              row.userid,
              Number(row.removetime),
              await client.guilds.cache.get('298954459172700181').members.fetch(row.userid),
              client.guilds.cache.get('298954459172700181'),
              row.voted,
            );
          }),
        );
      }
    });
  }

  const reminderRes = await client.ch.query(`SELECT * FROM votereminder;`);
  if (reminderRes && reminderRes.rowCount) {
    reminderRes.rows.forEach((row) => {
      if (Number(row.removetime) < Date.now()) {
        client.ch.query(`DELETE FROM votereminder WHERE userid = $1;`, [row.userid]);
      } else {
        jobs.scheduleJob(new Date(Date.now() + Number(row.removetime) - Date.now()), async () => {
          endReminder(await client.users.fetch(row.userid), Number(row.removetime), {
            bot: row.voted,
          });
        });
      }
    });
  }
};

const coinReward = (user) => {
  client.ch.query(
    `INSERT INTO balance (userid, guildid, balance) VALUES ($1, $2, 120) ON CONFLICT (userid, guildid) DO UPDATE SET balance = balance.balance + 120;`,
    [user.id, '298954459172700181'],
  );
};

const deleteStuff = async () => {
  const rewardsRes = await client.ch.query(`SELECT * FROM voterewards WHERE removetime < $1;`, [
    Date.now(),
  ]);

  if (rewardsRes && rewardsRes.rowCount) {
    rewardsRes.rows.forEach(async (row) => {
      removeRoles(
        row.userid,
        Number(row.removetime),
        await client.guilds.cache
          .get('298954459172700181')
          ?.members.fetch(row.userid)
          .catch(() => {}),
        client.guilds.cache.get('298954459172700181'),
        row.voted,
      );
    });
  }

  const reminderRes = await client.ch.query(`SELECT * FROM votereminder WHERE removetime < $1;`, [
    Date.now(),
  ]);
  if (reminderRes && reminderRes.rowCount) {
    reminderRes.rows.forEach(async (row) => {
      endReminder(await client.users.fetch(row.userid), row.removetime, { bot: row.voted });
    });
  }
};
