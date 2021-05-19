module.exports = {
	async execute(msg) {
		if (!msg.channel || msg.channel.type == 'dm') return;
		if (msg.channel.id !== '805839305377447936' || !msg.author) return;
		const member = await msg.client.ch.member(msg.guild, msg.author);
		if (msg.attachments.size == 0) {
			if (member) {
				if (!member.roles.cache.has('278332463141355520') && !member.roles.cache.has('293928278845030410') && !member.roles.cache.has('768540224615612437')) {
					msg.react('✅').catch(() => {});
					msg.react('❌').catch(() => {});
				}
			}
		} else if (!member.roles.cache.has('293928278845030410') && !member.roles.cache.has('278332463141355520')) msg.delete();
	} 
};