const Discord = require('discord.js');

module.exports = {
	name: 'delrole',
	perm: 268435456n,
	category: 'Roles',
	description: 'Delete a Role from your Server.',
	usage: 'h!delrole [Role Name, ID or mention]',
	async exe(msg) {
		let role = msg.guild.roles.cache.geT(msg.args[0].replace(/\D+/g, ''));
		if (!role || !role.id) role = msg.guild.roles.cache.find(r => r.name.toLowerCase == msg.args.slice(0).join(' ').toLowerCase());
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.commands.delRole;
		const Embed = new Discord.MessageEmbed();
		if (role.length) {
			const roles = role.map(o => o);
			if (roles.size > 1) {
				Embed.setColor('ff0000');
				Embed.setDescription(msg.client.ch.stp(lan.chooseRole, {amount: roles.size, role: msg.args.slice(0).join(' ')}));
				for (let i = 0; i < roles.size; i++) {
					Embed.addFields(`${i}.`, `${roles[i]}`);
				}
				const m = await msg.client.ch.reply(msg, Embed);
				if (!m) return; 
				const collected = await m.awaitReactions((reaction, user) => (reaction.emoji.id === msg.client.constants.tickID || reaction.emoji.id === msg.client.constants.crossID) && user.id === msg.author.id, {max: 1, time: 60000});
				if (!collected.first()) return;
				if (collected.first()._emoji.id == msg.client.constants.tickID) {
					proceednormally();
				} else {
					m.delete().catch(() => {});
					return;
				}

			} else {
				role = roles[0];
				delRole();
			}
		} else delRole();
		async function delRole() {
		
			const Embed = new Discord.MessageEmbed()
				.setDescription(msg.client.ch.stp(lan.deleted, {role: role}))
				.setColor(role.color);
			msg.client.ch.reply(msg, Embed);
		}
	}
};