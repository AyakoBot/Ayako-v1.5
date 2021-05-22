const Discord = require('discord.js');
const re = /[0-9A-Fa-f]{6}/g;

module.exports = {
	name: 'addrole',
	perm: 268435456n,
	category: 'Roles',
	description: 'Create a new Role in your Server with standard Permissions.',
	usage: 'h!addrole (hex color code or 000000) [name of the new Role]',
	async exe(msg) {
		const color = re.test(msg.args[0]) ? msg.args[0] : '||000000';
		let RoleName;
		if (color === '||000000') RoleName = msg.args.slice(0).join(' ');
		else RoleName = msg.args.slice(1).join(' ');
		const language = await msg.client.ch.languageSelector(msg.guild);
		const lan = language.commands.addRole;
		if (!RoleName) return msg.client.ch.reply(msg, lan.noName);
		const role = await msg.guild.roles.create({
			name: `${RoleName}`,
			color: color.replace('||', ''),
			reason: msg.client.ch.stp(lan.reason, {user: msg.author})
		}).catch(() => {});
		const Embed = new Discord.MessageEmbed()
			.setDescription(msg.client.ch.stp(lan.created, {role: role}))
			.setColor(color);
		msg.client.ch.reply(msg, Embed);
	}
};