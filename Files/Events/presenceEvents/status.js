module.exports = {
	async execute(oldPresence, newPresence) {
		const client = oldPresence ? oldPresence.client : newPresence.client;
		const ch = client.ch;
		if (!oldPresence || !newPresence) return; 
		const user = newPresence.user;
		ch.query(`
		INSERT INTO status (userid, status, since) 
		VALUES ('${user.id}', '${newPresence.status}', '${Date.now()}') 
		ON CONFLICT (userid) 
		DO UPDATE SET status = '${newPresence.status}', since = '${Date.now()}';
		`);
	}
};