const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		if (!msg.channel || msg.channel.type == 'DM' || !msg.author || !msg.guild) return;
		const member = msg.member;
		if (msg.guild.id == '366219406776336385' && msg.channel.id !== '801804774759727134') {
			if (msg.content.toLocaleLowerCase().includes('discord.gg/')) {
				if (msg.author.id !== '267835618032222209' && msg.author.id !== '400086473337995265') {
					if (member && !member.permissions.has('MANAGE_GUILD')) {
						msg.delete().catch(() => {});
						msg.client.ch.send(msg.channel, `${msg.author} **Do not send Discord Links in this Channel**`).then((m) => {setTimeout(() => {m.delete().catch(() => {});}, 10000);});
					} else if ( !member.permissions.has('MANAGE_GUILD')) msg.delete().catch(() => {});
				}
			} 
			if (msg.content.toLowerCase().startsWith('https://') || msg.content.toLowerCase().startsWith('http://')) {
				if (member) {
					if (member.roles.cache.has('369619820867747844') || member.roles.cache.has('367781331683508224') || member.roles.cache.has('585576789376630827') || msg.channel.id == '367403201646952450' || msg.channel.id == '777660259200270376' || msg.channel.id == '851779578846117888') return;
					msg.delete().catch(() => {});
					msg.client.ch.send(msg.channel, `${msg.author} You are not allowed to post links yet. \`Needed role: Level 30 | VIP | Nobles\``).then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 10000);  }).catch(() => {});
				} else msg.delete().catch(() => {});
			}
		}
		if (msg.guild.id == '366219406776336385') {
			if (msg.content.toLocaleLowerCase().includes('http://') || msg.content.toLocaleLowerCase().includes('https://')){
				if (msg.channel.id == '298954459172700181' || msg.channel.id == '644353691096186893' || msg.channel.id == '705095466358145035') {
					if(member.roles.cache.has('331556297344548874')) return;
					if(member.roles.cache.has('358778201868075008')) return;
					if(member.roles.cache.has('606164114691194900')) return;
					msg.delete().catch(() => {});
					msg.client.ch.send(msg.channel, `${msg.author} You are not allowed to post links yet. \`Needed level: Donut [40]\`\n Please use <#298954962699026432> and <#348601610244587531> instead.`).then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 10000);  }).catch();
				}
				if (msg.channel.id == '825690575147368479') {
					if(member.roles.cache.has('331556297344548874')) return;
					if(member.roles.cache.has('358778201868075008')) return;
					if(member.roles.cache.has('606164114691194900')) return;
					msg.delete().catch(() => {});
					msg.client.ch.send(msg.channel, `${msg.author} You are not allowed to post links yet. \`Needed level: Cookie [40]\``).then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 10000);  }).catch();

				}
			}
			if (msg.content.includes(' is now level ') && msg.author.id == '159985870458322944' && msg.guild.id == '298954459172700181' && msg.content.split(/ +/)[4].replace(/!/g, '') < 40) setTimeout(() => {msg.delete().catch(() => {});}, 10000);
			if (msg.content.includes(' leveled up!') && (msg.author.id == '172002275412279296' || msg.author.id == '453643070181867561')) setTimeout(() => {msg.delete().catch(() => {});}, 10000);	
		}
		if ((msg.channel.id == '554487212276842534' || msg.channel.id == '791390835916537906') && msg.attachments.size < 1 && !member.roles.cache.has('366238244775657472') && !member.roles.cache.has('776248679363248168') && msg.author.id !== msg.client.user.id) msg.delete().catch(() => {});			
		if (msg.guild.id == '298954459172700181') {
			if (msg.content.toLocaleLowerCase().includes('http://') || msg.content.toLocaleLowerCase().includes('https://')){
				if (msg.channel.id == '298954459172700181') {
					if (member) {
						if(member.roles.cache.has('334832484581769217')) return;
						if(member.roles.cache.has('606164114691194900')) return;
						msg.client.ch.send(msg.channel, `${msg.author} You are not allowed to post links yet. \`Needed level: Cookie [20]\`\n Please use <#298954962699026432> and <#348601610244587531> instead.`).then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 10000);  }).catch(() => {});
					}
					msg.delete().catch(() => {});
				}
				if (msg.author.id == '305448665496027137') {
					if (msg.content.toLocaleLowerCase().startsWith('.kill')) {
						const args = msg.content.split(/ +/);
						const killedUser = msg.mentions.users.first();
						let link;
						for (let i = 0; args.length > 0; i++) {
							if (args[i].includes('https://').endsWith('.gif')) {
								link = args[i];
							}
						}
						const embed = new Discord.MessageEmbed()
							.setColor('b0ff00')
							.setDescription(`${msg.author} killed ${killedUser} while being too retarded to use the proper commands`)
							.setThumbnail(link);
						msg.client.ch.send(msg.channel, embed);
						msg.delete();
					}
				}
			}
			if (msg.content.includes(' is now level ') && msg.author.id == '159985870458322944' && msg.guild.id == '298954459172700181' && msg.content.split(/ +/)[4].replace(/!/g, '') < 40) setTimeout(() => {msg.delete().catch(() => {});}, 10000);
			if (msg.content.includes(' leveled up!')) {
				if (msg.author.id == '172002275412279296' || msg.author.id == '453643070181867561') {
					setTimeout(() => {
						msg.delete().catch(() => {});
					}, 10000);	
				}}
			if (msg.author.id == '172002275412279296') {
				if (msg.channel.id !== '298955020232032258' && msg.channel.id !== '756502435572219915' && msg.channel.id !== '315517616447946763') {
					setTimeout(() => {
						msg.delete().catch(() => {});
					}, 10000);
				}
			}
			if (msg.content.toLowerCase().includes('nazi') || msg.content.toLowerCase().includes('jew') || Date.now() - msg.author.createdAt < 1000*60*20) {
				msg.react('❔').catch(() => {});
				msg.channel.awaitMessages(m => m.author.id == '318453143476371456' || m.author.id == msg.author.id,
					{max: 1, time: 60000}).then(collected => {
					const content = collected.first().content.toLowerCase();
					if (collected.first().author.id == '318453143476371456') {
						if (content == 'y') {
							msg.guild.members.ban(msg.author, {
								days: 1,
								reason: 'Executor: Lars_und_so#0666 | no reason specified',
							}).catch(() => {});
							const embed = new Discord.MessageEmbed()
								.setColor('#ff0000')
								.setDescription(`${msg.author} was banned from the server`)
								.setTimestamp();
							msg.client.ch.send(msg.channel, embed).catch(() => {});
						} else return msg.reactions.removeAll().catch(() => {});
					} else return msg.reactions.removeAll().catch(() => {});
				}).catch(() => {msg.reactions.removeAll().catch(() => {});});
			}
			if (msg.content.startsWith('.shop') && msg.guild.id == '298954459172700181') {
				msg.client.ch.reply(msg, '<:nFingerGun:700775747006234754> hey you! We have an updated version of the Role Shop. Just type `h!shop`');
			}
		}
	}
};