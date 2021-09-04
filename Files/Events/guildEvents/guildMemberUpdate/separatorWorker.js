const { parentPort, workerData } = require('worker_threads');
getMembers(workerData);

async function getMembers(wd) {
	const res = wd.res, obj = wd.obj;
	const  membersWithRoles = new Array;
	const resolved = await new Promise((resolve) => {
		obj.members.forEach((member, indexMember) => {
			const giveThese = new Array, takeThese = new Array;
			res.forEach(async (row) => {
				const sep = obj.separators.find(s => s.separator.id == row.separator).separator;
				if (sep) {
					if (row.isvarying) {
						const stop = row.stoprole ? obj.separators.find(s => s.separator.id == row.separator).stoprole : null;
						const affectedRoles = new Array;
						const roles = obj.roles.map(o => o);
						if (row.stoprole) {
							if (sep.rawPosition > stop.rawPosition) for (let i = stop.rawPosition+1; i < roles.length && i < sep.rawPosition; i++) affectedRoles.push(obj.roles.find(r => r.rawPosition == i));
							else for (let i = sep.rawPosition+1; i < roles.length && i < stop.rawPosition; i++) affectedRoles.push(obj.roles.find(r => r.rawPosition == i));
						} else if (sep.rawPosition < obj.highestRole.rawPosition) for (let i = sep.rawPosition+1; i < roles.length && i < obj.highestRole.rawPosition; i++) affectedRoles.push(obj.roles.find(r => r.rawPosition == i));
						const has = new Array;
						affectedRoles.forEach(role => {
							if (role) {
								if (member.roles.map(o => o.id).includes(role.id)) has.push(true);
								else has.push(false);
							} 
						});
						if (has.includes(true) && !member.roles.map(o => o.id).includes(sep.id) && obj.clientHighestRole.rawPosition > sep.rawPosition) giveThese.push(sep.id);
						else if (!has.includes(true) && member.roles.map(o => o.id).includes(sep.id) && obj.clientHighestRole.rawPosition > sep.rawPosition) takeThese.push(sep.id);
					} else {
						const has = new Array;
						row.roles.forEach(role => {
							if (member.roles.map(o => o.id).includes(role.id)) has.push(true);
							else has.push(false);
						});
						if (has.includes(true) && !member.roles.map(o => o.id).includes(sep.id) && obj.clientHighestRole.rawPosition > sep.rawPosition) giveThese.push(sep.id);
						else if (!has.includes(true) && member.roles.map(o => o.id).includes(sep.id) && obj.clientHighestRole.rawPosition > sep.rawPosition) takeThese.push(sep.id);
					}
				}
			});
			if (giveThese.length > 0) member.giveTheseRoles = giveThese;
			if (takeThese.length > 0) member.takeTheseRoles = takeThese;
			if (takeThese.length > 0 || giveThese.length > 0) membersWithRoles.push(member);
			if (indexMember == obj.members.length-1) resolve(true);
		});
	});
	setInterval(() => {
		if (resolved) parentPort.postMessage(membersWithRoles);
	}, 1000);
	
}
