const ch = require('../../BaseClient/ClientHelper'); 

module.exports = {
	async execute(oldPresence, newPresence) {
		if (!oldPresence || !newPresence) return; 
		const user = newPresence.user;
		const res = await ch.query(`SELECT * FROM status WHERE userid = '${user.id}'`);
		if (res && res.rowCount > 0) {
			if (newPresence.status == 'online') {
				if (oldPresence.status == 'online') return;
				ch.query(`
					UPDATE status SET offline = false WHERE userid = '${user.id}';
					UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
					UPDATE status SET dnd = false WHERE userid = '${user.id}';
					UPDATE status SET dndsince = null WHERE userid = '${user.id}';
					UPDATE status SET online = true WHERE userid = '${user.id}';
					UPDATE status SET onlinesince = '${Date.now()}' WHERE userid = '${user.id}';
					UPDATE status SET idle = false WHERE userid = '${user.id}';
					UPDATE status SET idlesince = null WHERE userid = '${user.id}';
				`, true);
			}
			if (newPresence.status == 'dnd') {
				if (oldPresence.status == 'dnd') return;
				ch.query(`
					UPDATE status SET offline = false WHERE userid = '${user.id}';
					UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
					UPDATE status SET dnd = true WHERE userid = '${user.id}';
					UPDATE status SET dndsince = '${Date.now()}' WHERE userid = '${user.id}';
					UPDATE status SET online = false WHERE userid = '${user.id}';
					UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
					UPDATE status SET idle = false WHERE userid = '${user.id}';
					UPDATE status SET idlesince = null WHERE userid = '${user.id}';
				`, true);	
			}
			if (newPresence.status == 'idle') {
				if (oldPresence.status == 'idle') return;
				ch.query(`
					UPDATE status SET offline = false WHERE userid = '${user.id}';
					UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
					UPDATE status SET dnd = false WHERE userid = '${user.id}';
					UPDATE status SET dndsince = null WHERE userid = '${user.id}';
					UPDATE status SET online = false WHERE userid = '${user.id}';
					UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
					UPDATE status SET idle = true WHERE userid = '${user.id}';
					UPDATE status SET idlesince = '${Date.now()}' WHERE userid = '${user.id}';
				`, true);
			}
			if (newPresence.status == 'offline') {
				if (oldPresence.status == 'offline') return;
				ch.query(`
					UPDATE status SET offline = true WHERE userid = '${user.id}';
					UPDATE status SET offlinesince = '${Date.now()}' WHERE userid = '${user.id}';
					UPDATE status SET dnd = false WHERE userid = '${user.id}';
					UPDATE status SET dndsince = null WHERE userid = '${user.id}';
					UPDATE status SET online = false WHERE userid = '${user.id}';
					UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
					UPDATE status SET idle = false WHERE userid = '${user.id}';
					UPDATE status SET idlesince = null WHERE userid = '${user.id}';
				`, true);
			} else {
				if (newPresence.status == 'online') {
					const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'false', null, 'false', null, 'true', '${Date.now()}', 'false', null)`, true);
					if (!res) {
						if (oldPresence.status == 'online') return;
						ch.query(`
							UPDATE status SET offline = false WHERE userid = '${user.id}';
							UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
							UPDATE status SET dnd = false WHERE userid = '${user.id}';
							UPDATE status SET dndsince = null WHERE userid = '${user.id}';
							UPDATE status SET online = true WHERE userid = '${user.id}';
							UPDATE status SET onlinesince = '${Date.now()}' WHERE userid = '${user.id}';
							UPDATE status SET idle = false WHERE userid = '${user.id}';
							UPDATE status SET idlesince = null WHERE userid = '${user.id}';
						`, true);
					}
				}
				if (newPresence.status == 'dnd') {
					const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'false', null, 'true', '${Date.now()}', 'false', null, 'false', null)`, true);
					if (!res) {
						if (oldPresence.status == 'dnd') return;
						ch.query(`
							UPDATE status SET offline = false WHERE userid = '${user.id}';
							UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
							UPDATE status SET dnd = true WHERE userid = '${user.id}';
							UPDATE status SET dndsince = '${Date.now()}' WHERE userid = '${user.id}';
							UPDATE status SET online = false WHERE userid = '${user.id}';
							UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
							UPDATE status SET idle = false WHERE userid = '${user.id}';
							UPDATE status SET idlesince = null WHERE userid = '${user.id}';
						`, true);
					}
				}
				if (newPresence.status == 'idle') {
					const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'false', null, 'false', null, 'false', null, 'true', '${Date.now()}')`, true);
					if (!res) {
						if (oldPresence.status == 'idle') return;
						ch.query(`
							UPDATE status SET offline = false WHERE userid = '${user.id}';
							UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
							UPDATE status SET dnd = false WHERE userid = '${user.id}';
							UPDATE status SET dndsince = null WHERE userid = '${user.id}';
							UPDATE status SET online = false WHERE userid = '${user.id}';
							UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
							UPDATE status SET idle = true WHERE userid = '${user.id}';
							UPDATE status SET idlesince = '${Date.now()}' WHERE userid = '${user.id}';
						`, true);
					}
					
				}
				if (newPresence.status == 'offline') {
					const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'true', '${Date.now()}', 'false', null, 'false', null, 'false', null)`, true);
					if (!res) {
						if (oldPresence.status == 'offline') return;
						ch.query(`
							UPDATE status SET offline = true WHERE userid = '${user.id}';
							UPDATE status SET offlinesince = '${Date.now()}' WHERE userid = '${user.id}';
							UPDATE status SET dnd = false WHERE userid = '${user.id}';
							UPDATE status SET dndsince = null WHERE userid = '${user.id}';
							UPDATE status SET online = false WHERE userid = '${user.id}';
							UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
							UPDATE status SET idle = false WHERE userid = '${user.id}';
							UPDATE status SET idlesince = null WHERE userid = '${user.id}';
						`, true);
					}
				}

			}
		} else {
			if (newPresence.status == 'online') {
				const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'false', null, 'false', null, 'true', '${Date.now()}', 'false', null)`, true);
				if (!res) {
					if (oldPresence.status == 'online') return;
					ch.query(`
						UPDATE status SET offline = false WHERE userid = '${user.id}';
						UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
						UPDATE status SET dnd = false WHERE userid = '${user.id}';
						UPDATE status SET dndsince = null WHERE userid = '${user.id}';
						UPDATE status SET online = true WHERE userid = '${user.id}';
						UPDATE status SET onlinesince = '${Date.now()}' WHERE userid = '${user.id}';
						UPDATE status SET idle = false WHERE userid = '${user.id}';
						UPDATE status SET idlesince = null WHERE userid = '${user.id}';
					`, true);
				}
			}
			if (newPresence.status == 'dnd') {
				const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'false', null, 'true', '${Date.now()}', 'false', null, 'false', null)`, true);
				if (!res) {
					if (oldPresence.status == 'dnd') return;
					ch.query(`
						UPDATE status SET offline = false WHERE userid = '${user.id}';
						UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
						UPDATE status SET dnd = true WHERE userid = '${user.id}';
						UPDATE status SET dndsince = '${Date.now()}' WHERE userid = '${user.id}';
						UPDATE status SET online = false WHERE userid = '${user.id}';
						UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
						UPDATE status SET idle = false WHERE userid = '${user.id}';
						UPDATE status SET idlesince = null WHERE userid = '${user.id}';
					`, true);		
				}
			}
			if (newPresence.status == 'idle') {
				const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'false', null, 'false', null, 'false', null, 'true', '${Date.now()}')`, true);
				if (!res) {
					if (oldPresence.status == 'idle') return;
					ch.query(`
						UPDATE status SET offline = false WHERE userid = '${user.id}';
						UPDATE status SET offlinesince = null WHERE userid = '${user.id}';
						UPDATE status SET dnd = false WHERE userid = '${user.id}';
						UPDATE status SET dndsince = null WHERE userid = '${user.id}';
						UPDATE status SET online = false WHERE userid = '${user.id}';
						UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
						UPDATE status SET idle = true WHERE userid = '${user.id}';
						UPDATE status SET idlesince = '${Date.now()}' WHERE userid = '${user.id}';
					`, true);		
				}
			}
			if (newPresence.status == 'offline') {
				const res = await ch.query(`INSERT INTO status (userid, offline, offlinesince, dnd, dndsince, online, onlinesince, idle, idlesince) VALUES ('${user.id}', 'true', '${Date.now()}', 'false', null, 'false', null, 'false', null)`, true);
				if (!res) {
					if (oldPresence.status == 'offline') return;
					ch.query(`
						UPDATE status SET offline = true WHERE userid = '${user.id}';
						UPDATE status SET offlinesince = '${Date.now()}' WHERE userid = '${user.id}';
						UPDATE status SET dnd = false WHERE userid = '${user.id}';
						UPDATE status SET dndsince = null WHERE userid = '${user.id}';
						UPDATE status SET online = false WHERE userid = '${user.id}';
						UPDATE status SET onlinesince = null WHERE userid = '${user.id}';
						UPDATE status SET idle = false WHERE userid = '${user.id}';
						UPDATE status SET idlesince = null WHERE userid = '${user.id}';
					`, true);		
				}
			}
		}
	}
};