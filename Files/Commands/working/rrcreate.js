
const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'rrcreate',
	Category: 'Selfroles',
	requiredPermissions: 3,
	description: 'Start a reaction role setup',
	usage: 'h!rrcreate',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		let channel;
		let Description;
		let roles = [];
		let emotes = [];
		let emotenames = [];
		const embed = new Discord.MessageEmbed()
			.setAuthor('Ayako Reaction Role Setup', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
			.setFooter('Type |cancel| anytime to abort the setup')
			.setColor('b0ff00');
		start();
		function start() {
			embed.setDescription('First off, choose a Channel in which you want the reaction role embed to be in.\n Valid Input: Channel ID and Channel Mention');
			send(embed);
			awaitChannel();
		}
		async function awaitChannel() {
			const rawcollected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id,{max: 1, time: 120000});
			if (!rawcollected.first()) return send('Time ran out, start over if you still want your reaction roles');
			let rawchannel = rawcollected.first().content;
			if (rawchannel.toLowerCase() == 'cancel') {
				msg.reply('Okay, aborted').catch(() => {});
				return;
			}
			channel = client.channels.cache.get(rawcollected);
			if (!channel || !channel.id) {
				channel = client.channels.cache.get(rawchannel.replace(/<#/g, '').replace(/>/g, ''));
			}
			if (!channel || !channel.id) {
				msg.reply('That channel doesnt exist or I cant view it, please update the settings or enter a valid channel').catch(() => {});
				awaitChannel();
				return;
			}
			if (channel.guild.id !== msg.guild.id) {
				msg.reply('You cant create reaction roles outside of this server, try again').catch(() => {});
				awaitChannel();
				return;
			}
			embed.setDescription('Next, choose a Description.\nIt is recommended to show what reaction gives what role');
			send(embed);
			awaitDesc();
		}
		async function awaitDesc() {
			const rawcollected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id,{max: 1, time: 120000});
			if (!rawcollected.first()) return send('Time ran out, start over if you still want your reaction roles');
			Description = rawcollected.first().content;
			embed.setDescription(`Great, lastly I need to know what reaction gives what role, to do that send an emote and role in one message. \nValid role inputs are Role Name, Role ID and Role Mention\nExample:\n <:AMayakoLove:792822369563181067> ${msg.guild.member(client.user).roles.highest}\n<:AMayakopeek:758872110067351562> ${msg.guild.member(client.user).roles.highest.name}\n<:AyakoSmugGiggle:762021980420833341> ${msg.guild.member(client.user).roles.highest.id}\n\nWrite \`Done\` when you're done!`);
			send(embed);
			awaitRoles();
		}
		let i = 0;
		async function awaitRoles() {
			const rawcollected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id,{max: 1, time: 120000});
			if (!rawcollected.first()) return send('Time ran out, start over if you still want your reaction roles');
			const collected = rawcollected.first().content;
			if (collected.toLowerCase() == 'cancel') {
				msg.reply('Okay, aborted').catch(() => {});
				return;
			}
			if (collected.toLowerCase() == 'done') {
				if (i == 0) {
					msg.reply('You havent entered any roles yet. Please do that before proceeding').catch(() => {});
					awaitRoles();
					return;
				} else {
					msg.reply('Awesome! Your Reaction Role Embed is done.').catch(() => {});
					done();
				}
			} else {
				const arg = collected.split(/ +/);
				if (!arg[0] || !arg[1]) {
					msg.reply('You need to enter an emote and a role').catch(() => {});
					awaitRoles();
					return;
				}
				const isUnicode = containsNonLatinCodepoints(arg[0]);
				let emote;
				if (!isUnicode && isNaN(arg[0])) {
					emote = Discord.Util.parseEmoji(arg[0]);
				} else {
					emote = arg[0];
				}
				let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == arg.slice(1).join(' ').toLowerCase());
				if (!role || !role.id) {
					const rawrole = arg[1].replace(/<@&/g, '').replace(/>/g, '').toLowerCase();
					role = msg.guild.roles.cache.find(r => r.id == rawrole);
				}
				if (!role || !role.id) {
					rawcollected.first().react('746392936807268474').catch(() => {});
					awaitRoles();
					return;
				} else {
					if (+msg.guild.member(client.user).roles.highest.rawPosition < +role.rawPosition || +msg.guild.member(client.user).roles.highest.rawPosition == +role.rawPosition) {
						msg.reply('I cant add this role to users, please list my role above this role on the server role list or use another role.').catch(() => {});
						awaitRoles();
						return;
					}
					rawcollected.first().react('670163913370894346').catch(() => {});
					if (!isUnicode && isNaN(emote)) {
						rawcollected.first().react(emote.id).catch(() => {});
					}
					i++;
					roles.push(role.id);
					if (!isUnicode  && isNaN(emote)) {
						emotes.push(emote.id);
						emotenames.push(emote.name);
					} else {
						emotes.push(emote);
						emotenames.push(emote);
					}
					if (i == 20) {
						msg.reply('You have reached maximum reaction (20). I cant add more reactions to a message. If you want to add more roles make a second embed.').catch(() => {});
						done();
						return;
					} else {
						awaitRoles();
						return;
					}

				}
			}
		}
		async function done() {  
			const ReactionEmbed = new Discord.MessageEmbed()
				.setDescription(Description)
				.setColor('b0ff00')
				.setAuthor('Ayako Reaction Roles', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
			const m = await channel.send(ReactionEmbed).catch(() => {});
			const failed = [];
			for (let i = 0; i < emotes.length; i++) {
				if (m && m.id) {
					await m.react(emotes[i]).catch(() => {
						failed.push(emotenames[i]);
					});
				}
			}
			setTimeout(() => {
				if (failed.length !== 0) {
					const fail = new Discord.MessageEmbed()
						.setDescription(`I failed to Add these reactions to the Role Reaction Embed since \n__I either dont have permissions to add reactions__ or \n__I dont have access to these emotes__: \n\`\`\`${failed.join('\n')}\`\`\`\nYou will have to react with these manually, **the role assignment will still work**`)
						.setColor('ff0000')
						.setAuthor('Failed to add Reactions | Need help? Click here', 'https://ayakobot.com', 'https://discord.gg/VWvGvgW9S3');
					send(fail);
				}
			}, 1000*+i);
			let query = '';
			if (+emotes.length == +roles.length) {
				for (let i = 0; i < emotes.length; i++) {
					query += `INSERT INTO reactionroles (guildid, channelid, msgid, emoteid, roleid) VALUES ('${msg.guild.id}', '${channel.id}', '${m.id}', '${emotes[i]}', '${roles[i]}');`;
				}
				pool.query(query);
			}
		}
		async function send(text) {
			const m = await msg.channel.send(text).catch(() => {});
			return m;
		}
		function containsNonLatinCodepoints(s) {
			/* eslint-disable */
			return /[^\u0000-\u00ff]/.test(s);
			/* eslint-enable */
		}
	}
};