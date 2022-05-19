module.exports = {
  async execute(oldUser, newUser) {
    return;
    const client = oldUser ? oldUser.client : newUser.client;
    const { ch } = client;
    if (oldUser.username !== newUser.username) {
      const { username } = newUser;
      ch.query(
        `
			INSERT INTO status (userid, pastusernames) 
			VALUES ($1, $2) 
			ON CONFLICT (userid) 
			DO UPDATE SET pastusernames = array_append(status.pastusernames, $3);
			`,
        [newUser.id, [username], username],
      );
    }
  },
};
