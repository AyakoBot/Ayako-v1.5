const Discord = require('discord.js');
module.exports = {
	name: 'serverinfo',
	Category: 'Info',
	aliases: ['guildinfo'],
	description: 'Shows a lot of information about the server',
	usage: 'h!serverinfo (server ID)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if(args[0]){
			client.guilds.fetch(args[0]).then(guild => {
				if(guild && guild.id){
					serverinfoFunction(guild, errorchannelID);
				}else{
					msg.reply('this guild doesn\'t exist or I\'m not a part of it, be sure to provide a valid guild ID and be sure I\'m a member of this guild. Error code 1');
				}
			}).catch(()=>{
				msg.reply('this guild doesn\'t exist or I\'m not a part of it, be sure to provide a valid guild ID and be sure I\'m a member of this guild. Error code 2');
			}).catch({});
		} else {
			let guild = msg.guild;
			serverinfoFunction(guild, errorchannelID);
		}
		async function serverinfoFunction(guild){
			var Owner = guild.owner;
			var Region = guild.region;
			var AllChannels = guild.channels.cache.filter((c) => c.type !== 'category').size;
			var AllTextChannels = guild.channels.cache.filter((c) => c.type === 'text').size;
			var AllVoiceChannels = guild.channels.cache.filter((c) => c.type === 'voice').size;
			var members = guild.memberCount;
			var Humans = guild.members.cache.filter(member => !member.user.bot).size;
			var Bots = guild.members.cache.filter(member => member.user.bot).size;
			var creationDate = guild.createdAt.toLocaleString();
			var shardID = guild.shardID;
			var large = guild.large;
			var features = guild.features;
			var afkTimeout = guild.afkTimeout;
			var afkChannel = guild.afkChannel;
			var SyschannelID = guild.systemChannelID;
			var BoostTier = guild.premiumTier;
			var boosters = guild.premiumSubscriptionCount;
			var verificationlevel = guild.verificationLevel;
			var contentfilter = guild.explicitContentFilter;
			var rulesChannelID = guild.rulesChannelID;
			var publicUpdatesChannelID = guild.publicUpdatesChannelID;
			var vanityURLcode = guild.vanityURLCode;
			// var mfaLevel = guild.mfaLevel;
			var RoleCount = guild.roles.cache.size;
			var EmojiCount = guild.emojis.cache.size;
			var maxMembers = guild.maximumMembers;
					
			let verificationleveltext = 'NONE';
			if (verificationlevel == 'NONE') {verificationleveltext = '<:ModNone:748289852105031770> None';}
			if (verificationlevel == 'LOW') {verificationleveltext = '<:ModLow:748290128627367977> Low';}
			if (verificationlevel == 'MEDIUM') {verificationleveltext = '<:ModMedium:748290059429609513>  Medium';}
			if (verificationlevel == 'HIGH') {verificationleveltext = '<:ModHigh:748290001950736606>  High';}
			if (verificationlevel == 'HIGHEST') {verificationleveltext = '<:ModHighest:748289925996347455> Highest';}
			if (features == '') {features = 'None';}
			if (BoostTier == '0') {BoostTier = '<:Boost0:748295210567598211> 0';}
			if (BoostTier == '1') {BoostTier = '<:Boost1:748294124150718494> 1';}
			if (BoostTier == '2') {BoostTier = '<:Boost2:748294169419841676> 2';}
			if (BoostTier == '3') {BoostTier = '<a:Boost3:748294201447284777> 3';}
			if (boosters > 29) {boosters = `<a:Boost3:748294201447284777> ${boosters}`;}
			if (boosters > 14) {boosters = `<:Boost2:748294169419841676> ${boosters}`;}
			if (boosters > 1) {boosters = `<:Boost1:748294124150718494> ${boosters}`;}
			if (boosters < 2) {boosters = `<:Boost0:748295210567598211> ${boosters}`;}
			var contentfiltertext = `${contentfilter}`;
			if (contentfiltertext == 'DISABLED') {contentfilter = '<:ModNone:748289852105031770> Disabled';}
			if (contentfiltertext == 'MEMBERS_WITHOUT_ROLES') {contentfilter = '<:ModMedium:748290059429609513> Members without roles';}
			if (contentfiltertext == 'ALL_MEMBERS') {contentfilter = '<:ModHighest:748289925996347455> All Members';}
			var vanityURLcodetext = `${vanityURLcode}`;
			if (vanityURLcodetext == 'null') {vanityURLcode = 'Not set';}
			var afkChanneltext = `${afkChannel}`;
			if (afkChanneltext == 'null') {afkChannel = 'Not set';}
			var afkTimeouttext = `${afkTimeout}`;
			if (afkTimeouttext == '0') {afkTimeout = 'Not set';}
			var SyschannelIDtext = `${SyschannelID}`;
			var rulesChannelIDtext = `${rulesChannelID}`;
			var publicUpdatesChannelIDtext = `${publicUpdatesChannelID}`;
			if (SyschannelIDtext == 'null') {SyschannelID = 'Not set';} else {const syschannel2 = client.channels.cache.get(SyschannelID); SyschannelID = `${syschannel2}\n${syschannel2.name}`;}
			if (rulesChannelIDtext == 'null') {rulesChannelID = 'Not set';} else {const rulesChannelIDtext2 = client.channels.cache.get(rulesChannelID); rulesChannelID = `${rulesChannelIDtext2}\n${rulesChannelIDtext2.name}`;}
			if (publicUpdatesChannelIDtext == 'null') {publicUpdatesChannelID = 'Not set';} else {const publicUpdatesChannelIDtext2 = client.channels.cache.get(publicUpdatesChannelID); publicUpdatesChannelID = `${publicUpdatesChannelIDtext2}\n${publicUpdatesChannelIDtext2.name}`;}
			var featurestext = `${features}`;
			const feature = featurestext.replace(/,/g, ' 💠 ');


			var ServerInfoEmbed = new Discord.MessageEmbed()
				.setTitle(`Server info of ${guild.name}`)
				.setThumbnail(guild.iconURL({
					dynamic: true,
					size: 512,
					format: 'png'
				}))
				.addFields (
					{ name: '|Owner:\u200B', value:`${Owner}\u200B`, inline: true },
					{ name: '|Region:\u200B', value:`${Region}\u200B`, inline: true },
					{ name: '\u200B', value: '\u200B' },
					{ name: '|Channels:\u200B', value:`${AllChannels}\u200B`, inline: true },
					{ name: '|Text Channels:\u200B', value:`${AllTextChannels}\u200B`, inline: true },
					{ name: '|Voice Channels:\u200B', value:`${AllVoiceChannels}\u200B`, inline: true },
					{ name: '|Members:\u200B', value:`${members}\u200B / ${maxMembers}`, inline: true },
					{ name: '|Humans:\u200B', value:`${Humans}\u200B`, inline: true },
					{ name: '|Bots:\u200B', value:`${Bots}\u200B`, inline: true },
					{ name: '|Role Count:\u200B', value:`${RoleCount}\u200B`, inline: true },
					{ name: '|Emote Count:\u200B', value:`${EmojiCount}\u200B`, inline: true },
					{ name: '\u200B', value: '\u200B' },
					{ name: '|Shard ID:\u200B', value:`${shardID}\u200B`, inline: true },
					{ name: '|Large:\u200B', value:`${large}\u200B`, inline: true },
					{ name: '|Features:\u200B', value:`${feature}\u200B`, inline: false },
					{ name: '|AFK Timeout:\u200B', value:`${afkTimeout}\u200B`, inline: true },
					{ name: '|AFK Channel:\u200B', value:`${afkChannel}\u200B`, inline: true },
					{ name: '|Boost Tier:\u200B', value:`${BoostTier}\u200B`, inline: true },
					{ name: '|Boosters:\u200B', value:`${boosters}\u200B`, inline: true },
					{ name: '|Verificationlevel:\u200B', value:`${verificationleveltext}\u200B`, inline: true },
					{ name: '|Contentfilter:\u200B', value:`${contentfilter}\u200B`, inline: true },
					{ name: '|Vanity URL Code:\u200B', value:`${vanityURLcode}\u200B`, inline: true },
					{ name: '|System Channel:\u200B', value:`${SyschannelID}\u200B`, inline: true },
					{ name: '|Rules Channel:\u200B', value:`${rulesChannelID}\u200B`, inline: true },
					{ name: '|Public Updates Channel:\u200B', value:`${publicUpdatesChannelID}\u200B`, inline: true },
				)
				.setFooter(`Server created at: ${creationDate}`)
				.setColor('#b0ff00')
				.setTimestamp();
			msg.channel.send(ServerInfoEmbed);
		}
	}};