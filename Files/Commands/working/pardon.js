const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'pardon',
	Category: 'Moderation',
	requiredPermissions: 4,
	description: 'Pardon a warn from a user',
	usage: 'h!pardon [user ID or meniton] [warn ID] (reason)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.mentions.users.first()){
			pardonFunction(msg, msg.mentions.users.first(), logchannelid);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						pardonFunction(msg, user, logchannelid);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(e=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
					/* eslint-disable */
					let error;
					error = e;
					/* eslint-enable */
				}).catch({});
			} else {
				msg.reply('you need to specify a user.');
			}
		}


		function pardonFunction(msg, user, logchannelid){
			let warns = [];
			let mutes = [];
			let allwarns;
			warns.reasons = [];
			mutes.reasons = [];
			warns.numbers = [];
			mutes.numbers = [];
			pool.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}';`, (err, result) => {
				if (result.rowCount == 0) {allwarns = 0;
					finish(allwarns, warns, mutes, user);
					return;
				}
				if (result.rows[0] == undefined) {allwarns = 0;
					finish(allwarns, warns, mutes, user);
					return;
				}
				if (result.rows[0]) {
					for (let i = 0; i < result.rowCount; i++) {
						if (result.rows[i].type == 'Warn') {
							warns.reasons.push(result.rows[i].reason);
							warns.numbers.push(result.rows[i].warnnr);
						} 
						if (result.rows[i].type == 'Mute') {
							mutes.reasons.push(result.rows[i].reason);
							mutes.numbers.push(result.rows[i].warnnr);
						} 
					}
					finish(warns, mutes, user);
				}
	
			});
			async function finish(warns, mutes, user) {
				if (!args[1]) return msg.reply('Please enter a valid option -> `h!pardon [@mention/UserID] [warn or mute ID] [reason]`');
				let Reason = args.slice(2).join(' ');
				if (!Reason) Reason = 'no reason given';
				let ID = args[1];
				if (isNaN(ID)) return msg.reply('You have to enter an actual Number as punishment ID');
				if (allwarns == 0) return msg.reply('This user doesnt have any warns or mutes.');
				if (warns.amount == 0) return msg.reply('This person does not have any warns.');
				if (warns.numbers.indexOf(ID) !== -1) return msg.reply('This is not a valid ID.');
				DelFunction(warns, user);
				async function DelFunction(warns, user) {
					const res = await pool.query(`SELECT reason FROM warns WHERE warnnr = '${ID}' AND userid = '${user.id}' AND guildid = '${msg.guild.id}';`);
					if (res.rows[0] == undefined) return (msg.reply('This user has no warns'));
					const oldReason = res.rows[0].reason;
					const query = `DELETE FROM warns WHERE warnnr = '${ID}' AND userid = '${user.id}' AND guildid = '${msg.guild.id}';`;
					pool.query(query);
					const replyEmbed = new Discord.MessageEmbed()
						.setDescription(`Pardoned a warn from ${user}`)
						.setTimestamp()
						.setColor('#1aff00');
					msg.channel.send(replyEmbed);
					const dmembed = new Discord.MessageEmbed()
						.setColor('1aff00')
						.setDescription(`One of your warns on **${msg.guild.name}** has been pardoned`)
						.addField('Reason:', oldReason, false)
						.addField('Reason for pardon:', Reason, false);
					user.send(dmembed).catch(() => {});
					var logchannel = client.channels.cache.get(logchannelid);
					const PardonEmbed = new Discord.MessageEmbed()
						.setTitle(`A warn from ${user.username} has been pardoned in `+msg.guild.name)
						.setDescription(`${user}'s warn was pardoned by ${msg.author}`)
						.addField('Reason:', Reason)
						.addField('Punishment Reason:', oldReason)
						.setFooter(`Pardoned user ID: ${user.id}\nExecutor user ID: ${msg.author.id}`)
						.setThumbnail(user.displayAvatarURL())
						.setTimestamp()
						.setColor('#1aff00');
					if (logchannel)logchannel.send(PardonEmbed).catch(() => {});
					const warnrnredo = await pool.query(`SELECT * FROM warns WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
					if (warnrnredo !== undefined) {
						if (warnrnredo.rows[0] !== undefined) {
							for (let i = 0; i < warnrnredo.rowCount; i++) {
								let l = i;
								l++;
								await pool.query(`UPDATE warns SET warnnr = '${l}' WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}' AND dateofwarn = ${warnrnredo.rows[i].dateofwarn}`);
							}
						}
					}
				}
			}}}};