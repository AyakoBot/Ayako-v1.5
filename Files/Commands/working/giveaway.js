const Discord = require('discord.js');
const ms = require('ms');
const { pool } = require('../files/Database.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	name: 'giveaway',
	Category: 'Giveaway',
	requiredPermissions: 4,
	description: 'Start the giveaway setup process',
	usage: 'h!giveaway',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		     	   /* eslint-enable */
		let channel;
		let prize;
		let requirements;
		let winners;
		let time;
		let role;
		let server;
		const embed = new Discord.MessageEmbed()
			.setTitle('Giveaway Creation Started | You have 1 Minute to reply to each message')
			.setDescription('What channel do you want the giveaway to be in? Reply with a **Channel Mention** or **Channel ID**')
			.setFooter('Step 1 of 5 - You can say [cancel] anytime to abort the process')
			.setColor('b0ff00');
		msg.channel.send(embed);
		Channel(msg);
		function Channel(msg) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				let channell = collected.first().content;
				if (channell.toLowerCase() == 'cancel') {
					msg.reply('Okay, aborted');
					return;
				}
				if (channell.includes('<#')) {
					channell = channell.replace(/<#/g,  '');
					channell = channell.replace(/>/g, '');
					channel = client.channels.cache.get(channell);
				} else {
					channel = client.channels.cache.get(channell);
				}
				if (!channel) {
					msg.reply('That channel doesnt exist or i cant view it, please update the settings or enter a valid channel');
					Channel(msg);
					return;
				}
				if (channel.guild.id !== msg.guild.id) {
					msg.reply('You cant start Giveaway outside of this server, try again');
					Channel(msg);
					return;
				}
				const embed = new Discord.MessageEmbed()
					.setDescription(`${channel} will be the giveaway channel.\n\nWhat will be the prize? Reply with a message **shorter than 1000 letters**`)
					.setFooter('Step 2 of 5 - You can say [cancel] anytime to abort the process')
					.setColor('b0ff00');
				msg.channel.send(embed);
				Prize(msg, channel);
			}).catch(() => {
				msg.reply('Time ran out. If you still want your giveaway, start over');
			});
		}
		function Prize(msg, channel) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				prize = collected.first().content;
				if (prize.toLowerCase() == 'cancel') {
					msg.reply('Okay, aborted');
					return;
				}
				const embed = new Discord.MessageEmbed()
					.setDescription(`\`\`\`${prize}\`\`\` is what they will be winning.\n\nHow many winners will the giveaway have? Reply with a **number**`)
					.setFooter('Step 3 of 5 - You can say [cancel] anytime to abort the process')
					.setColor('b0ff00');
				msg.channel.send(embed);
				Winners(msg, channel, prize);
			}).catch(() => {
				msg.reply('Time ran out. If you still want your giveaway, start over');
			});
		}
		function Winners(msg, channel, prize) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				winners = collected.first().content;
				if (winners.toLowerCase() == 'cancel') {
					msg.reply('Okay, aborted');
					return;
				}
				if (isNaN(winners)) {
					msg.reply('The Number you entered is not actually a Number, reply with an actual Number please');
					Winners(msg, channel, prize);
					return;
				}
				const embed = new Discord.MessageEmbed()
					.setDescription(`There will be ${winners} winners.\n\nHow long should the giveaway be? Valid times are \`Days/D Hours/H Minutes/M\` Example: 7 days`)
					.setFooter('Step 4 of 5 - You can say [cancel] anytime to abort the process')
					.setColor('b0ff00');
				msg.channel.send(embed);
				Time(msg, channel, prize, winners);
			}).catch(() => {
				msg.reply('Time ran out. If you still want your giveaway, start over ');
			});
		}
		function Time(msg, channel, prize, winners) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				time = ms(collected.first().content.toLowerCase());
				if (collected.first().content.toLowerCase() == 'cancel') {
					msg.reply('Okay, aborted');
					return;
				}
				if (isNaN(time)) {
					msg.reply('Whatever you entered was not a valid time, please follow this pattern: `Days/D Hours/H Minutes/M` Example: 7 days');
					Time(msg, channel, prize, winners);
					return;
				}
				const embed = new Discord.MessageEmbed()
					.setDescription(`The giveaway will end in ${ms(time)} once it started.\n\nDo you want any Special requirements? Enter one of these: \n\`Role ID or Mention\`, \`Server ID\` or \`No\` for none`)
					.setFooter('Step 5 of 5 - You can say [cancel] anytime to abort the process')
					.setColor('b0ff00');
				msg.channel.send(embed);
				Req(msg, channel, prize, winners, time);
			}).catch(() => {
				msg.reply('Time ran out. If you still want your giveaway, start over ');
			});
		}
		function Req(msg, channel, prize, winners, time) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const req = collected.first().content.toLowerCase();
				if (collected.first().content.toLowerCase() == 'cancel') {
					msg.reply('Okay, aborted');
					return;
				}
				let systemchannel;
				if (req == ('no')) {
					finish(msg, channel, prize, winners, time, requirements);
					return;
				} else if (req.length !== 18) {
					if (!req.includes('&')) {
						msg.reply('That was not a valid Role ID / Role Mention / Server ID | Please enter a correct one now.'); 
						Req(msg, channel, prize, winners, time);
						return;
					} else {
						if (req.length !== 22) {
							msg.reply('Please only enter 1 Role, try again.');
							Req(msg, channel, prize, winners, time);
							return;
						}
						role = req.replace(/<@&/g, '');
						role = role.replace(/>/g, '');
						role = msg.guild.roles.cache.find(roles => roles.id == role);
						requirements = 'role';
						finish(msg, channel, prize, winners, time, requirements);
						return;
					}
				} else if (req.length == 18) {
					if (isNaN(req)) {msg.reply('That was not a valid Role ID / Role Mention / Server ID | Please enter a correct one now.'); Req(msg, channel, prize, winners, time); return;}
					else {
						role = msg.guild.roles.cache.get(req);
						var roletext = `${role}`;
						if (!role || roletext == 'undefined') {
							server = client.guilds.cache.get(req);
							const guildtext = `${server}`;
							if (!server || guildtext == 'undefined') {
								msg.reply('Since your Server does not have any roles with matching ID I guess that was a Server ID. Sadly I can only apply Server requirements if I\'m in that server since I need to access their Member List\n Use `h!invite` to view my Invite and invite me there, then start over.');
								return;
							} else {
								requirements = 'guild';
								systemchannel = client.channels.cache.get(server.systemChannelID);
								let inviteURL = '';
								systemchannel.createInvite({maxAge: Math.floor(time/1000+5), reason: `Giveaway on ${msg.guild.name}`}).then((invite) => {inviteURL = invite.url;}).catch(() => {});
								msg.channel.send(`Trying to create an Invite for ${server.name} <a:Loading:780543908861182013>`);
								setTimeout(() => {
									if (inviteURL !== '') {
										msg.channel.send(`<:tick:670163913370894346> Successfully created an Invite -> ${inviteURL}`);
										finish(msg, channel, prize, winners, time, requirements, server, inviteURL);
									} else {
										msg.channel.send('<:Cross:746392936807268474> I wasnt able to create an Invite, you can enter a custom invite. Reply with `invite url` or `no` which will abort the giveaway process');
										Continue(msg, channel, prize, winners, time, requirements, server, inviteURL);
										return;
									}
								}, ms('5s'));
								return;
							}
						} else {
							requirements = 'role';
							finish(msg, channel, prize, winners, time, requirements);
							return;
						}

					}
				} else {
					msg.reply('You didnt enter a Valid option, please reply with one of these options: `Role ID or Mention` `Server ID` or `No` for none');
					Req(msg, channel, prize, winners, time);
					return;
				}
			}).catch((e) => {
				console.log(e);
				msg.reply('Time ran out. If you still want your giveaway, start over ');
			});
		}
		function Continue(msg, channel, prize, winners, time, requirements, server, inviteURL) {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				if (collected.first().content.toLowerCase() == 'cancel') {
					msg.reply('Okay, aborted');
					return;
				}
				if (answer.includes('https://discord.gg/')) {
					inviteURL = collected.first().content;
					prize += `\n\n**Requirement:**\nYou should be member of [${server.name}](${collected.first().content} "Join ${server.name} to claim the prize")`;
					finish(msg, channel, prize, winners, time, requirements, server, inviteURL);
				} else if (answer == 'no') {
					msg.reply('Giveaway aborted, I only need "Create Invite" permissions in the System Channel. Thats all.');
					return;
				} else {
					msg.reply('That wasnt a valid answer, `URL`(has to be blue and clickable) or `No`');
					Continue(msg, channel, prize, winners, time, requirements, server, inviteURL);
					return;
				}
			}).catch(() => {
				msg.reply('Time ran out. If you still want your giveaway, start over ');
			});

		}
		async function finish(msg, channel, prize, winners, time, requirements, server, inviteURL) {
			const testEmbed = new Discord.MessageEmbed()
				.setColor('YELLOW')
				.setDescription('<a:Loading:780543908861182013> Starting a Giveaway');
			const giveawaymsg = await channel.send(testEmbed).catch(e =>{return msg.reply('I wasnt able to send the embed, be sure i have `Send Messages` `Embed Links` and `Attach Files` permissions in that channel and start over\n' +e);});
			time = +time + Date.now();
			const timeleft = moment.duration(+time - Date.now()).format(' D [days], H [hrs], m [mins], s [secs]');
			let description;
			if (requirements == 'role') {
				description = `${prize}}\n\n**Requirement:**\nYou should have the role\n${role}`;
			} else if (requirements == 'guild') {
				if (inviteURL) {
					description = `${prize}\n\n**Host**\nThis Giveaway is hosted by\n[${server.name}](${inviteURL})`;
				} else {
					description = `${prize}\n\n**Host**\nThis Giveaway is hosted by\n${server.name}`;
				}
			} else {
				description = prize;
			}
			const giveawayEmbed = new Discord.MessageEmbed()
				.setColor('b0ff00')
				.setAuthor('Ayako Giveaways', 'https://www.ayakobot.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription(`\u200b${description}`)
				.addField('React with 🎉 to participate!', `Time remaining: ${timeleft}`)
				.setFooter(`\u200b${winners} winner(s)'`)
				.setTimestamp(new Date(+time).toUTCString());
			giveawaymsg.edit(giveawayEmbed);
			giveawaymsg.react('🎉');
			msg.channel.send(`Your giveaway has started in ${channel}`);
			if (requirements) {
				let reqs;
				if(requirements == 'role') {
					reqs = 'role'; 
					pool.query(`INSERT INTO giveawaysettings( 
						guildid, channelid, messageid, requirement, reqroleid, description, winnercount, endat, ended
					) VALUES ( 
						'${msg.guild.id}', '${channel.id}', '${giveawaymsg.id}', '${reqs}', '${role.id}', '${prize.replace(/'/g, '')}', '${winners}', '${time}', 'false'
					)`);
				}
				if(requirements == 'guild') {
					reqs = 'guild';
					pool.query(`INSERT INTO giveawaysettings( 
						guildid, channelid, messageid, requirement, reqserverid, invitelink, description, winnercount, endat, ended
					) VALUES ( 
						'${msg.guild.id}', '${channel.id}', '${giveawaymsg.id}', '${reqs}', '${server.id}', '${inviteURL}', '${prize.replace(/'/g, '')}', '${winners}', '${time}', 'false'
					)`);
				}
			}
			if (!requirements) {
				pool.query(`INSERT INTO giveawaysettings(guildid, channelid, messageid, description, winnercount, endat, ended) VALUES ('${msg.guild.id}', '${channel.id}', '${giveawaymsg.id}', '${prize.replace(/'/g, '')}', '${winners}', '${time}', 'false')`);
			}
		}

	}};

