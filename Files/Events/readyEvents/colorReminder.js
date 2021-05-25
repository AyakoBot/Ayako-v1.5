module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const webhook = await client.fetchWebhook('786087332046307358', 'uXE1nXaeNO5sB47LH6BjigGqggVgYgiD5MpGH1l6f-ufZMo0rtF-2mqPcwQg1k-vXZms');
		//const contents = 'Want to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>';
		const aa = 'Theres a pretty important Vote going on in <#388441229064667157>\nIt\'s related to the newly introduced Role Separators\n**Please Vote!!11!1**';
		const splitter = '\n➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖ ➖';
		const lastLine = '\n<:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080> <:invis:644684654741422080>';
		const m = await webhook.send(aa+splitter+lastLine);
		const times = 83; //109
		const editTimeout = 250;
		const readTimeout = 10000;
		const allTogether = editTimeout * 12 + readTimeout * 4;
		for (let i = 0; i < times; i++) {
			setTimeout(() => {
				setTimeout(() => {
					webhook.editMessage(m, 'Visit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+splitter+'\nRemember to keep NSFW Chatting in <#825690575147368479>'+lastLine);
					setTimeout(() => {
						webhook.editMessage(m, 'Or just type `,lsar` in <#298955020232032258>'+splitter+'\nRemember to keep NSFW Chatting in <#825690575147368479>\nand Bot Commands in <#298955020232032258>'+lastLine);
						setTimeout(() => {
							webhook.editMessage(m, splitter+'\nRemember to keep NSFW Chatting in <#825690575147368479>\nand Bot Commands in <#298955020232032258>\n⠀'+lastLine);
							setTimeout(() => {
								webhook.editMessage(m, 'Remember to keep NSFW Chatting in <#825690575147368479>\nand Bot Commands in <#298955020232032258>\n⠀'+splitter+lastLine);
								setTimeout(() => {
									webhook.editMessage(m, 'and Bot Commands in <#298955020232032258>\n⠀'+splitter+'\nYou have Ideas to make the Server more attractive?'+lastLine);
									setTimeout(() => {
										webhook.editMessage(m, '⠀'+splitter+'\nYou have Ideas to make the Server more attractive?\nBot add requests or new Command Ideas for <@650691698409734151>?'+lastLine);
										setTimeout(() => {
											webhook.editMessage(m, splitter+'\nYou have Ideas to make the Server more attractive?\nBot add requests or new Command Ideas for <@650691698409734151>?\nVisit <#772516942769553418> and let us know!'+lastLine);
											setTimeout(() => {
												webhook.editMessage(m, 'You have Ideas to make the Server more attractive?\nBot add requests or new Command Ideas for <@650691698409734151>?\nVisit <#772516942769553418> and let us know!'+splitter+lastLine);
												setTimeout(() => {
													webhook.editMessage(m, 'Bot add requests or new Command Ideas for <@650691698409734151>?\nVisit <#772516942769553418> and let us know!'+splitter+'\nWant to get your name colored?'+lastLine);
													setTimeout(() => {
														webhook.editMessage(m, 'Visit <#772516942769553418> and let us know!'+splitter+'\nWant to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>'+lastLine);
														setTimeout(() => {
															webhook.editMessage(m, splitter+'\nWant to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+lastLine);
															setTimeout(() => {
																webhook.editMessage(m, 'Want to get your name colored?\nVisit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+splitter+lastLine);
																setTimeout(() => {
																	webhook.editMessage(m, 'Visit <#395577394238455808> & <#845171979358044190>\nOr just type `,lsar` in <#298955020232032258>'+splitter+'\nTheres a pretty important Vote going on in <#388441229064667157>'+lastLine);
																	setTimeout(() => {
																		webhook.editMessage(m, 'Or just type `,lsar` in <#298955020232032258>'+splitter+'\nTheres a pretty important Vote going on in <#388441229064667157>\nIt\'s related to the newly introduced Role Separators'+lastLine);
																		setTimeout(() => {
																			webhook.editMessage(m, splitter+'\nTheres a pretty important Vote going on in <#388441229064667157>\nIt\'s related to the newly introduced Role Separators\n**Please Vote!!11!1**'+lastLine);
																			setTimeout(() => {
																				webhook.editMessage(m, 'Theres a pretty important Vote going on in <#388441229064667157>\nIt\'s related to the newly introduced Role Separators\n**Please Vote!!11!1**'+splitter+lastLine);
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
							}, editTimeout);
						}, editTimeout);
					}, editTimeout);
				}, readTimeout);
			}, i*allTogether);
		}
	}
};