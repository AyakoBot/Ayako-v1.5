const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'antispambypass',
	Category: 'Antispam',
	requiredPermissions: 2,
	description: 'Make a channel, role or user immune to Ayako AntiSpam',
	usage: 'h!antispambypass [role ID or mention / User ID or mention / Channel ID or mention]\nh!antispambypass delete [role ID or mention / User ID or mention / Channel ID or mention]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		if (!args[0]) {return msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` or `h!antispambypass delete [ID or mention]` 1');}
		const entry = args[0];
		const entry2 = args[1];
		const result = await pool.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}'`);
		let bpchannels;
		let bpusers;
		let bproles;
		if (result !== undefined && result.rows[0] !== undefined) {
			bpchannels = result.rows[0].bpchannelid;
			bpusers = result.rows[0].bpuserid;
			bproles = result.rows[0].bproleid;
		}
		if (entry == 'delete') {
			if (msg.mentions.users.first()){
				DuserF(msg.mentions.users.first());
			} else {
				if(entry2){
					client.users.fetch(entry2).then(user => {

						if(user && user.id){
							DuserF(user);
						}else{
							DisNotUser(entry2);
						}
					}).catch(e=>{
						DisNotUser(entry2);
						/* eslint-disable */
					let error;
					error = e;
					/* eslint-enable */
					});
				} else {
					msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 2');
				}
			}
		} else {
			if (msg.mentions.users.first()){
				userF(msg.mentions.users.first());
			} else {
				if(entry){
					const user = client.users.cache.get(entry);
					if(user && user.id){
						userF(user);
					}else{
						isNotUser(entry);
					}
				} else {
					msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 2');
				}
			}
		}

		function isNotUser(entry) {
			if (entry.length == 18) {
				const channel = msg.guild.channels.cache.get(entry);
				if (channel) {
					channelF(channel);
					return;
				} else {
					const role = msg.guild.roles.cache.find(r => r.id == entry);
					if (role) {
						roleF(role);
						return;
					} else {
						msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 3');
						return;
					}
				}
			} else if (entry.length == 21) {
				if (entry.includes('<#') && entry.includes('>')) {
					let channel = msg.guild.channels.cache.get(entry.replace(/<#/g, '').replace(/>/g, ''));
					channelF(channel);
					return;
				} else {
					msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 4');
					return;
				}
			} else if (entry.length == 22) {
				if (entry.includes('<@&') && entry.includes('>')) {
					let role = msg.guild.roles.cache.find(r => r.id == entry.replace(/<@&/g, '').replace(/>/g, ''));
					roleF(role);
					return;
				} else {
					msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 5');
					return;
				} 
			} else {
				msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 6');
			}
		}
		
		function userF(user) {
			if (bpusers) {
				if(bpusers.indexOf(user.id) !== -1) { return msg.reply('This user is already bypassed.');}
				bpusers.push(user.id);
			} else {
				bpusers = [user.id];
			}
			pool.query(`UPDATE antispamsettings SET bpuserid = ARRAY[${bpusers}] WHERE guildid = '${msg.guild.id}'`);
			Finish(user);
		}
		function channelF(channel) {
			if (bpchannels) {
				if(bpchannels.indexOf(channel.id) !== -1) { return msg.reply('This channel is already bypassed.');}
				bpchannels.push(channel.id);
			} else {
				bpchannels = [channel.id];
			}
			pool.query(`UPDATE antispamsettings SET bpchannelid = ARRAY[${bpchannels}] WHERE guildid = '${msg.guild.id}'`);
			Finish(channel);
		}
		function roleF(role) {
			if (bproles) {
				if(bproles.indexOf(role.id) !== -1) { return msg.reply('This role is already bypassed.');}
				bproles.push(role.id);
			} else {
				bproles = [role.id];
			}
			pool.query(`UPDATE antispamsettings SET bproleid = ARRAY[${bproles}] WHERE guildid = '${msg.guild.id}'`);
			Finish(role);
		}
		function Finish(bypassed) {
			const embed = new Discord.MessageEmbed()
				.setDescription(`${bypassed} is now immune to AntiSpam`)
				.setColor('b0ff00');
			msg.channel.send(embed);
		}

		function DisNotUser(entry) {
			if (entry.length == 18) {
				const channel = msg.guild.channels.cache.get(entry);
				if (channel) {
					DchannelF(channel);
					return;
				} else {
					const role = msg.guild.roles.cache.find(r => r.id == entry);
					if (role) {
						DroleF(role);
						return;
					} else {
						msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 3');
						return;
					}
				}
			} else if (entry.length == 21) {
				if (entry.includes('<#') && entry.includes('>')) {
					let channel = msg.guild.channels.cache.get(entry.replace(/<#/g, '').replace(/>/g, ''));
					DchannelF(channel);
					return;
				} else {
					msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 4');
					return;
				}
			} else if (entry.length == 22) {
				if (entry.includes('<@&') && entry.includes('>')) {
					let role = msg.guild.roles.cache.find(r => r.id == entry.replace(/<@&/g, '').replace(/>/g, ''));
					DroleF(role);
					return;
				} else {
					msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 5');
					return;
				} 
			} else {
				msg.reply('You need to enter a valid id or mention -> `h!antispambypass [ID or mention]` 6');
			}
		}

		function DuserF(user) {
			if (bpusers) {
				if(bpusers.indexOf(user.id) == -1) { return msg.reply('This user is not bypassed.');}
				if (bpusers.length == 1) {
					pool.query(`UPDATE antispamsettings SET bpuserid = null WHERE guildid = '${msg.guild.id}'`);
				} else {
					const index = bpusers.indexOf(user.id);
					if (index > -1) {
						bpusers.splice(index, 1);
					}
					pool.query(`UPDATE antispamsettings SET bpuserid = ARRAY[${bpusers}] WHERE guildid = '${msg.guild.id}'`);
				}
			} else {
				return msg.reply('This channel is not bypassed.');
			}
			Dfinished(user);
		}
		function DchannelF(channel) {
			if (bpchannels) {
				if(bpchannels.indexOf(channel.id) == -1) { return msg.reply('This channel is not bypassed.');}
				if (bpchannels.length == 1) {
					pool.query(`UPDATE antispamsettings SET bpchannelid = null WHERE guildid = '${msg.guild.id}'`);
				} else {
					const index = bpchannels.indexOf(channel.id);
					if (index > -1) {
						bpchannels.splice(index, 1);
					}
					pool.query(`UPDATE antispamsettings SET bpchannelid = ARRAY[${bpchannels}] WHERE guildid = '${msg.guild.id}'`);
				}
			} else {
				return msg.reply('This channel is not bypassed.');
			}
			Dfinished(channel);
		}
		function DroleF(role) {
			if (bproles) {
				if(bproles.indexOf(role.id) == -1) { return msg.reply('This role is not bypassed.');}
				if (bproles.length == 1) {
					pool.query(`UPDATE antispamsettings SET bproleid = null WHERE guildid = '${msg.guild.id}'`);
				} else {
					const index = bproles.indexOf(role.id);
					if (index > -1) {
						bproles.splice(index, 1);
					}
					pool.query(`UPDATE antispamsettings SET bproleid = ARRAY[${bproles}] WHERE guildid = '${msg.guild.id}'`);
				}
			} else {
				return msg.reply('This channel is not bypassed.');
			}
			Dfinished(role);
		}
		function Dfinished(deleted) {
			const embed = new Discord.MessageEmbed()
				.setDescription(`${deleted} is no longer immuene to AntiSpam`)
				.setColor('b0ff00');
			msg.channel.send(embed);
		}
	}};
