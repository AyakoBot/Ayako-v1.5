const client = require('../../BaseClient/DiscordClient');

module.exports = async (users, socket) => {
  if (!users?.length) return;

  const cachedUsers = users.map((u) => client.users.cache.get(u.userid));
  const uncachedUsers = users.filter((u) => cachedUsers.id !== u.userid);
  const fetchedUsers = await Promise.all(uncachedUsers.map((u) => client.users.fetch(u.userid)));
  const returnUsers = [...fetchedUsers, ...cachedUsers];

  socket.emit('USERS_FETCHED', returnUsers);
};
