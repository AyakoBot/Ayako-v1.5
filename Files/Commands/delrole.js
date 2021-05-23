const Discord = require('discord.js');

module.exports = {
	name: 'delrole',
	perm: 268435456n,
	category: 'Roles',
	takesFirstArg: true,
	description: 'Delete a Role from your Server.',
	usage: ['delrole [ID or @mention]'],
	async exe(msg) {
		let role = msg.guild.roles.cache.get(msg.args[0].replace(/\D+/g, ''));
		const language = msg.language;
		const lan = language.commands.delRole;
		if (!role || !role.id) msg.client.ch.reply(msg, lan.noRoleFound);
		const Embed = new Discord.MessageEmbed();
		if (role.managed) {
			Embed
				.setAuthor(language.error, msg.client.constants.standard.errorImage, msg.client.constants.standard.invite)
				.setColor(msg.client.constants.error)
				.setDescription(msg.client.ch.makeUnderlined(msg.language.permissions.error.msg))
				.addField(language.problem, msg.client.ch.makeCodeBlock(lan.error.roleManagedProblem))
				.addField(language.solution, msg.client.ch.makeCodeBlock(lan.error.roleManagedSolution));
			return msg.client.ch.reply(msg, Embed);
		}
		if (msg.guild.me.roles.highest.rawPosition <= role.rawPosition) {
			Embed
				.setAuthor(language.error, msg.client.constants.standard.errorImage, msg.client.constants.standard.invite)
				.setColor(msg.client.constants.error)
				.setDescription(msg.client.ch.makeUnderlined(msg.language.permissions.error.msg))
				.addField(language.problem, msg.client.ch.makeCodeBlock(lan.error.rolePosProblem))
				.addField(language.solution, msg.client.ch.makeCodeBlock(lan.error.rolePosSolution));
			return msg.client.ch.reply(msg, Embed);
		}
		await role.delete().catch(() => {});
		Embed
			.setDescription(msg.client.ch.stp(lan.deleted, {role: role}))
			.setColor(role.color);
		msg.client.ch.reply(msg, Embed);
	}
};