const io = require('socket.io-client');
const Discord = require('discord.js');
const client = require('../../BaseClient/DiscordClient');

const timeouts = new Map();

module.exports = {
  execute: () => {
    queryCheck();

    const socket = io('https://ayakobot.com', {
      transports: ['websocket'],
      auth: {
        reason: 'top_gg_votes',
      },
    });

    socket.on('TOP_GG_VOTE', async (voteData) => {
      const res = await client.ch.query(`SELECT * FROM votereminder WHERE userid = $1;`, [
        voteData.user,
      ]);

      if (res && res.rowCount) return;

      const voter = await client.users.fetch(voteData.user);
      console.log(`User ${voteData.user} has voted`);
      roleReward(voteData);
      reminder(voter);
    });
  },
};

const roleReward = async (voteData) => {
  const guild = client.guilds.cache.get('298954459172700181');
  const member = await guild.members.fetch(voteData.user).catch(() => {});
  const voter = await client.users.fetch(voteData.user);

  if (!member) {
    announcement(voter);
    return;
  }

  const res = await client.ch.query(`SELECT * FROM voterewards WHERE userid = $1;`, [
    voteData.user,
  ]);
  if (res && res.rowCount) {
    client.ch.query(`UPDATE voterewards SET removetime = $1 WHERE userid = $2;`, [
      Date.now() + 43200000,
      voteData.user,
    ]);

    clearTimeout(timeouts.get(voteData.user));
    timeouts.set(
      voteData.user,
      setTimeout(() => {
        removeRoles(voteData.user, Date.now() + 43200000, member, guild);
      }, 43200000),
    );
    announcement(voter, guild.roles.cache.get(res.rows[0].roleid));
    return;
  }

  const roles = [
    guild.roles.cache.get('327424359016824842'),
    guild.roles.cache.get('910079633477730364'),
    guild.roles.cache.get('910079643267252235'),
  ];

  let [gettingThisRole] = roles;
  if (member.roles.cache.has(roles[0].id)) [, gettingThisRole] = roles;
  if (member.roles.cache.has(roles[1].id)) [, , gettingThisRole] = roles;
  if (member.roles.cache.has(roles[2].id)) {
    announcement(voter);
    return;
  }

  if (voteData.isWeekend) {
    gettingThisRole = roles[roles.findIndex((r) => r.id === gettingThisRole.id) + 1];
    if (!roles.findIndex((r) => r.id === gettingThisRole.id)) [, , gettingThisRole] = roles;
  }

  await member.roles.add(gettingThisRole);
  announcement(voter, gettingThisRole);

  const delTime = Date.now() + 43200000;

  client.ch.query(`INSERT INTO voterewards (userid, roleid, removetime) VALUES ($1, $2, $3);`, [
    voteData.user,
    gettingThisRole.id,
    delTime,
  ]);

  timeouts.set(
    voteData.user,
    setTimeout(() => {
      removeRoles(voteData.user, delTime, member, guild);
    }, 43200000),
  );
};

const queryCheck = async () => {
  const rewardsRes = await client.ch.query(`SELECT * FROM voterewards;`);
  if (rewardsRes && rewardsRes.rowCount) {
    rewardsRes.rows.forEach(async (row) => {
      if (row.removetime < Date.now()) {
        removeRoles(
          row.userid,
          row.removetime,
          await client.guilds.cache.get('298954459172700181').members.fetch(row.userid),
          client.guilds.cache.get('298954459172700181'),
        );
      } else {
        timeouts.set(
          row.userid,
          setTimeout(async () => {
            removeRoles(
              row.userid,
              row.removetime,
              await client.guilds.cache.get('298954459172700181').members.fetch(row.userid),
              client.guilds.cache.get('298954459172700181'),
            );
          }, row.removetime - Date.now()),
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
        setTimeout(() => {
          endReminder(client.users.cache.get(row.userid), row.removetime);
        }, row.removetime - Date.now());
      }
    });
  }
};

const removeRoles = (userid, delTime, member, guild) => {
  const roles = [
    guild.roles.cache.get('327424359016824842'),
    guild.roles.cache.get('910079633477730364'),
    guild.roles.cache.get('910079643267252235'),
  ];

  client.ch.query(`DELETE FROM voterewards WHERE userid = $1 AND removetime = $2;`, [
    userid,
    delTime,
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

  // eslint-disable-next-line no-unused-vars
  const debugWebhook = await client.fetchWebhook(
    '937575279411478588',
    'CMmKtjyPv1GHxUCbd3jLC2VWyzc1FkhRPk0tZMkdIY-tWjZhvasmtYuVu6WqPFkqbgt1',
  );

  webhook
    .send({
      content: `Thanks ${voter} for [voting for Ayako](<https://top.gg/bot/650691698409734151/vote> "Click me to Vote too!")!${
        usedRole ? `\nYou have been given ${usedRole} as gift for the next 12 Hours~` : ''
      }`,
      allowedMentions: {
        users: [],
        roles: [],
      },
      components: client.ch.buttonRower([
        new Discord.MessageButton()
          .setURL('https://top.gg/bot/650691698409734151/vote')
          .setStyle('LINK')
          .setLabel('Vote Here'),
      ]),
    })
    .catch(() => {});
};

const reminder = async (voter) => {
  const allowsReminder = await getReminder(voter);
  if (!allowsReminder) return;

  const embed = new Discord.MessageEmbed()
    .setColor('#b0ff00')
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
  client.ch.query(`INSERT INTO votereminder (userid, removetime) VALUES ($1, $2);`, [
    voter.id,
    endTime,
  ]);

  setTimeout(() => {
    endReminder(voter, endTime);
  }, 43200000);
};

const endReminder = async (voter, endTime) => {
  const allowsReminder = await getReminder(voter);
  if (!allowsReminder) return;

  client.ch.query(`DELETE FROM votereminder WHERE userid = $1 AND removetime = $2;`, [
    voter.id,
    endTime,
  ]);

  const disable = new Discord.MessageButton()
    .setLabel('Disable Vote Reminder')
    .setStyle('DANGER')
    .setCustomId('vote_reminder_disable');

  const vote = new Discord.MessageButton()
    .setLabel('Vote for Ayako')
    .setStyle('LINK')
    .setURL('https://top.gg/bot/650691698409734151/vote');

  const embed = new Discord.MessageEmbed()
    .setColor('#b0ff00')
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
    .send(dm, { embeds: [embed], components: client.ch.buttonRower([disable, vote]) })
    .catch(() => {});
};

const getReminder = async (user) => {
  const res = await client.ch.query(`SELECT votereminders FROM users WHERE userid = $1;`, [
    user.id,
  ]);
  if (!res || !res.rowCount || res.rows[0].votereminders === true) return true;
  return false;
};
