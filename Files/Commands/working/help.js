const Discord = require('discord.js');
module.exports = {
	name: 'help',
	aliases: ['h'],
	DMallowed: 'Yes',
	description: 'Display the help embeds\nView `h!commandhelp [command name]` for more information on specific commands',
	usage: 'h!help (categorie)',
	/* eslint-disable */
	execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		if (msg.channel.id == '298954459172700181'){ setTimeout(() => {
			msg.delete();
		}, 1);
		msg.reply('You are not allowed to request help embeds in this channel.').then(send => { setTimeout(function(){  send.delete().catch(() => {});  }, 10000);  }).catch(() => {});
		return;}
		var cmd2;
		var cmd3;
		try {
			cmd2 = args[0].toLowerCase(); } catch(error) {cmd2 = 'useless';}
		try {
			cmd3 = args[1].toLowerCase(); } catch(error) {cmd3 = 'useless';}
		if(cmd2 == 'logging') {
			const FunHelpEmbed = new Discord.MessageEmbed()
				.setTitle('Logging Help')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Ayako Currently supports 2 Log functions.\n- Message Logging (Message Deletions and Message Edits)\n- Mod Logging (Any Moderator Commands)\n\n To enable these execute the commands \n`h!modlog [channelID]` and `h!messagelog [channelID]`\n\n**Be sure the Bot has permissions to `View Channel` `Send Messages` `Embed Links` and `Attach files` else it wont work properly**\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there')
				.setTimestamp();
			msg.channel.send(FunHelpEmbed).catch(() => {});
		}
		if(cmd2 == 'antispam') {
			const FunHelpEmbed = new Discord.MessageEmbed()
				.setTitle('Ayako Auto AntiSpam')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there')
				.addFields(
					{name: '`antispam [option]`', value:'**enable** or **disable** Ayako antispam'},
					{name: '`antispamsetup`', value:'Guides you through the AntiSpam setup process'},
					{name: '`antispamsettings`', value:'Shows you the current AntiSpam settings'},
					{name: 'Add bypass: `antispambypass [mention or ID]`', value:'Valid IDs or mentions: Roles | Channels | Users'},
					{name: 'Remove bypass: `antispambypass delete [mention or ID]`', value:'Valid IDs or mentions: Roles | Channels | Users'},
				)
				.setTimestamp();
			msg.channel.send(FunHelpEmbed).catch(() => {});
		}
		if(cmd2 == 'fun') {
			if (cmd3 == '1' || cmd3 == 'useless' || !cmd3){ 
				const FunHelpEmbed = new Discord.MessageEmbed()
					.setTitle('Fun Commands (1/2)')
					.setColor('#b0ff00')
					.setURL('https://www.patreon.com/Lars_und_so')
					.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
					.setDescription('Type `h!help fun 2` for the next site\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there')
					.addFields(
						{ name: '<a:Pat:727163844727668846>`pat [@mention]`', value:'Pat someone', inline: true },
						{ name: '<:AMayakohugme:759041720255119402>`hug [@mention]`', value:'Hug someone', inline: true },
						{ name: '<a:Cuddle:727163917478133851>`cuddle [@mention]`', value:'Cuddle someone', inline: true },
						{ name: '<a:Poke:727163942383779880>`poke [@mention]`', value:'Poke someone', inline: true },
						{ name: '<a:Nom:727163968145063956>`nom [@mention]`', value:'Nom someone', inline: true },
						{ name: '<a:Lick:727163996083322952>`lick [@mention]`', value:'Lick someone', inline: true },
						{ name: '<a:Slap:727164033215627365>`slap [@mention]`', value:'Slap someone', inline: true },
						{ name: '<:Stare:727164059635548171>`stare [@mention]`', value:'Stare at someone', inline: true },
						{ name: '<:Kill:727164093722787840>`kill [@mention]`', value:'Kill someone', inline: true },
						{ name: '<a:Kiss:727164121438617603>`kiss [@mention]`', value:'Kiss someone', inline: true },
						{ name: '<a:Bloodsuck:727164145807523872>`bloodsuck [@mention]`', value:'Suck someones blood', inline: true },
						{ name: '<a:Peck:727164188383772775>`peck [@mention]`', value:'Peck someones cheek', inline: true },
						{ name: '<:AMayakopout:759041750341386260>`pout [@mention]`', value:'Pout at someone', inline: true },
						{ name: '<:Lewd:727164287360958594>`lewd [@mention]`', value:'Lewd someone', inline: true },
						{ name: '<:Sleep:727164309926445066>`thighsleep [@mention]`', value:'Sleep on someones thighs', inline: true },
						{ name: '<:AMayakopeek:758872110067351562>`peek`', value:'Peek into chat', inline: true },
						{ name: '<a:Holdhands:727164354042003537>`holdhands [@mention]`', value:'Hold someones hand', inline: true },
						{ name: '<a:Bite:727164391870431253>`bite [@mention]`', value:'Bite someone', inline: true },
						{ name: '<a:Tickle:727164491669700699>`tickle [@mention]`', value:'Tickle someone', inline: true },
						{ name: '<:AMayakosmug:759041773154336810>`smile [@mention]`', value:'Smile at someone', inline: true },
						{ name: '<:AMayakoAwoo:792053097861349376>`awoo`', value:'Awoo at someone or without a reason', inline: true },
						{ name: '<a:Blush:727164712239890453>`blush`', value:'Blush because of someone', inline: true },
						{ name: '<a:Yeet:727164601585762405> `yeet [@mention]`', value:'Yeet someone away', inline: true },
					)
					.setTimestamp();
				msg.channel.send(FunHelpEmbed).catch(() => {});
			} else if (cmd3 == '2') {
				const FunHelpEmbed = new Discord.MessageEmbed()
					.setTitle('Fun Commands (2/2)')
					.setColor('#b0ff00')
					.setURL('https://www.patreon.com/Lars_und_so')
					.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
					.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
					.addFields(
						{ name: '<a:Tsundere:727164626575556679>`tsundere`', value:'Get a random tsundere quote', inline: true },
						{ name: '<a:sleep:729173424018030592>`sleep [@mention]`', value:'Sleep with someone', inline: true },
						{ name: '<:araara:730102135827595325>`araara [@mention]`', value:'Ara Ara someone', inline: true },
						{ name: '<a:Dance:731666710083534899>`dance [@mention]`', value:'Dance with someone', inline: true },
						{ name: '<a:Cry:748532614524174466>`cry [@mention]`', value:'Cry at someone', inline: true },
						{ name: '<a:highfive:734414955390173295>`highfive [@mention]`', value:'Highfive someone', inline: true },
						{ name: '<a:Scream:776088095917342731>`scream [@mention]`', value:'Scream at someone', inline: true },
						{ name: '<a:Shake:776096509497835541>`shake [@mention]`', value:'Shake someone', inline: true },
						{ name: '<a:Wave:775409859339747349>`wave [@mention]`', value:'Wave at someone', inline: true },
						{ name: '<:Ayaya:825770214477529118>`ayaya`', value:'Ayaya:tm:!', inline: true },
						{ name: '`snipe`', value:'Snipes the last deleted message', inline: true },
						{ name: '`esnipe`', value:'Snipes the last edited message', inline: true },
						{ name: '`spanking [option]`', value:'enables/disables spanking', inline: true },
						{ name: '`8ball [question]`', value:'Let 8ball decide your fate', inline: true },
						{ name: '`neko`', value:'Get a random Neko image', inline: true },
					)
					.setTimestamp();
				msg.channel.send(FunHelpEmbed).catch(() => {});
			}
		}
		if (cmd2 == 'info') {
			const infoHelpEmbed = new Discord.MessageEmbed()
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setTitle('Info Commands (1/1)')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`ping`', value:'Calculates the latency between you and the bot', inline: true },
					{ name: '`uptime`', value:'Shows the time since the bots last restart.', inline: true },
					{ name: '`info`', value:'Shows various informations about the Bot', inline: true },
					{ name: '`​​membercount`', value:'Displays the membercount of the guild', inline: true },
					{ name: '`serverinfo`', value:'Shows various informations about the server', inline: true },
					{ name: '`avatar [@mention/ID]`', value:'Shows the avatar of the user', inline: true },
					{ name: '`userinfo [@mention/ID]`', value:'Shows various informations about a member', inline: true },
					{ name: '`test`', value:'Tests the bots functionality', inline: true },
					{ name: '`time`', value:'Displays the current UTC/GMT time', inline: true },
					{ name: '`execute`', value:'Used for bot debugging', inline: true },
					{ name: '`workload`', value:'Displays current bot workload on the hosts system', inline: true },
					{ name: '⏲️`reminder [option] [text or ID]`', value:'Make me remind you after a given amount of time or delete your reminder ```Duration input examples (you can choose any amount you want): \n1s = 1 second    |    5m = 5 minutes     |    2h = 2 hours\n5d = 5 days```', inline: false },
					{ name: '`reminders`', value:'Display all your reminders, their text, when they end, where you set them and their ID', inline: true },
					{ name: '`roleinfo [role ID]`', value:'Display various information about a role', inline: true },
					{ name: '`inrole`', value:'Lists all members with a role.', inline: true },
					{ name: '`categories`', value:'Lists all commands sorted by categories.', inline: true },
					{ name: '`enlarge [emote]`', value:'Enlarges the emote you enter and shows the link to it', inline: true },
					{ name: '`afk`', value:'set an AFK which will be displayed every time you get mentioned', inline: true },
				)
				.setTimestamp();
			msg.channel.send(infoHelpEmbed).catch(() => {});
		}
		if (cmd2 == 'mod') {
			const modHelpEmbed = new Discord.MessageEmbed()
				.setTitle('Modding Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`staffguide`', value:'Easy Mod guide, perfect for introducing new people to Ayako Moderation', inline: false },
					{ name: '\u200b', value:'\u200b', inline: false },
					{ name: '`ban [ID/@mention] [Reason]`', value:'Bans the user from the guild', inline: true },
					{ name: '`massban [IDs/@mentions seperated by spaces] [Reason]`', value:'Ban as many members from your server as the character limit allows you to', inline: true },
					{ name: '`​​unban [ID/@mention]`', value:'Unbans the users from the guild', inline: true },
					{ name: '`kick [ID/@mention] [Reason]`', value:'Kicks the user from the guild', inline: true },
					{ name: '`mute [@mention/ID] [Reason]`', value:'Permanently mutes the user', inline: true },
					{ name: '`unmute [@mention/ID]`', value:'Unmutes the user', inline: true },
					{ name: '`​​clear [amount]` or\n`clear [@mention] [amount]`', value:'Deletes an amount of messages from a channel', inline: true },
					{ name: '`announce [channelID or mention] [Message]`', value:'Sends an announcement in the given channel', inline: true },
					{ name: '`check`', value: 'Displays all warns and mutes of a member and their ID\'s', inline: true },
					{ name: '`warninfo [user ID or mention] [warn ID]`', value: 'Displays additional information of a warn', inline: true },
					{ name: '`tempmute [@mention/ID] [Duration] [Reason]`', value:'Tempmutes the user```Duration input examples (you can choose any amount you want): \n1s = 1 second    |    5m = 5 minutes     |    2h = 2 hours\n5d = 5 days      |    1y = 1 year```'},
					{ name: '`pardon [@mention/ID] [warn/mute ID] [reason]`', value: 'Pardon warns and mutes off a user\nWarn and Mute IDs are requestable in the `h!check` command', inline: true },
					{ name: '`clearwarns [@mention/ID]`', value: 'Deletes __ALL__ warns of a User', inline: true },
					{ name: '`edit [@mention/ID] [warn/mute ID] [edit]`', value: 'Lets you edit a warn/mute reason from a user\nWarn and Mute IDs are requestable in the `h!check` command', inline: true },
					{ name: '`muterole [role ID]`', value: 'Lets you set a custom Muterole', inline: true },
					{ name: '`customembed [channel ID or mention]`', value: 'Guides you through an Embed setup process', inline: true },
					{ name: '`slowmode {channel ID or mention} [time in seconds]`', value: 'Applies a slowmode to a channel (if no channel ID or mention is provided it will apply the cooldown to the channel the command was executed in', inline: true },
					{ name: '`softwarn [user ID or mention] [reason]`', value: 'Softwarn a user', inline: true },
				)
				.setTimestamp();
			msg.channel.send(modHelpEmbed).catch(() => {});
		}
		if (cmd2 == 'spez' && msg.guild.id == '298954459172700181') {
			const HelpEmbedAni = new Discord.MessageEmbed()
				.setTitle('Server Specific Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`xban [ID/@mention] [Reason]`', value:'Bans the user from __Animekos__ and __Victorias Wonderland__', inline: true },
					{ name: '`leaderboard [amount]`', value: 'Shows the Server message leaderboard since last reset', inline: false },
					{ name: '`msgs`', value: 'Displays how many messages you sent since last reset', inline: false },
					{ name: '`leaderboardreset`', value: 'Resets the message leaderboard', inline: true },
					{ name: '`msgs`', value: 'Displays how many messages you sent since last reset', inline: false },
					{ name: '`bypass`', value: 'Bypasses a member and assings the <@&389470002992119810> role to them', inline: false },
					{ name: '`curseme`', value: 'Sends a cursed message', inline: true },
					{ name: '`emotes`', value: 'Short guide on how to get Global Emotes', inline: true },
					{ name: '<:question:727161922352316537>`question [question]`', value:'Ask a question in <#715136490526474261>', inline: true },
					{ name: '`shop`', value: 'Shows the upgraded role shop', inline: true },
					{ name: '`shoob`', value: 'Shows the Shoob roles', inline: true },
					{ name: '`shoobtop`', value: 'Shows the Shoob roles', inline: true },
					{ name: '`shoobs`', value: 'Displays the amount of cards you claimed so far', inline: true },
					{ name: '`boostertop`', value: 'Displays the top boosters', inline: true },
					{ name: '`boosting [ID/mention]`', value: 'Displays how long a member has been boosting', inline: true }
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbedAni).catch(() => {});
		}
		if (cmd2 == 'spez' && msg.guild.id == '692452151112368218') {
			const HelpEmbedTA = new Discord.MessageEmbed()
				.setTitle('Server Specific Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`inv [user]`', value: 'Sends a invite vote in <#747820337361846354>', inline: false },    
					{ name: '`promotion [option] [user]`', value: 'Sends a promotion vote in the given channel\n**Avaliable options:** `net` for <#746668871611842621> | `gold` for <#747820337361846354>', inline: false },
					{ name: '`rate [user]`', value: 'Sends a player rate vote in <#746665867567300679>', inline: false },
					{ name: '`briefing`', value: 'Send a briefing message in <#751501958464012509>', inline: false },

				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbedTA).catch(() => {});
		}
		if (cmd2 == 'spez' && msg.guild.id !== '692452151112368218' && msg.guild.id !== '298954459172700181') {
			const HelpEmbedeveryotherserver = new Discord.MessageEmbed()
				.setTitle('Server Specific Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: 'OHNO', value: 'Your server **does not have any special commands**!\nChange that __now__!\n Visit https://www.patreon.com/Lars_und_so \nto support the bot and get __special commands **just for your server**__', inline: true },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbedeveryotherserver).catch(() => {});
		}
		if (cmd2 == 'owner') {
			const HelpEmbedTA = new Discord.MessageEmbed()
				.setTitle('Owner only Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`contactban`', value: 'Bans a user from sending contact requests with `h!contact`', inline: true },
					{ name: '`delemote [name]`', value: 'Deltes an emoji from the guild it is executed in', inline: true },
					{ name: '`eval [.js code]`', value: 'Evaluates the given code', inline: true },
					{ name: '`execute`', value: 'Used for debugging, executable by everyone', inline: true },
					{ name: '`reload [command]`', value: 'Reloads a command', inline: true },
					{ name: '`restart`', value: 'Restarts the bot', inline: true },
					{ name: '`tta`', value: 'Adds something to the owners to-do list', inline: true },
					{ name: '`startsupport [server ID]`', value: 'Creates a Invite to the server with matching ID for support, as well as announces the support start in the server', inline: true },
					{ name: '`endsupport [Invite Code]`', value: 'Deletes the Invite and removes the Ayako staff from the server', inline: true },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbedTA).catch(() => {});
		}
		if (cmd2 == 'utility') {
			const Roles = new Discord.MessageEmbed()
				.setTitle('Utility Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`addrole [Hex Color Code] [Role Name]`', value: 'Adds a Role to the Server with standard permissions', inline: false },
					{ name: '`selfroleadd [role ID,  mention or name]`', value: 'Makes a role self assignable', inline: false },
					{ name: '`selfroleremove [role ID,  mention or name]`', value: 'Removes a role from being self assignable', inline: false },
					{ name: '`iam [role ID,  mention or name]`', value: 'Assings a selfrole', inline: true },
					{ name: '`iamn [role ID,  mention or name]`', value: 'Removes a selfrole', inline: true },
					{ name: '`suggestchannel [channel ID or mention]`', value: 'Set a suggestion channel for your server', inline: false },
					{ name: '`suggest [text]`', value: 'Send a suggestion to the suggestion channel', inline: true },
					{ name: '`suggestblacklist add/remove [user ID or mention]`', value: 'Blacklist users from sending suggestions', inline: false },
					{ name: '`rrcreate`', value: 'Guides you through a Reaction Role setup', inline: true },
					{ name: '`rrlist`', value: 'Lists all Reaction Role messages of your server', inline: true },
					{ name: '`disboard`', value: 'DISBOARD bump reminders', inline: true },
					{ name: '`getemote [Name] [link]`', value: 'Steals an emoji', inline: true },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(Roles).catch(() => {});
		}
		if (cmd2 == 'welcome') {
			const Roles = new Discord.MessageEmbed()
				.setTitle('Welcome Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`welcomechannel [Hex Color Code] [Channel] [Ping?  yes/no]`', value: 'Sets the channel you mention as welcome channel\nThe given hex color will be used upon every join (You can also use `Random` for that) \nPings the User that joined if `yes`\n- You can also do `h!welcomechannel disable` to disable the welcome messages', inline: false },
					{ name: '`welcomemessage [message]`', value: 'The Message new Members will be greeted with\nUse `{user}` to mention the user that joined in the message\nChannels, Roles and other Members can be mentioned normally\nIf you dont set a custom Message the standard Message will be used', inline: false },
					{ name: '`welcomeimage [image URL of gif URL]`', value: 'Set the Image or Gif that will be shown upon join\nYou have to use a Link for this, can be a gif or an Image\n**Important:** Do not use Tenor gifs, those will not work', inline: false },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(Roles).catch(() => {});
		}
		if (cmd2 == 'setup') {
			const HelpEmbedTA = new Discord.MessageEmbed()
				.setTitle('Setup Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`prefix`', value: 'Lets you set your own server prefix', inline: true },
					{ name: '`muterole [role ID]`', value: 'Lets you set a custom Muterole', inline: true },
					{ name: '<:Log:745510245949767740>`help logging`', value: 'List of commands used for Ayako logging', inline: true },
					{ name: '<:SPAM:700771901168943811>`help antispam`', value: 'List of commands used for AntiSpam', inline: true },
					{ name: '<a:Boost3:748294201447284777>`help nitro`', value: 'List of commands used for Monitoring Nitro Boosters', inline: true },
					{ name: '`interactionsmode`', value: 'Lets you decide if you want big or small interactions for your server', inline: true },
					{ name: '\u200b', value: '\u200b', inline: false},
					{ name: 'Moderation Roles', value: '\u200b', inline: false},
					{ name: '`trialmodrole`', value: 'Members with this role can use specific commands even when missing the required permission', inline: true },
					{ name: '`modrole`', value: 'Members with this role can use specific commands even when missing the required permission', inline: true },
					{ name: '`adminrole`', value: 'Members with this role can use specific commands even when missing the required permission', inline: true },
					{ name: '`setperms [trial/mod/admin] [permission] [allow/deny]`', value: 'Define what commands a Moderation role can use. \n**Server permissions will always overwrite role permissions** Meaning: If the role does not allows a member to use the ban command, but the member does have "Ban Members" permission, they can still use the `h!ban` command.\n```Valid permission names:\nban | unban | mute | tempmute | unmute | edit | pardon | warn | clear | announce | kick```', inline: false},
					{ name: '`trialmodperms`', value: 'Displays the current TrialModRole permissions', inline: true },
					{ name: '`modperms`', value: 'Displays the current ModRole permissions', inline: true },
					{ name: '`adminperms`', value: 'Displays the current AdminRole permissions', inline: true },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbedTA).catch(() => {});
		}
		if (cmd2 == 'giveaway') {
			const HelpEmbedTA = new Discord.MessageEmbed()
				.setTitle('Giveaway Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`giveaway`', value: 'Guides you step by step through a giveaway setup (supports server and role requirements)', inline: true },
					{ name: '`giveawayreroll [message ID]`', value: 'Rerolls the Giveaway with matching ID', inline: true },
					{ name: '`giveawaydelete [message ID]`', value: 'Deletes the Giveaway with matching ID', inline: true },
					{ name: '`giveawayedit [message ID]`', value: 'Edit a Giveaway', inline: true },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbedTA).catch(() => {});
		}
		if (cmd2 == 'settings') {
			const SettingsEmbed = new Discord.MessageEmbed()
				.setTitle('Settings Commands (1/1)')
				.setColor('b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`prefix`', value: 'Lets you set your own server prefix', inline: true },
					{ name: '`muterole [role ID]`', value: 'Lets you set a custom Muterole', inline: true },
					{ name: '<:Log:745510245949767740>`help logging`', value: 'List of commands used for Ayako logging', inline: true },
					{ name: '<:SPAM:700771901168943811>`help antispam`', value: 'List of commands used for AntiSpam', inline: true },
					{ name: '<a:Boost3:748294201447284777>`help nitro`', value: 'List of commands used for Monitoring Nitro Boosters', inline: true },
					{ name: '`interactionsmode`', value: 'Lets you decide if you want big <:Big:756380855395549256> or small <:Small2:756379369739386910><:Small1:756379345190387712> interactions for your server', inline: true },
					{ name: '`setcooldown [command name] [channel/server] [cooldown in seconds]`', value: 'Set custom cooldowns for your server or a specific channel\nCooldown format example: `20s`', inline: false },
					{ name: '`settings [disable/enable] [command category]`', value: 'Disables or Enables a command category', inline: false },
					{ name: '`help welcome`', value: 'Give new members a warm welcome with custom Image and Text' },
					{ name: '\u200b', value: '**Moderation Roles**', inline: false},
					{ name: '`trialmodrole`', value: 'Members with this role can use specific commands even when missing the required permission', inline: true },
					{ name: '`modrole`', value: 'Members with this role can use specific commands even when missing the required permission', inline: true },
					{ name: '`adminrole`', value: 'Members with this role can use specific commands even when missing the required permission', inline: true },
					{ name: '`setperms [trial/mod/admin] [permission] [allow/deny]`', value: 'Define what commands a Moderation role can use. \n**Server permissions will always overwrite role permissions** Meaning: If the role does not allows a member to use the ban command, but the member does have "Ban Members" permission, they can still use the `h!ban` command.\n```Valid permission names:\nban | unban | mute | tempmute | unmute | edit | pardon | warn | clear | announce | kick```', inline: false},
					{ name: '`trialmodperms`', value: 'Displays the current TrialModRole permissions', inline: true },
					{ name: '`modperms`', value: 'Displays the current ModRole permissions', inline: true },
					{ name: '`adminperms`', value: 'Displays the current AdminRole permissions', inline: true },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(SettingsEmbed).catch(() => {});
		}
		if (cmd2 == 'nitro') {
			const NitroEmbed = new Discord.MessageEmbed()
				.setTitle('Nitro Commands (1/1)')
				.setColor('b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`nitrosetup`', value: 'A 2 step command to setup Nitro Monitoring on your server', inline: false},
					{ name: '`nitrosettings`', value: 'Display your servers Nitro Settings', inline: false},
					{ name: '`nitrorole [role ID or mention] [days]`', value: 'A role your members will be given once boosted for longer than the given amount of days', inline: false},
					{ name: '`boostertop`', value: 'Leaderboard of your Servers Booster sorted by days', inline: false},
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(NitroEmbed).catch(() => {});
		}
		if (cmd2 == 'leveling') {
			const NitroEmbed = new Discord.MessageEmbed()
				.setTitle('Nitro Commands (1/1)')
				.setColor('b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`rank`', value: 'Displays your current rank', inline: false},
					{ name: '`levels`', value: 'Displays the servers leaderboard', inline: false},
					{ name: '`globallevels`', value: 'Displays the global leaderboard', inline: false},
					{ name: '`leveling`', value: 'Edit the levelsettings of your server', inline: false},
					{ name: '`levelrole [role ID or mention] [amount of levels needed]`', value: 'Set Levelroles members receive upon getting a certain level', inline: false},
					{ name: '`levelrole delete [role ID]`', value: 'Delete a role from the levelroles', inline: false},
					{ name: '`levelsettings`', value: 'Leaderboard of your Servers Booster sorted by days', inline: false},

				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(NitroEmbed).catch(() => {});
		}
		if (cmd2 == 'blacklist') {
			const NitroEmbed = new Discord.MessageEmbed()
				.setTitle('Nitro Commands (1/1)')
				.setColor('b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`blacklistsetup`', value: 'A guide through the Blacklist setup', inline: false},
					{ name: '`blacklist`', value: 'Display current settings', inline: false},
					{ name: '`blacklist add [word]`', value: 'Add a word to the blacklist', inline: false},
					{ name: '`blacklist remove [word]`', value: 'Remove a word from the blacklist', inline: false},
					{ name: '`boosting (user ID or mention)`', value: 'Show the current amount of days boosting of a user or yourself', inline: false},

				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(NitroEmbed).catch(() => {});
		}
		if (cmd2 == 'useless') {
			const HelpEmbed = new Discord.MessageEmbed()
				.setTitle('Commands (1/1)')
				.setColor('#b0ff00')
				.setURL('https://www.patreon.com/Lars_und_so')
				.setAuthor('Ayako Help [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setDescription('Prefix: `h!`\n**Important** Exclude `[ ]` from your command, those are just signs to tell you that you need to insert something there\n\nNeed help? Join the official Support server [click me](https://discord.gg/GNpcspBbDr)\nWant to invite me to your server? [click me](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot)')
				.addFields(
					{ name: '`h!commandhelp`', value: 'Display details of a specific Command'},
					{ name: '🛠️`help setup`', value:'Best commands to start setting up Ayako for your server', inline: true },
					{ name: '<:Settings:781982956138659880>`help settings`', value:'Settings about how the bot works on your server', inline: true },
					{ name: 'ℹ️`help info`', value:'Shows various information commands', inline: true },
					{ name: '<a:Fun:745509849399427102>`help fun`', value:'Shows various fun commands', inline: true },
					{ name: '<:Mod:745509995633967134>`help mod`', value:'Shows various modding commands', inline: true },
					{ name: '🎉`help giveaway`', value:'Shows various giveaway commands', inline: true },
					{ name: '`help utiliy`', value:'Everything about Roles, Selfroles and other helpful utility stuff', inline: true },
					{ name: '`help leveling`', value:'Everything about Levels, Levelsettings and LevelRoles ', inline: true },
					{ name: '`help blacklist`', value:'Setting up the Blacklist and adding words', inline: true },
					{ name: '\u200B', value: '\u200B' },
					{ name: '`help spez`', value: 'Shows server specific commands', inline: true },
					{ name: '`help owner`', value: 'Shows commands which are only useful/usable for the bot owner', inline: true },
					{ name: '`vote`', value:'Vote for Ayako.', inline: true },
					{ name: '<:Invite:745510133991342111>`invite`', value:'Invite Ayako to your server'},
					{ name: '\u200B', value: '\u200B' },
					{ name: '🗨️`contact`', value: 'Have a cool idea or a problem? Use this command to send a message directly to the bot owner.' },
				)
				.setFooter('Visit https://www.patreon.com/Lars_und_so to support the bot')
				.setTimestamp();
			msg.channel.send(HelpEmbed).catch(() => {});
		}
	}};

