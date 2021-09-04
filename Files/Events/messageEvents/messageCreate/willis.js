module.exports = {
	async execute(msg) {
		if (!msg.channel || msg.channel.type == 'DM') return;
		if (msg.channel.id !== '805839305377447936' || !msg.author) return;
		if (msg.attachments.size == 0) {
			if (msg.member) {
				if (!msg.member.roles.cache.has('278332463141355520') && !msg.member.roles.cache.has('293928278845030410') && !msg.member.roles.cache.has('768540224615612437')) {
					msg.react('✅').catch(() => {});
					msg.react('❌').catch(() => {});
				}
			}
		} else if (!msg.member.roles.cache.has('293928278845030410') && !msg.member.roles.cache.has('278332463141355520')) msg.delete();
	} 
};