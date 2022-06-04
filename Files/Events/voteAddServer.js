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

  const res = await client.ch.query(
    `SELECT * FROM votereminder WHERE userid = $1 AND voted = $2;`,
    [voteData.user, voteData.guild],
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
    voteData.guild,
  ]);
  if (res && res.rowCount) {
    client.ch.query(`UPDATE voterewards SET removetime = $1 WHERE userid = $2 AND voted = $3;`, [
      Date.now() + 43200000,
      voteData.user,
      voteData.guild,
    ]);

    timeouts.get(voteData.user)?.cancel();
    timeouts.set(
      voteData.user,
      jobs.scheduleJob(new Date(Date.now() + 43200000), () => {
        removeRoles(voteData.user, Date.now() + 43200000, member, guild, voteData.guild);
      }),
    );
    announcement(voter, guild.roles.cache.get(res.rows[0].roleid));
    return;
  }

  await member.roles.add('982440576895045635');
  announcement(voter, guild.roles.cache.get('982440576895045635'));

  const delTime = Date.now() + 43200000;

  client.ch.query(
    `INSERT INTO voterewards (userid, roleid, removetime, voted) VALUES ($1, $2, $3, $4);`,
    [voteData.user, '982440576895045635', delTime, voteData.guild],
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

  client.ch.query(`DELETE FROM voterewards WHERE userid = $1 AND removetime = $2 AND voted = $3;`, [
    userid,
    delTime,
    votedid,
  ]);

  if (member.roles.cache.has('982440576895045635')) {
    member.roles.remove('982440576895045635').catch(() => {});
  }
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
    }** for [voting for Animekos](<https://top.gg/servers/298954459172700181/vote> "Click me to Vote too!")!${
      usedRole
        ? `\nYou have been given ${usedRole} as gift for the next 12 Hours and 120 <a:AMLantern:982432370814759003>~`
        : 'You have been given 120 <a:AMLantern:982432370814759003>~'
    }`,
    allowedMentions: {
      users: [],
      roles: [],
    },
    components: client.ch.buttonRower([
      new Builders.UnsafeButtonBuilder()
        .setURL('https://top.gg/servers/298954459172700181/vote')
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
      `Thank you for Voting for Animekos!\nI will send you a reminder once you can vote again`,
    );

  const dm = await voter.createDM();
  client.ch.send(dm, { embeds: [embed] }).catch(() => {});

  const endTime = Date.now() + 43200000;
  client.ch.query(`INSERT INTO votereminder (userid, removetime, voted) VALUES ($1, $2, $3);`, [
    voter.id,
    endTime,
    voteData.guild,
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
    [voter.id, endTime, voteData.guild],
  );

  const disable = new Builders.UnsafeButtonBuilder()
    .setLabel('Disable Vote Reminder')
    .setStyle(Discord.ButtonStyle.Danger)
    .setCustomId('vote_reminder_disable');

  const vote = new Builders.UnsafeButtonBuilder()
    .setLabel('Vote for Animekos')
    .setStyle(Discord.ButtonStyle.Link)
    .setURL('https://top.gg/servers/298954459172700181/vote');

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(client.constants.standard.color)
    .setAuthor({
      name: 'Ayako Vote Reminder',
      iconURL: 'https://ayakobot.com/cdn/Ayako_Assets/ayakolove.png',
      url: client.constants.standard.invite,
    })
    .setDescription(
      'You can now Vote for Animekos again!\n[Click here to Vote](https://top.gg/servers/298954459172700181/vote "Click me to Vote!")',
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
          row.removetime,
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
              row.removetime,
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
      if (row.removetime < Date.now()) {
        client.ch.query(`DELETE FROM votereminder WHERE userid = $1;`, [row.userid]);
      } else {
        jobs.scheduleJob(new Date(Date.now() + Number(row.removetime) - Date.now()), async () => {
          endReminder(await client.users.fetch(row.userid), row.removetime, { bot: row.voted });
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
