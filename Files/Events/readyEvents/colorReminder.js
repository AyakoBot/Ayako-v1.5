module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const webhook = await client.fetchWebhook('786087332046307358', 'uXE1nXaeNO5sB47LH6BjigGqggVgYgiD5MpGH1l6f-ufZMo0rtF-2mqPcwQg1k-vXZms');
		const contents = 'Want to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>';
		const splitter = '\n➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖';
		const lastLine = '\n<:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080>';
		const m = await webhook.send(contents+splitter+lastLine);
		const times = 50;
		const editTimeout = 250;
		const readTimeout = 10000;
		const allTogether = editTimeout * 12 + readTimeout * 4;
		for (let i = 0; i < times; i++) {
			setTimeout(() => {
				setTimeout(() => {
					webhook.editMessage(m, 'Visit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+splitter+'\nRemember to keep unrelated Memes in <#348601610244587531>'+lastLine).catch(() => {});
					setTimeout(() => {
						webhook.editMessage(m, 'Or just type `,lsar` in <#298955020232032258>'+splitter+'\nRemember to keep unrelated Memes in <#348601610244587531>\nand Bot Commands in <#298955020232032258>'+lastLine).catch(() => {});
						setTimeout(() => {
							webhook.editMessage(m, splitter+'\nRemember to keep unrelated Memes in <#348601610244587531>\nand Bot Commands in <#298955020232032258>\n⠀'+lastLine).catch(() => {});
							setTimeout(() => {
								webhook.editMessage(m, 'Remember to keep unrelated Memes in <#348601610244587531>\nand Bot Commands in <#298955020232032258>\n⠀'+splitter+lastLine).catch(() => {});
								setTimeout(() => {
									webhook.editMessage(m, 'and Bot Commands in <#298955020232032258>\n⠀'+splitter+'\nYou have Ideas to make the Server more attractive?'+lastLine).catch(() => {});
									setTimeout(() => {
										webhook.editMessage(m, '⠀'+splitter+'\nYou have Ideas to make the Server more attractive?\nBot add requests or new Command Ideas for <@650691698409734151>?'+lastLine).catch(() => {});
										setTimeout(() => {
											webhook.editMessage(m, splitter+'\nYou have Ideas to make the Server more attractive?\nBot add requests or new Command Ideas for <@650691698409734151>?\nVisit <#772516942769553418> and let us know!'+lastLine).catch(() => {});
											setTimeout(() => {
												webhook.editMessage(m, 'You have Ideas to make the Server more attractive?\nBot add requests or new Command Ideas for <@650691698409734151>?\nVisit <#772516942769553418> and let us know!'+splitter+lastLine).catch(() => {});
												setTimeout(() => {
													webhook.editMessage(m, 'Bot add requests or new Command Ideas for <@650691698409734151>?\nVisit <#772516942769553418> and let us know!'+splitter+'\nWant to get your name colored?'+lastLine).catch(() => {});
													setTimeout(() => {
														webhook.editMessage(m, 'Visit <#772516942769553418> and let us know!'+splitter+'\nWant to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>'+lastLine).catch(() => {});
														setTimeout(() => {
															webhook.editMessage(m, splitter+'\nWant to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+lastLine).catch(() => {});
															setTimeout(() => {
																webhook.editMessage(m, 'Want to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+splitter+lastLine).catch(() => {});
															}, editTimeout);
														}, editTimeout);
													}, editTimeout);
												}, readTimeout);
											}, editTimeout);
										}, editTimeout);
									}, editTimeout);
								}, readTimeout);
							}, editTimeout);
						}, editTimeout);
					}, editTimeout);
				}, readTimeout);
			}, i*allTogether);
		}
	}
};