module.exports = {
	name: 'bypass',
	perm: 8192n,
	dm: false,
	takesFirstArg: true,
	aliases: null,
	ThisGuildOnly: ['298954459172700181'],
	category: 'Moderation',
	description: 'Let a User skip the Verification',
	usage: ['bypass [user ID or mention]'],
	async execute(msg) {
		const user = msg.args[0].replace(/\D+/g, '');
		const BypassRole = msg.guild.roles.cache.find(role => role.id === '389470002992119810');
		const PreRole = msg.guild.roles.cache.find(role => role.id === '805315426543599676');
		const member = await msg.client.ch.member(msg.guild, user);
		const done1 = await member.roles.remove(PreRole);
		const done2 = await member.roles.add(BypassRole);
		if (!done1 || !done2) {
			msg.react(msg.client.constants.emotes.crossID).catch(()=>{});
			msg.client.ch.reply('Something went wrong when I tried to update the Members Roles. Please check manually.');
		} else {
			const DM = await user.createDM();
			msg.react(msg.client.constants.emotes.tickID).catch(()=>{});
			msg.client.ch.send(DM, 'You have been manually bypassed by a Staff Member');
		}
	}
};