const { pool } = require('../files/Database.js');
const Discord = require('discord.js');
const ms = require('ms');
module.exports = {
	name: 'giveawayedit',
	Category: 'Giveaway',
	requiredPermissions: 2,
	description: 'Edit a Giveaway',
	usage: 'h!giveawayedit [message ID]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		if(!args[0] || isNaN(args[0])) return NotValid('You need to enter a valid Message ID -> `h!giveawayedit [message ID]`');
		let messageID = args[0];
		const res = await pool.query(`SELECT * FROM giveawaysettings WHERE messageid = '${messageID}'`);
		const embed = new Discord.MessageEmbed()
			.setColor('b0ff00')
			.setAuthor('Edit a Giveaway', 'https://www.ayakobot.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
			.setFooter('Type |cancel| to abort the Giveaway edit process');
		if (!res) return msg.reply('I wasn\'t able to find that Giveaway, please check the Message ID');
		if (!res.rows[0]) return msg.reply('I wasn\'t able to find that Giveaway, please check the Message ID');
		Afirst();
		async function Afirst() {
			embed.setDescription('I found the Giveaway you want to edit, what would you like to edit\n**Valid answers:**');
			embed.addFields(
				{name: '`endtime`', value: 'The time how long the giveaway lasts', inline: true},
				{name: '`winnercount`', value: 'The amount of winners at the end of the Giveaway', inline: true},
				{name: '`prize`', value: 'The prize they will be receiving', inline: true},
				{name: '`server`', value: 'Server Requirement (can be added or removed afterwards)', inline: true},
				{name: '`role`', value: 'Role Requirement (can be added or removed afterwards)', inline: true},
				{name: '`inviteurl`', value: 'The Invite URL used (only works if this Giveaway has a Server requirement)', inline: true},
			);
			Send(embed);
			embed.fields = [];
			Ffirst();
		}
		let editing;
		async function Ffirst() {
			const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
			if (!collected.first()) return TimeRanOut();
			editing = collected.first().content.toLowerCase();
			if (editing == 'cancel') {
				NotValid('Aborted.');
				return;
			} else
			if (editing == 'endtime') {
				embed.setDescription('You are editing the time when the Giveaway ends.\nPlease enter the new time now.');
				embed.addField('Examples:', '```7d = 7 days | 5h = 5 hours | 20m = 20 minutes```');
				Send(embed);
				embed.fields = [];
				Editing();
			} else if (editing == 'winnercount') {
				embed.setDescription('You are editing the winner count.\nPlease enter the new Winner Count now.');
				embed.addField('Examples:', 'Any Number');
				Send(embed);
				embed.fields = [];
				Editing();
			} else if (editing == 'prize') {
				embed.setDescription('You are editing the prize.\nPlease enter the new prize now.');
				embed.addField('Examples:', 'Any Text');
				Send(embed);
				embed.fields = [];
				Editing();
			} else if (editing == 'server') {
				if (res.rows[0].requirement == 'guild' || !res.rows[0].requirement) {
					embed.setDescription('You are editing the Server Requirement');
					embed.addField('Examples:', 'Server ID `298954459172700181` or `none` to delete an existing Server requirement');
					Send(embed);
					embed.fields = [];
					Editing();
				} else {
					NotValid('Sadly this Giveaway already has a Role Requirement. You cannot add another\nAborted.');
					return;
				}
			} else if (editing == 'role') {
				if (res.rows[0].requirement == 'role' || !res.rows[0].requirement) {
					embed.setDescription('You are editing the Role Requirement');
					embed.addField('Examples:', 'Role ID `298954459172700181`, Role Name, Role @mention or `none` to delete an existing Role requirement');
					Send(embed);
					embed.fields = [];
					Editing();
				} else {
					NotValid('Sadly this Giveaway already has a Server Requirement. You cannot add another\nAborted.');
					return;
				}
			} else if (editing == 'inviteurl') {
				if (res.rows[0].requirement == 'guild') {
					embed.setDescription('You are editing the Invite URL.\nPlease enter the new Invite URL now.');
					embed.addField('Examples:', 'https://discord.gg/VWvGvgW9S3');
					Send(embed);
					embed.fields = [];
					Editing();
				} else {
					NotValid('Sadly this Giveaway has no Server Requirement. You have to add one beforehand\nAborted.');
					return;
				}
			} else {
				NotValid();
				Ffirst();
				return;
			}
		}
		async function Editing() {
			const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
			if (!collected.first()) return TimeRanOut();
			const answer = collected.first().content.toLowerCase();
			if (answer == 'cancel') {
				NotValid('Aborted.');
				return;
			} else
			if (editing == 'endtime') {
				if (!isNaN(ms(answer))) {
					pool.query(`UPDATE giveawaysettings SET endat = '${+Date.now() + +ms(answer)}' WHERE messageid = '${messageID}'`);
					Finish();
				} else {
					NotValid();
					Editing();
					return;
				}
			} else if (editing == 'winnercount') {
				if (!isNaN(answer)) {
					pool.query(`UPDATE giveawaysettings SET winnercount = '${answer}' WHERE messageid = '${messageID}'`);
					Finish();
				} else {
					NotValid();
					Editing();
					return;
				}
			} else if (editing == 'prize') {
				pool.query(`UPDATE giveawaysettings SET description = '${answer.replace(/'/g, '')}'`);
				Finish();
			} else if (editing == 'server') {
				if (answer == 'none') {
					if (res.rows[0].requirement == 'guild') {
						pool.query(`
						UPDATE giveawaysettings SET requirement = null WHERE messageid = '${messageID}';
						UPDATE giveawaysettings SET reqserverid = null WHERE messageid = '${messageID}';
						UPDATE giveawaysettings SET invitelink = null WHERE messageid = '${messageID}';
						`);
						Finish();
						return;
					} else {
						NotValid('That Giveaway has no server requirement.\nAborted');
						return;
					}
				} else 
				if (!isNaN(answer)) {
					const server = client.guilds.cache.get(answer);
					if (server && server.id) {
						const m = await Send(`Trying to create an Invite for ${server.name} <a:loading:399267255839490051>`);						
						let channel = client.channels.cache.get(server.systemChannelID);
						if (!channel) {
							const textchannels = server.channels.cache.filter((c) => c.type == 'text');
							channel = textchannels.first();
						}
						const inv = await channel.createInvite({maxAge: (+res.rows[0].endat - +Date.now())/1000+5, reason: `Giveaway on ${msg.guild.name}`}).catch(() => {});
						let invite;
						if (inv && inv.url) {
							m.edit(`<:tick:670163913370894346> Successfully created an Invite -> ${inv.url}`);
							invite = inv.url;
							pool.query(`
							UPDATE giveawaysettings SET reqserverid = '${server.id}' WHERE messageid = '${messageID}';
							UPDATE giveawaysettings SET invitelink = '${invite}' WHERE messageid = '${messageID}';
							UPDATE giveawaysettings SET requirement = 'guild' WHERE messageid = '${messageID}';
							`);
							Finish();
						} else {
							m.edit('<:Cross:746392936807268474> I wasnt able to create an Invite, you can enter a custom invite. Reply with the invite url or `no` which will abort the Giveaway editing process');
							createInvite(server, invite);
						}
					} else {
						NotValid('I\'m not a Member of that Server, sadly this is a requirement. Else the Giveaway won\'t work properly.\nPlease Invite me there.\nAborted.');
						return;
					}
				} else {
					NotValid();
					Editing();
				}
			} else if (editing == 'role') {
				if (answer == 'none') {
					pool.query(`
					UPDATE giveawaysettings SET reqroleid = null WHERE messageid = '${messageID}';
					UPDATE giveawaysettings SET requirement = null WHERE messageid = '${messageID}';
					`);
					Finish();
					return;
				} else {
					let role = msg.guild.roles.cache.find((r) => r.name.toLowerCase() == answer);
					if (!role || !role.id) {
						role = msg.guild.roles.cache.get(answer.replace(/\D+/g, ''));
					}
					if (!role || !role.id) {
						NotValid();
						Editing();
					} else {
						pool.query(`
						UPDATE giveawaysettings SET reqroleid = '${role.id}' WHERE messageid = '${messageID}';
						UPDATE giveawaysettings SET requirement = 'role' WHERE messageid = '${messageID}';
						`);
						Finish();
						return;
					}
				}
			} else if (editing == 'inviteurl') {
				const newinviteurl = await client.fetchInvite(collected.first().content).catch(() => {
					NotValid();
					Editing();
					return;
				});
				if (newinviteurl) {
					if (!newinviteurl.channel || !newinviteurl.channel.guild || newinviteurl.channel.guild.id == client.guilds.cache.get(res.rows[0].reqserverid).id) {
						pool.query(`
						UPDATE giveawaysettings SET invitelink = '${newinviteurl}' WHERE messageid = '${messageID}';
						UPDATE giveawaysettings SET requirement = 'guild' WHERE messageid = '${messageID}';
						`);
						Finish();
						return;
					} else {
						NotValid('This URL points to the server `'+newinviteurl.channel.guild.name+'` not `'+client.guilds.cache.get(res.rows[0].reqserverid).name+'`\nAborted');
						return;
					}
				} else {
					NotValid();
					return;
				}
			}
		}
		async function createInvite(server, invite) {
			const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
			if (!collected.first()) return TimeRanOut();
			const answer = collected.first().content.toLowerCase();
			if (answer == 'cancel') {
				NotValid('Aborted.');
				return;
			} else
			if (answer.includes('https://discord.gg/')) {
				invite = collected.first().content;
				if (editing == 'server') {
					const inviteurl = await client.fetchInvite(invite);
					if (inviteurl) {
						if (!inviteurl.channel || !inviteurl.channel.guild || inviteurl.channel.guild.id == server.id) {
							pool.query(`
							UPDATE giveawaysettings SET reqserverid = '${server.id}' WHERE messageid = '${messageID}';
							UPDATE giveawaysettings SET invitelink = '${invite}' WHERE messageid = '${messageID}';
							UPDATE giveawaysettings SET requirement = 'guild' WHERE messageid = '${messageID}';
							`);
						} else {
							NotValid('This URL points to the server `'+inviteurl.channel.guild.name+'` not `'+server.name+'`\nPlease try again.');
							createInvite(server, invite);
							return;
						}
					} else {
						NotValid();
						return;
					}
				} else {
					pool.query(`UPDATE giveawaysettings SET invitelink = '${invite}' WHERE messageid = '${messageID}';`);
				}
				Finish();
				return;
			} else {
				embed.setColor('ff0000');
				embed.setDescription('That was not a valid Invite URL, please try again.\nBe sure the Link is [Blue](https://www.ayakobot.com), __underlined__ and you can open it. Exactly like [this](https://www.ayakobot.com)');
				NotValid(embed);
				createInvite(server, invite);
			}
		}
		async function Finish() {
			embed.setDescription('Success! Giveaway Data Updated.\nThe Giveaway will update in less than 11 Seconds');
			Send(embed);
		}
		async function NotValid(m) {
			if (!m) m = 'That was not a valid answer, please try again';
			const ms = await msg.reply(m).catch(() => {});
			return ms;
		} 
		async function Send(m) {
			const ms = await msg.channel.send(m).catch(() => {});
			return ms;
		}
		async function TimeRanOut(m) {
			if (!m) m = 'Time ran out, please start over';
			const ms = await msg.reply(m).catch(() => {});
			return ms;
		}
	}};