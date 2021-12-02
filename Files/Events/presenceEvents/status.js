module.exports = {
  async execute(oldPresence, newPresence) {
    const client = oldPresence ? oldPresence.client : newPresence.client;
    const { ch } = client;
    if (!oldPresence || !newPresence) return;
    const { user } = newPresence;
    ch.query(
      `
		INSERT INTO status (userid, status, since) 
		VALUES ($1, $2, $3) 
		ON CONFLICT (userid) 
		DO UPDATE SET status = $2, since = $3;
		`,
      [user.id, newPresence.status, Date.now()],
    );
  },
};
