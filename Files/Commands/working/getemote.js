const Discord = require('discord.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports = {
	name: 'getemote',
	requiredPermissions: 3,
	aliases: ['steal'],
	Category: 'Miscellaneous',
	DMallowed: 'Yes',
	description: 'Steals an emote and saves it on the server',
	usage: 'h!getemote [name] [emote or link]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) return msg.reply('You have to give me an Emoji Name and the Link to the Image').catch(() => {});
		if (!args[1]) return msg.reply('You have to give me an Emoji Name and the Link to the Image').catch(() => {});
		let Emojilink = args.slice(1).join(' ');
		if (!Emojilink.toLowerCase().includes('http')) {
			const emote = Discord.Util.parseEmoji(Emojilink);
			Emojilink = `https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? 'gif' : 'png'}`;
		}
		const Emojiname = args[0];
		const m = await msg.channel.send('<a:Loading:780543908861182013> Creating Emote...');
		let done = false;
		await msg.guild.emojis.create(`${Emojilink}`, `${Emojiname}`).then(() => {
			done = true;
			m.edit('Successfully Created Emoji!');
		}).catch((e) => {
			done = true;
			if (`${e}`.includes('256.0 kb')) {
				var fileSize = '';
				var http = new XMLHttpRequest();
				http.open('HEAD', Emojilink, false); 
				http.send(null); 
				if (http.status === 200) {
					fileSize = http.getResponseHeader('content-length');
				}
				m.edit('I couldnt create that Emoji.\n' +e+'\n\n**File too big? Compress here:** https://www.iloveimg.com/\nCurrent Size: '+fileSize / 1000+' kb').catch(() => {});
			} else {
				m.edit('I couldnt create that Emoji.\n' + e).catch(() => {});
			}
		});
		setTimeout(() => {
			if (done == false) {
				m.edit('<a:Loading:780543908861182013> Creating Emote...\nLooks like you are creating Emotes pretty fast, this might have ratelimited me.\n**Creating more emotes will take a while from now on**');
			}
		}, 10000);
	}
};