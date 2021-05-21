
const ms = require('ms');
const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const NekoClient = require('nekos.best-api');
const Neko = new NekoClient();

module.exports = {
	name: 'interactions',
	aliases: ['ayaya', 'woof', 'nya', 'kith', 'smolkith', 'smallkiss', 'shake', 'scream','wave', 'comfort', 'fuck', 'feed', 'bonk', 'highfive', 'cry', 'bite', 'dance', 'araara', 'ara', 'sleep', 'spank', 'blush', 'yeet', 'bloodsuck', 'cuddle', 'snuggle', 'nuzzle', 'holdhands', 'handhold', 'hug', 'hold', 'kill', 'kiss', 'lewd', 'lick', 'lurk', 'peek', 'nom', 'pat', 'peck', 'poke', 'pout', 'hmph', 'hmpf', 'slap', 'hit', 'smile', 'thighsleep', 'tickle', 'stare', 'boop', 'awoo'],
	cooldown: 1000,
	Category: 'Fun',
	description: 'Interact with a user',
	usage: 'h![interaction name] (user mention)',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		//const res = await userhandler();
		const args1 = msg.content.slice(prefix.length).split(' ');
		const command1 = args1.shift().toLowerCase();
		var continued = args1.slice(0).join(' ');
		console.log(`|command executed: ${command1} | Executed by ${msg.author.tag}	| Continued: ${continued}	| Executed at ${new Date(Date.now()).toLocaleString()}\nIn Guild: ${msg.guild.id} / ${msg.guild.name} | Channel: ${msg.channel.id} / ${msg.channel.name}\n`);
		if (msg.author.id == '270588100382556161' && continued.includes('466745858147221504')) return replier(client.users.cache.get('466745858147221504').username + ' does not want to be interacted with.');
		interaction2Function(command1, continued, msg, errorchannelID);


		async function interaction2Function(command1, continued, msg) {
			let CD;
			let res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = 'interactions'`);
			if (!res || res.rowCount == 0) res = await pool.query(`SELECT * FROM cooldowns WHERE channelid = '${msg.channel.id}' AND command = 'interactions'`);
			if (res && res.rowCount > 0) {
				const r = res.rows[0];
				CD = r.cooldown;
			}
			if (command1 === 'hug' || command1 === 'comfort') {
				var random = Math.round(Math.random() * 80);
				let gif = '';
				let Text = `${msg.author} hugged ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'Are you lonely? Here take a hug.');
				}
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/Hy4hxRKtW.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/r1v2_uXP-.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/rkYetOXwW.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/rJaog0FtZ.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/BJoC__XvZ.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/HJU2OdmwW.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/SJfEks3Rb.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/ryCG-OatM.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/SyaAd_7vW.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/rkV6r56Oz.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/BysjuO7D-.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/Hk3ox0tYW.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/B10Tfknqf.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/S1qX2OJ_Z.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/BkotddXD-.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/BJF5_uXvZ.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/ryg2dd7wW.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/BJ0sOOmDZ.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/SywetdQvZ.gif';}
				if (random == 19) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/765911231025643590/tenor_6.gif';}
				if (random == 20) {gif = 'https://cdn.weeb.sh/images/rJnKu_XwZ.gif';}
				if (random == 21) {gif = 'https://cdn.weeb.sh/images/r1kC_dQPW.gif';}
				if (random == 22) {gif = 'https://cdn.weeb.sh/images/ByPGRkFVz.gif';}
				if (random == 23) {gif = 'https://cdn.weeb.sh/images/HyNJIaVCb.gif';}
				if (random == 24) {gif = 'https://cdn.weeb.sh/images/BJCCd_7Pb.gif';}
				if (random == 25) {gif = 'https://cdn.weeb.sh/images/S14ju_7Pb.gif';}
				if (random == 26) {gif = 'https://cdn.weeb.sh/images/Hy0KO_7DZ.gif';}
				if (random == 27) {gif = 'https://cdn.weeb.sh/images/ryjJFdmvb.gif';}
				if (random == 28) {gif = 'https://cdn.weeb.sh/images/BJ0UovdUM.gif';}
				if (random == 29) {gif = 'https://cdn.weeb.sh/images/Bk5haAocG.gif';}
				if (random == 30) {gif = 'https://cdn.weeb.sh/images/HkzndOXvZ.gif';}
				if (random == 31) {gif = 'https://cdn.weeb.sh/images/rkx1dJ25z.gif';}
				if (random == 32) {gif = 'https://cdn.weeb.sh/images/Sk80wyhqz.gif';}
				if (random == 33) {gif = 'https://cdn.weeb.sh/images/rJaog0FtZ.gif';}
				if (random == 34) {gif = 'https://cdn.weeb.sh/images/Bkta0ExOf.gif';}
				if (random == 35) {gif = 'https://cdn.weeb.sh/images/HJTWcTNCZ.gif';}
				if (random == 36) {gif = 'https://cdn.weeb.sh/images/HJ7lY_QwW.gif';}
				if (random == 37) {gif = 'https://cdn.weeb.sh/images/Hyv6uOQPZ.gif';}
				if (random == 38) {gif = 'https://cdn.weeb.sh/images/Sk-xxs3C-.gif';}
				if (random == 39) {gif = 'https://cdn.weeb.sh/images/B11CDkhqM.gif';}
				if (random == 40) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/765911233617592330/tenor_3.gif';}
				if (random == 41) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/765911233408401408/tenor_5.gif';}
				if (random == 42) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/765911235363078144/tenor_4.gif';}
				if (random > 42 ) {gif = Neko.hug();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'kiss' || command1 === 'kith' || command1 === 'smolkith' || command1 === 'smallkiss') {
				random = Math.round(Math.random() * 60);
				let gif = '';
				let Text = `${msg.author} kissed ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;
				}
				if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} kisses themselves, weird`);
				}
				if (continued.includes('650691698409734151')) {
					Text = `*${client.user} slaps ${msg.author} back into reality*\nDont forget yourself, Im just a bunch of codeblocks..`;
					if (msg.author.id == '318453143476371456') {
						Text = `${msg.author} kisses ${client.user} *~\\*`;
					} else {
						random = 61;
					}
				}
				if (random == 0) {gif = 'https://images-ext-2.discordapp.net/external/IZyVbr8731U0d3KWhZ7b2Z7PS-BGwonbZKflA96jGDc/https/cdn.nekos.life/kiss/kiss_128.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/Sk5P2adDb.gif';}
				if (random == 2) {gif = 'https://media.tenor.com/images/232d019a5ee98420b143d6bfe2cf6adb/tenor.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/HJ8dQRYK-.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/H1tv2p_Db.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/S1-KXsh0b.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/ryEvhTOwW.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/Bkk_hpdv-.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/BkLQnT_PZ.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/r1VWnTuPW.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/Hkt-nTOwW.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/rkFSiEedf.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/ryceu6V0W.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/ByiMna_vb.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/BJMX2TuPb.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/rkM4nTOPb.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/H1tv2p_Db.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/Skv72TuPW.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/Skc42pdv-.gif';}
				if (random == 19) {gif = 'https://cdn.weeb.sh/images/r1H42advb.gif';}
				if (random == 20) {gif = 'https://cdn.weeb.sh/images/ByVQha_w-.gif';}
				if (random == 21) {gif = 'https://cdn.weeb.sh/images/SkQIn6Ovb.gif';}
				if (random == 22) {gif = 'https://cdn.weeb.sh/images/r1cB3aOwW.gif';}
				if (random == 23) {gif = 'https://cdn.weeb.sh/images/BJSdQRtFZ.gif';}
				if (random == 24) {gif = 'https://cdn.weeb.sh/images/Byh57gqkz.gif';}
				if (random == 25) {gif = 'https://cdn.weeb.sh/images/Sk5P2adDb.gif';}
				if (random == 26) {gif = 'https://cdn.weeb.sh/images/S1VEna_v-.gif';}
				if (random == 27) {gif = 'https://cdn.weeb.sh/images/HklBtCvTZ.gif';}
				if (random == 28) {gif = 'https://cdn.weeb.sh/images/ByVQha_w-.gif';}
				if (random == 29) {gif = 'https://cdn.weeb.sh/images/BkUJNec1M.gif';}
				if (random == 30) {gif = 'https://images-ext-2.discordapp.net/external/ThBYZHONG_1x-dRf3A-6KbOEfuPCW1FN088LYg8S1yk/https/cdn.weeb.sh/images/HkZyXs3A-.gif';}
				if (random == 31) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/771883913101836288/tenor_10.gif';}
				if (random > 31 ) {gif = Neko.kiss();}
				if (random == 61) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/806682035326156800/tenor_44.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'lick') {
				random = Math.round(Math.random() * 19);
				let gif = '';
				let Text = `${msg.author} licked ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} is licking themselves`);
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/ryGpGsnAZ.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/H1zlgRuvZ.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/Bkxge0uPW.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/rktygCOD-.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/rykRHmB6W.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/Syg8gx0OP-.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/rJ6hrQr6-.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/HkEqiExdf.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/Sk15iVlOf.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/Bkagl0uvb.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/H13HS7S6-.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/H1EJxR_vZ.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/BkvTBQHaZ.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/S1Ill0_vW.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/Hkknfs2Ab.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/HJRRyAuP-.gif';}
				if (random == 16) {gif = 'https://media1.tenor.com/images/f46762ad38fbfed9e4e46bf7b89497c2/tenor.gif?itemid=12141724';}
				if (random == 17) {gif = 'https://cdn.discordapp.com/attachments/713915066441007164/713935822357004298/3bAmUYhTwlu.gif';}
				if (random == 18) {gif = 'https://cdn.discordapp.com/attachments/713915066441007164/713935931161182238/TKJr1PzQa7c.gif';}
				if (random == 19) {gif = 'https://cdn.discordapp.com/attachments/713915066441007164/713935890958778480/evepz90Vwp2.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'cuddle' || command1 === 'nuzzle' || command1 === 'snuggle') {
				random = Math.round(Math.random() * 60);
				let gif = '';
				let Text = `${msg.author} cuddles with ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'Imagine trying to cuddle yourself. I will!');
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/SkeHkUU7PW.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/H1SfI8XwW.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/B1S1I87vZ.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/BJseUI7wb.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/BkTe8U7v-.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/rylgIUmPW.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/BJkABImvb.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/SJLkLImPb.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/BJwpw_XLM.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/r1Q0HImPZ.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/SyUYOJ7iZ.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/SyZk8U7vb.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/By03IkXsZ.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/HJMv_k7iW.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/B1_e1gTXG.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/rkA6SU7w-.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/SJceIU7wZ.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/SJn18IXP-.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/ryfyLL7D-.gif';}
				if (random == 19) {gif = 'https://cdn.weeb.sh/images/BkZCSI7Pb.gif';}
				if (random == 20) {gif = 'https://cdn.weeb.sh/images/B1SzeshCW.gif';}
				if (random == 21) {gif = 'https://cdn.weeb.sh/images/rJ6zAkc1f.gif';}
				if (random == 22) {gif = 'https://cdn.weeb.sh/images/B1Qb88XvW.gif';}
				if (random == 23) {gif = 'https://cdn.weeb.sh/images/ryURHLXP-.gif';}
				if (random == 24) {gif = 'https://cdn.weeb.sh/images/BkkgL8mDW.gif';}
				if (random == 25) {gif = 'https://cdn.weeb.sh/images/HkUlIUXDZ.gif';}
				if (random == 26) {gif = 'https://cdn.weeb.sh/images/rk2-UL7PW.gif';}
				if (random == 27) {gif = 'https://images-ext-1.discordapp.net/external/gRGzIxTDKkaXSG_OmaIfyNNxzkV_bqorHdLUsgIPmhw/https/cdn.weeb.sh/images/SykzL87D-.gif';}
				if (random == 28) {gif = 'https://cdn.weeb.sh/images/BJF5_uXvZ.gif';}
				if (random > 28 ) {gif = Neko.cuddle();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'pat') {
				random = Math.round(Math.random() * 80);
				let gif = '';
				let Text = `${msg.author} pats ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'I see, someone needs pats.');
				}
		
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/rJavp1KVM.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/ryh6x04Rb.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/B1SOzCV0W.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/SyFkekYwW.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/SkqbJ0KYZ.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/Bk4Ry1KD-.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/rybs1yFDb.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/rkBZkRttW.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/BkaRWA4CZ.gif';}
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/ryXj1JKDb.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/HJGQlJYwb.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/r12R1kYPZ.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/rJWRykFvZ.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/ry1tlj2AW.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/H1s5hx0Bf.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/rytzGAE0W.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/SktIxo20b.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/H1jnJktPb.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/HyWlxJFvb.gif';}
				if (random == 19) {gif = 'https://cdn.weeb.sh/images/S1ja11KD-.gif';}
				if (random == 20) {gif = 'https://cdn.weeb.sh/images/rkADh0sqM.gif';}
				if (random == 21) {gif = 'https://cdn.weeb.sh/images/BJp1lyYD-.gif';}
				if (random == 22) {gif = 'https://cdn.weeb.sh/images/SJudB96_f.gif';}
				if (random == 23) {gif = 'https://cdn.weeb.sh/images/H1Vc1yYwW.gif';}
				if (random == 24) {gif = 'https://cdn.weeb.sh/images/r1goyytPZ.gif';}
				if (random == 25) {gif = 'https://cdn.weeb.sh/images/SkksgsnCW.gif';}
				if (random == 26) {gif = 'https://cdn.weeb.sh/images/HyxG31ktDb.gif';}
				if (random == 27) {gif = 'https://cdn.weeb.sh/images/SkVNXac-G.gif';}
				if (random == 28) {gif = 'https://cdn.weeb.sh/images/rJMskkFvb.gif';}
				if (random == 29) {gif = 'https://cdn.weeb.sh/images/rkbblkYvb.gif';}
				if (random == 30) {gif = 'https://cdn.weeb.sh/images/Sky1x1YwW.gif';}
				if (random == 31) {gif = 'https://cdn.weeb.sh/images/H1jgekFwZ.gif';}
				if (random == 32) {gif = 'https://cdn.weeb.sh/images/B1TQcTNCZ.gif';}
				if (random == 33) {gif = 'https://cdn.weeb.sh/images/HJRIlihCZ.gif';}
				if (random == 34) {gif = 'https://cdn.weeb.sh/images/HyqTkyFvb.gif';}
				if (random == 35) {gif = 'https://cdn.weeb.sh/images/rkTC896_f.gif';}
				if (random == 36) {gif = 'https://cdn.weeb.sh/images/rkZbJAYKW.gif';}
				if (random == 37) {gif = 'https://cdn.weeb.sh/images/r12R1kYPZ.gif';}
				if (random == 38) {gif = 'https://cdn.weeb.sh/images/H1XkAyYNM.gif';}
				if (random == 39) {gif = 'https://cdn.discordapp.com/attachments/708671684491739199/708672416414564372/lH-7LZyXvH_.gif';}
				if (random == 40) {gif = 'https://media1.tenor.com/images/f330c520a8dfa461130a799faca13c7e/tenor.gif?itemid=13911345';}
				if (random == 41) {gif = 'https://media1.tenor.com/images/c0bcaeaa785a6bdf1fae82ecac65d0cc/tenor.gif?itemid=7453915';}
				if (random == 42) {gif = 'https://media1.tenor.com/images/0ac15c04eaf7264dbfac413c6ce11496/tenor.gif?itemid=16121044';}
				if (random == 43) {gif = 'https://media1.tenor.com/images/5466adf348239fba04c838639525c28a/tenor.gif?itemid=13284057';}
				if (random == 44) {gif = 'https://media1.tenor.com/images/755b519f860ef65a4b9f889aece000fe/tenor.gif?itemid=16085284';}
				if (random == 45) {gif = 'https://images-ext-2.discordapp.net/external/xpLW9MiNj7tZBz_QX6BPaBn5oUWj9TuuyeYKyWvddwE/https/cdn.nekos.life/pat/pat_005.gif';}
				if (random == 46) {gif = 'https://cdn.discordapp.com/attachments/298954459172700181/721144147133595670/tenor-6.gif';}
				if (random == 47) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/735259723292737650/tenor_-_2020-07-22T001925.411.gif';}
				if (random == 48) {gif = 'https://cdn.discordapp.com/attachments/298954459172700181/759920144109273118/tenor.gif';}
				if (random == 49) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/784198058908319764/0029d1c5746ccbd6.gif';}
				if (random > 49 ) {gif = Neko.pat();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'nom') {
				random = Math.round(Math.random() * 6);
				let gif = '';
				let Text = `${msg.author} noms on ${continued}`;
				if (!continued.includes('<@') && msg.author.id !== '699192379558723635') { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} noms themselves`);
				}
		
				if (random == 1) {gif = 'https://images-ext-2.discordapp.net/external/hMN0jfdNLYH_JmIltn50v_kbxbVPmg7LEycbgz7AuX8/%3Fitemid%3D15735907/https/media1.tenor.com/images/5878c0995fcf89352ff13189ee61f303/tenor.gif';}
				if (random == 2) {gif = 'https://imgur.com/RPCWKtc.gif';}
				if (random == 3) {gif = 'https://imgur.com/esMJKkK.gif';}
				if (random == 4) {gif = 'https://images-ext-1.discordapp.net/external/QXlArNhRqGqvKQVQdmMDLzzM0bo1UnBfw502sW-rgOQ/https/cdn.weeb.sh/images/H1hige7sZ.gif';}
				if (random == 0) {gif = 'https://i.imgur.com/q3A4HL2.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/HJmbWxmiZ.gif';}
				if (random == 6) {gif = 'https://imgur.com/v0b2A3w.gif';}
				if (msg.author.id == '699192379558723635' && continued.includes('richi')) {gif = 'https://cdn.discordapp.com/emojis/817184637024862238.png?v=1', Text = `${msg.author} casually ate Richi\\_bedo\\_`;}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'poke' || command1 === 'boop') {
				random = Math.round(Math.random() * 60);
				let gif = '';
				let Text = `${msg.author} pokes ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'Hawo *pokes you*');
				}
		
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/B14SJlTQG.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/rkaUe1YPb.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/rJzUe1FwZ.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/rktSlkKvb.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/HJZpLxkKDb.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/SydLxJFwW.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/rkaUe1YPb.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/rkB8eJYPZ.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/SydLxJFwW.gif';}
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/BJhIekKwb.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/r1ALxJKwW.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/HkjjLb0rM.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/H1fMRpYtb.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/rkeaUeJKD-.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/Hk2HekKD-.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/BkcSekKwb.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/r1v6xoh0Z.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/SyJzRTKFW.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/HkxwlkKPb.gif';}
				if (random == 19) {gif = 'https://cdn.weeb.sh/images/rJ0hlsnR-.gif';}
				if (random == 20) {gif = 'https://media.discordapp.net/attachments/298954962699026432/716296437847031878/OI1bml6.gif';}
				if (random == 21) {gif = 'https://media.discordapp.net/attachments/298954962699026432/716296416003096638/u2FvgB0.gif';}
				if (random == 22) {gif = 'https://media.discordapp.net/attachments/298954962699026432/716296415352979556/3pYljj9.gif';}
				if (random == 23) {gif = 'https://media.discordapp.net/attachments/298954962699026432/716296415000789043/cMfVelF.gif';}
				if (random == 24) {gif = 'https://media.discordapp.net/attachments/298954962699026432/716296414371643522/acIDYaP.gif';}
				if (random == 25) {gif = 'https://imgur.com/C4anjtm.gif';}
				if (random > 25 ) {gif = Neko.poke();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'slap'|| command1 === 'hit') {
				random = Math.round(Math.random() * 60);
				let gif = '';
				let Text = `${msg.author} slapped ${continued}`;
				if (continued.toLowerCase().includes('ass') || continued.toLowerCase().includes('butt') || continued.toLowerCase().includes('arse') || continued.toLowerCase().includes('posterior')) return replier('If you want to spank someone, use the `h!spank` command');
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'I guess some people just enjoy slaps?');
				}
		
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/B1oCmkFw-.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/HyPjmytDW.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/SkdyfWCSf.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/SkZTQkKPZ.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/HkHCm1twZ.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/ryv3myFDZ.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/HJfXM0KYZ.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/Hkw1VkYP-.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/BkxEo7ytDb.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/SkSCyl5yz.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/S1ylxxc1M.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/SJlkNkFwb.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/ByHUMRNR-.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/rknn7Jtv-.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/H16aQJFvb.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/HkJ6-e91z.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/B1fnQyKDW.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/Sk9mfCtY-.gif';}
				if (random == 19) {gif = 'https://cdn.weeb.sh/images/S1lf3XkKvW.gif';}
				if (random == 20) {gif = 'https://cdn.weeb.sh/images/ry_RQkYDb.gif';}
				if (random == 21) {gif = 'https://cdn.weeb.sh/images/BJ8o71tD-.gif';}
				if (random == 22) {gif = 'https://cdn.weeb.sh/images/HkA6mJFP-.gif';}
				if (random == 23) {gif = 'https://cdn.weeb.sh/images/HkK2mkYPZ.gif';}
				if (random == 24) {gif = 'https://cdn.weeb.sh/images/rJgTQ1tvb.gif';}
				if (random == 25) {gif = 'https://cdn.weeb.sh/images/B1-nQyFDb.gif';}
				if (random == 26) {gif = 'https://cdn.weeb.sh/images/B1jk41KD-.gif';}
				if (random == 27) {gif = 'https://cdn.weeb.sh/images/SJx7M0Ft-.gif';}
				if (random == 28) {gif = 'https://cdn.weeb.sh/images/ryn_Zg5JG.gif';}
				if (random == 29) {gif = 'https://cdn.weeb.sh/images/rJ4141YDZ.gif';}
				if (random == 30) {gif = 'https://cdn.weeb.sh/images/rJs7GAttb.gif';}
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/Byjqm1tDW.gif';}
				if (random > 30 ) {gif = Neko.slap();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'pout' || command1 === 'hmph' || command1 === 'hmpf') {
				random = Math.round(Math.random() * 15);
				let gif = '';
				let Text = `${msg.author} pouts at ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} pouts`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = '*hmph*');
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/BkYieJYD-.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/BkBEWjhCZ.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/Hy7slyKPW.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/ByG6gkYDZ.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/r1atlktPb.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/Sk7CeJtwZ.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/S1vFlkYwW.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/Sks6rCZgz.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/SylseyKvZ.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/SkRUqPuUf.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/HkIclytPW.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/SJL3gytvb.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/ryx6g1YvZ.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/SJi79PdLM.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/rk-hx1Fvb.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/H11heJYPZ.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'lewd') {
				random = Math.round(Math.random() * 11);
				let gif = '';
				let Text = `${msg.author} lewds ${continued}`;
				if (!continued.includes('<@')) { Text = 'Thats lewd!';
				} else if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} finally found out that they are lewd!`);
				}
		
				if (random == 0) {gif = 'https://imgur.com/64doxzq.gif';}
				if (random == 1) {gif = 'https://imgur.com/uLXVak6.gif';}
				if (random == 2) {gif = 'https://imgur.com/FEJerlj.gif';}
				if (random == 3) {gif = 'https://imgur.com/6LKIAVc.gif';}
				if (random == 4) {gif = 'https://imgur.com/teQWzRf.gif';}
				if (random == 5) {gif = 'https://imgur.com/2flX6wz.gif';}
				if (random == 6) {gif = 'https://imgur.com/Kre5oOh.gif';}
				if (random == 7) {gif = 'https://imgur.com/QHLsg60.gif';}
				if (random == 8) {gif = 'https://imgur.com/SxR4r7v.gif';}
				if (random == 9) {gif = 'https://imgur.com/bLco6I7.gif';}
				if (random == 10) {gif = 'https://imgur.com/UEEcrxj.gif';}
				if (random == 11) {gif = 'https://imgur.com/jmTA7RT.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'peck') {		
				random = Math.round(Math.random() * 8);
				let gif = '';
				let Text = `${msg.author} pecks ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*pecks you and blushes* Don\'t look at me like that~ You wanted this!');
				}
		
				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/713915203280175115/713937394696716358/Fua_z4D1yIP.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/713915203280175115/713937439420317767/us-yTvBGvqg.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/713915203280175115/713937422504820837/nmLPCf5QtoJ.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/713915203280175115/713937418394271784/CezoGn-h5wp.gif';}
				if (random == 4) {gif = 'https://imgur.com/kXWbcEM.gif';}
				if (random == 5) {gif = 'https://imgur.com/IKHwUt6.gif';}
				if (random == 6) {gif = 'https://imgur.com/iW9gTWM.gif';}
				if (random == 7) {gif = 'https://imgur.com/5b3nnby.gif';}
				if (random == 8) {gif = 'https://imgur.com/Li0b69n.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'kill') {
				random = Math.round(Math.random() * 11);
				let gif = '';
				let Text = `${msg.author} killed ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/713914988602982422/713935665104158810/YIy0BmMjANn.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/713914988602982422/713935662755217408/uOlyiKmmUhS.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/713914988602982422/713935658477027478/Xufk1gBs8pl.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/713914988602982422/713935609655459920/bOtF4EdBbDJ.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/713914988602982422/713935623194542080/HaqpyGK874b.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/713915333295210516/713937879600070699/IgcgPckMgiG.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/713915333295210516/713937857630437417/bNXWyFtchHr.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/713915333295210516/713937837321617479/AKO-bY1A3B2.gif';}
				if (random == 8) {gif = 'https://imgur.com/SSw8o02.gif';}
				if (random == 9) {gif = 'https://imgur.com/cujLQT7.gif';}
				if (random == 10) {gif = 'https://imgur.com/KV8DAna.gif';}
				if (random == 11) {gif = 'https://imgur.com/AXio2RS.gif';}
				if (Math.floor(Math.random() * 3) == 0) {Text == `${msg.mentions.users.first()} was not the imposter`;}
				if (continued.includes(msg.author.id)) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/730935191782293514/tenor_60.gif'; Text = 'No suicide >:c'; random = '∞';}
				if (continued.includes(client.user.id)) {
					random = Math.round(Math.random() * 4);
					if (random == 0) gif = 'https://cdn.discordapp.com/attachments/726252103302905907/734722401199325194/tenor_-_2020-07-20T124409.503.gif'; Text = `${client.user} annihilates you and the planet you stand on`;
					if (random == 1) gif = 'https://cdn.discordapp.com/attachments/726252103302905907/734722401199325194/tenor_-_2020-07-20T124409.503.gif'; Text = `${client.user} annihilates you and the planet you stand on`;
					if (random == 2) gif = 'https://cdn.discordapp.com/attachments/298955020232032258/756480508824911943/YpihifdXP4WRURvA6PxjmaRiEDC76Pz8m2poM1JRsWBZz31yc5gQe8yTGxD5BU3RE3BYxs215EDrwoRYdgSVFrSiXYSwX3saBaUT.gif'; Text = `${client.user} annihilates you and the planet you stand on`;
					if (random == 3) gif = 'https://cdn.discordapp.com/attachments/298955020232032258/756480508824911943/YpihifdXP4WRURvA6PxjmaRiEDC76Pz8m2poM1JRsWBZz31yc5gQe8yTGxD5BU3RE3BYxs215EDrwoRYdgSVFrSiXYSwX3saBaUT.gif'; Text = `${client.user} annihilates you and the planet you stand on`;
					if (random == 4) gif = 'https://cdn.discordapp.com/attachments/298955020232032258/756480508824911943/YpihifdXP4WRURvA6PxjmaRiEDC76Pz8m2poM1JRsWBZz31yc5gQe8yTGxD5BU3RE3BYxs215EDrwoRYdgSVFrSiXYSwX3saBaUT.gif'; Text = `${client.user} annihilates you and the planet you stand on`;
				}
				processedInteraction2Function(Text, gif, CD);
				if (!continued.includes(msg.author.id)) {
					setTimeout(() => {
						let random2 = Math.round(Math.random() * 10);
						let luser = msg.mentions.users.first();
						if (luser && luser.id) {
							if (continued.includes(client.user.id)) {random2 = 11; sender(`**${msg.author.username}** floats off into space as a pile of dust, humanity is doomed thanks to you.`);}
							if (random2 == 0) sender(`**${luser.username}** got smashed into the ground by **${msg.author.username}**.`); 
							if (random2 == 1) sender(`The Doctors were able to revive **${luser.username}**.`);
							if (random2 == 2) sender(`**${luser.username}** was not impressed by **${msg.author.username}** and didn't even flinch`);
							if (random2 == 3) sender(`Legends say sometimes you can hear **${luser.username}** scream "OBJECTION" out of their grave`);
							if (random2 == 4) sender(`**${luser.username}** ditched **${msg.author.username}**'s attack perfectly.`);
							if (random2 == 5) sender(`**${luser.username}** died on the way to the hospital`);
							if (random2 == 6) sender(`**${luser.username}** died a terrible death while trying to fight **${msg.author.username}**`);
							if (random2 == 7) if(msg.author.id == '318453143476371456') {sender(`**${luser.username}** fucking died.`);} else {sender(`**${luser.username}** died, not from **${msg.author.username}**'s performance but from shock caused by their ugliness`);}
							if (random2 == 8) sender(`**${luser.username}** died before **${msg.author.username}** could even do something`);
							if (random2 == 9) sender(`**${luser.username}** was killed by **${msg.author.username}**`);
							if (random2 == 10) sender(`**${luser.username}** was beheaded by **${msg.author.username}**`);
						}
					}, ms('20s')); 
				}
			}
			if (command1 === 'bloodsuck') {
				random = Math.round(Math.random() * 3);
				let gif = '';
				let Text = `${msg.author} is sucking ${continued}'s blood`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'Oooh tasty~');
				}
		
				if (random == 0) {gif = 'https://i.imgur.com/UbaeYIq.gif';}
				if (random == 1) {gif = 'https://i.imgur.com/DAuEJ2F.gif';}
				if (random == 2) {gif = 'https://i.imgur.com/CtwmzpG.gif';}
				if (random == 3) {gif = 'https://i.imgur.com/qi83Eft.gif';}
				processedInteraction2Function(Text, gif, CD);
			}			
			if (command1 === 'shake') {
				random = Math.round(Math.random() * 7);
				let gif = '';
				let Text = `${msg.author} shakes ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*shakes you for no reason*');
				}

				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095817290612756/tenor_29.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095821212680210/tenor_28.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095822768242778/tenor_26.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095828065779722/tenor_23.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095828220706816/tenor_22.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095832200970250/tenor_25.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095836420571186/tenor_24.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776095821199704114/tenor_27.gif';}
				processedInteraction2Function(Text, gif, CD);
			}

			if (command1 === 'scream') {
				random = Math.round(Math.random() * 8);
				let gif = '';
				let Text = `${msg.author} screams at ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} screams`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = '**AAAAAAAAAAH!**');
				}

				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086273042546698/tenor_20.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086274170814494/tenor_19.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086273278214184/tenor_21.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086277053218866/tenor_17.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086276775477258/tenor_18.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086279745437706/tenor_16.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086282681581628/tenor_15.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086283893080064/tenor_14.gif';}
				if (random == 8) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776086287554969680/tenor_13.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'wave') {
				random = Math.round(Math.random() * 10);
				let gif = '';
				let Text = `${msg.author} waves at ${continued}`;
				if (!continued.includes('<@')) {
					Text = `${msg.author} waves at the chat`;
				}
				if (continued.includes(msg.author.id) ) {
					(Text = '*waves at you*');
				}
				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106759399276604/tenor_30.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106727317438484/tenor_31.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106724289019934/tenor_32.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106723030597652/tenor_33.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106721973501982/tenor_34.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106719486017566/tenor_35.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106719204868116/tenor_36.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106717125672960/tenor_37.gif';}
				if (random == 8) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106715501559828/tenor_38.gif';}
				if (random == 9) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106713849921576/tenor_39.gif';}
				if (random == 10) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/776106711987126303/tenor_40.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'thighsleep') {
				random = Math.round(Math.random() * 3);
				let gif = '';
				let Text = `${msg.author} is sleeping on ${continued}'s thighs`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = 'Come  here, my thighs are very comfy~');
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/rytzGAE0W.gif';}
				if (random == 1) {gif = 'https://media.tenor.com/images/9d14fa4b551c7d42ca84d8d02d9dc7f2/tenor.gif';}
				if (random == 2) {gif = 'https://media.tenor.com/images/cdc11b08698043e8e305487f8414defa/tenor.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/774529670896025600/tenor_11.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'lurk' || command1 === 'peek') {
				random = Math.round(Math.random() * 10);
				let gif = '';
				let Text = `${msg.author} is peeking into chat`;
				if (random == 0) {gif = 'https://imgur.com/fErFizy.gif';}
				if (random == 1) {gif = 'https://imgur.com/dbZJOrz.gif';}
				if (random == 2) {gif = 'https://imgur.com/dHQ1jX2.gif';}
				if (random == 3) {gif = 'https://imgur.com/cpoeYct.gif';}
				if (random == 4) {gif = 'https://imgur.com/xvjq23d.gif';}
				if (random == 5) {gif = 'https://imgur.com/jhXUZAT.gif';}
				if (random == 6) {gif = 'https://imgur.com/KnNqCMq.gif';}
				if (random == 7) {gif = 'https://imgur.com/J8j02Ls.gif';}
				if (random == 8) {gif = 'https://imgur.com/UOT1Pqx.gif';}
				if (random == 9) {gif = 'https://imgur.com/098SPQo.gif';}
				if (random == 10) {gif = 'https://imgur.com/aaPl4M8.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'handhold' || command1 === 'holdhands' || command1 === 'fuck') {
				random = Math.round(Math.random() * 13);
				let gif = '';
				let Text = `${msg.author} is holding ${continued}'s hand`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text =  '*gently grabs your hand*');
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/Sky0l65WM.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/BkiRKrLBz.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/rJx5xa9bf.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/BJzLMTcbf.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/HJqpxp5bf.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/rJ2IfTq-f.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/B1rpeTqZf.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/rJX0eac-z.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/H1urgT5-f.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/HkGuxacbf.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/rJ2IfTq-f.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/B1jKga5Zz.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/Hk5_ga5bG.gif';}
				if (random == 13) {gif = 'https://cdn.discordapp.com/attachments/298955020232032258/452638956517982208/holdhands-rk5SMpq-M.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'bite') {
				random = Math.round(Math.random() * 11);
				let gif = '';
				let Text = `${msg.author} is biting ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} bit themselves.`);
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/H1gYelQjZ.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/rkakblmiZ.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/rJjd1nDLz.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/rk8illmiW.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/ry00lxmob.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/S1o6egmjZ.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/HkutgeXob.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/r1Vk-x7sZ.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/Hk1sxlQjZ.gif';}
				if (random == 9) {gif = 'https://imgur.com/lQ8rkhV.gif';}
				if (random == 10) {gif = 'https://imgur.com/HqlIWhL.gif';}
				if (random == 11) {gif = 'https://imgur.com/23LIoic.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'tickle') {
				random = Math.round(Math.random() * 30);
				let gif = '';
				let Text = `${msg.author} is tickeling ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Tickles you*');
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/HyPyUymsb.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/Byj7LJmiW.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/SkmEI1mjb.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/SyGQIk7i-.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/H1p0ByQo-.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/rybRByXjZ.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/HyjNLkXiZ.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/SyQHUy7oW.gif';}
				if (random > 7) {gif = Neko.tickle();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'smile') {
				random = Math.round(Math.random() * 22);
				let gif = '';
				let Text = `${msg.author} is smiling at ${continued}`;
				if (!continued.includes('<@')) { Text = '*smiles at you*';
				} else if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} smiles`);
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/rkTDVJYwW.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/SJCcNJKDb.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/BJbDVkFwW.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/SJz_4JKvW.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/Hyk_NJKP-.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/BkVH4kKPb.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/SJPd4JYPZ.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/B1lUN1tDb.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/SJBYN1YwZ.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/r1IdE1KD-.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/SkR3TJFNM.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/HyxHN1Kv-.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/rkqL4ktDZ.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/Hk6cNJKPb.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/HJ0DEytPZ.gif';}
				if (random == 15) {gif = 'https://cdn.weeb.sh/images/B1-UN1KPb.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/HJz44ytDW.gif';}
				if (random == 17) {gif = 'https://cdn.weeb.sh/images/ry4U4JFwW.gif';}
				if (random == 18) {gif = 'https://cdn.weeb.sh/images/B1-UN1KPb.gif';}
				if (random == 19) {gif = 'https://cdn.weeb.sh/images/HypVV1Kwb.gif';}
				if (random == 20) {gif = 'https://cdn.weeb.sh/images/Hy9dVkFDW.gif';}
				if (random == 21) {gif = 'https://cdn.weeb.sh/images/rkH84ytPZ.gif';}
				if (random == 22) {gif = 'https://cdn.weeb.sh/images/SJecVktDb.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'stare') {
				random = Math.round(Math.random() * 16);
				let gif = '';
				let Text = `${msg.author} is staring at ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Stares at you*');
				}
		
				if (random == 0) {gif = 'https://cdn.weeb.sh/images/rJCYIktw-.gif';}
				if (random == 1) {gif = 'https://cdn.weeb.sh/images/BJ88vLvd-.gif';}
				if (random == 2) {gif = 'https://cdn.weeb.sh/images/HyYuG-CBf.gif';}
				if (random == 3) {gif = 'https://cdn.weeb.sh/images/Sk5BOdQIG.gif';}
				if (random == 4) {gif = 'https://cdn.weeb.sh/images/B1WpLJKwW.gif';}
				if (random == 5) {gif = 'https://cdn.weeb.sh/images/HkvY8JKPW.gif';}
				if (random == 6) {gif = 'https://cdn.weeb.sh/images/Hye2wIJtPb.gif';}
				if (random == 7) {gif = 'https://cdn.weeb.sh/images/SJ9_8kFwb.gif';}
				if (random == 8) {gif = 'https://cdn.weeb.sh/images/H1P_LyFPb.gif';}
				if (random == 9) {gif = 'https://cdn.weeb.sh/images/Hk768JtP-.gif';}
				if (random == 10) {gif = 'https://cdn.weeb.sh/images/BknO81Kwb.gif';}
				if (random == 11) {gif = 'https://cdn.weeb.sh/images/rkHFLyKDZ.gif';}
				if (random == 12) {gif = 'https://cdn.weeb.sh/images/H1jnI1KPZ.gif';}
				if (random == 13) {gif = 'https://cdn.weeb.sh/images/Sk9jLJKvZ.gif';}
				if (random == 14) {gif = 'https://cdn.weeb.sh/images/Bk12IJYvb.gif';}
				if (random == 15) {gif = 'https://media.discordapp.net/attachments/644703563280285700/701738484271939594/rJao8JKv-.gif';}
				if (random == 16) {gif = 'https://cdn.weeb.sh/images/HyWnLyKPZ.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'awoo') {
				random = Math.round(Math.random() * 2);
				let gif = '';
				let Text = `${msg.author} awoo's at ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} is awooing`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = '*Awooooo~*');
				}
			
				if (random == 0) {gif = 'https://imgur.com/iYvxI2N.gif';}
				if (random == 1) {gif = 'https://imgur.com/3aozU3F.gif';}
				if (random == 2) {gif = 'https://imgur.com/o9JP0BM.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'yeet') {
				random = Math.round(Math.random() * 3);
				let gif = '';
				let Text = `${msg.author} yeets ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Yeets you autta here*');
				}
			
				if (random == 3) {
					if (continued.includes('<@') && continued.includes('>')) {
						if (continued.includes('!')) {
							continued.replace(/<@!/g , '');
						} else {
							continued.replace(/<@/g , '');
						}
						Text = `${continued} found out what ${msg.author} was planning and yeets them first.`;
					}
				}
				if (random == 0) {gif = 'https://imgur.com/jFec7bv.gif';}
				if (random == 1) {gif = 'https://imgur.com/yQbNEqB.gif';}
				if (random == 2) {gif = 'https://imgur.com/r7PSg14.gif';}
				if (random == 3) {gif = 'https://imgur.com/7yFi8AQ.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'blush') {
				random = Math.round(Math.random() * 13);
				let gif = '';
				let Text = `${msg.author} blushes thanks to ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} blushes`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} randomly blushes because of themselves`);
				}
			
				if (random == 0) {gif = 'https://imgur.com/Pmr8E7u.gif';}
				if (random == 1) {gif = 'https://imgur.com/aX2Xhgr.gif';}
				if (random == 2) {gif = 'https://imgur.com/zBxriAh.gif';}
				if (random == 3) {gif = 'https://imgur.com/OM6Z5S4.gif';}
				if (random == 4) {gif = 'https://imgur.com/nGFyzFU.gif';}
				if (random == 5) {gif = 'https://imgur.com/0fj414J.gif';}
				if (random == 6) {gif = 'https://imgur.com/aUd3hQ5.gif';}
				if (random == 7) {gif = 'https://imgur.com/94JCvpp.gif';}
				if (random == 8) {gif = 'https://imgur.com/Bx8c4Wf.gif';}
				if (random == 9) {gif = 'https://imgur.com/8Nsy3pi.gif';}
				if (random == 10) {gif = 'https://imgur.com/eB2FILW.gif';}
				if (random == 11) {gif = 'https://imgur.com/e5qOXL9.gif';}
				if (random == 12) {gif = 'https://imgur.com/Y8wL8EP.gif';}
				if (random == 13) {gif = 'https://imgur.com/zNYtoCZ.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'spank') {			
				random = Math.round(Math.random() * 11);
				let gif = '';
				const user = msg.mentions.users.first();
				let Text = `${msg.author} spanks ${user}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Spanks you*');
				}
				const res1 = await pool.query(`SELECT * FROM usersettings WHERE userid = '${msg.author.id}'`);
				const res2 = await pool.query(`SELECT * FROM usersettings WHERE userid = '${user.id}'`);
				let wanted1 = false;
				let wanted2 = false;
				if (res1 !== undefined && res2 !== undefined) { 
					if (res1.rowCount !== 0) {
						if (res1.rows[0].spanktof == true) {
							wanted1 = true;
						}
					}
					if (res2.rowCount !== 0) {
						if (res2.rows[0].spanktof == true) {
							wanted2 = true;
						}
					}
				}


				if (wanted2 == false) {
					return replier(`${user} Does not want to be spanked. \nThey can allow to be spanked by typing \`h!spanking\``);
				}
				if (wanted1 == false) {
					return replier('You are only allowed to spank others if you allow it on yourself. \nAllow to be spanked by typing `h!spanking`');
				}
				if (random == 0) {gif = 'https://imgur.com/oCrEu3k.gif';}
				if (random == 1) {gif = 'https://imgur.com/d1izIqv.gif';}
				if (random == 2) {gif = 'https://imgur.com/9dEPLjy.gif';}
				if (random == 3) {gif = 'https://imgur.com/UPwwOmf.gif';}
				if (random == 4) {gif = 'https://imgur.com/jGA4cJa.gif';}
				if (random == 5) {gif = 'https://imgur.com/jGA4cJa.gif';}
				if (random == 6) {gif = 'https://imgur.com/VX2qNLi.gif';}
				if (random == 7) {gif = 'https://imgur.com/CLcXBRq.gif';}
				if (random == 8) {gif = 'https://imgur.com/N4txDTs.gif';}
				if (random == 9) {gif = 'https://imgur.com/UxJwAhG.gif';}
				if (random == 10) {gif = 'https://imgur.com/C93hsFh.gif';}
				if (random == 11) {gif = 'https://imgur.com/HsTWmN7.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'sleep') {
				random = Math.round(Math.random() * 22);
				let gif = '';
				let Text = `${msg.author} sleeps with ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} sleeps`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = '*sleeps with you*');
				}
				if (random == 0) {gif = 'https://imgur.com/ZcW9jpm.gif';}
				if (random == 1) {gif = 'https://imgur.com/G8WIcqO.gif';}
				if (random == 2) {gif = 'https://imgur.com/uTa1CXp.gif';}
				if (random == 3) {gif = 'https://imgur.com/uncEQTS.gif';}
				if (random == 4) {gif = 'https://imgur.com/pqOb8Au.gif';}
				if (random == 5) {gif = 'https://imgur.com/VEaNPuI.gif';}
				if (random == 6) {gif = 'https://imgur.com/ALALRcU.gif';}
				if (random == 7) {gif = 'https://imgur.com/zvqYG0I.gif';}
				if (random == 8) {gif = 'https://imgur.com/FznpfZO.gif';}
				if (random == 9) {gif = 'https://imgur.com/IuPfoEu.gif';}
				if (random == 10) {gif = 'https://imgur.com/OJJ4aHq.gif';}
				if (random == 11) {gif = 'https://imgur.com/Z6SuLml.gif';}
				if (random == 12) {gif = 'https://imgur.com/Ywl4rs0.gif';}
				if (random == 13) {gif = 'https://imgur.com/vpRvuzt.gif';}
				if (random == 14) {gif = 'https://imgur.com/2sDZHO9.gif';}
				if (random == 15) {gif = 'https://imgur.com/kraxnlI.gif';}
				if (random == 16) {gif = 'https://imgur.com/vG0c3EJ.gif';}
				if (random == 17) {gif = 'https://imgur.com/QCjjou9.gif';}
				if (random == 18) {gif = 'https://imgur.com/e3EWbwm.gif';}
				if (random == 19) {gif = 'https://imgur.com/X7XtHD3.gif';}
				if (random == 20) {gif = 'https://imgur.com/bt8p3sI.gif';}
				if (random == 21) {gif = 'https://imgur.com/QlMmkNY.gif';}
				if (random == 22) {gif = 'https://imgur.com/B17WyM8.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'araara' || command1 === 'ara') {
				random = Math.round(Math.random() * 4);
				let gif = '';
				let Text = `${msg.author} emits ara ara aura at ${continued}`;
				if (!continued.includes('<@')) { Text = 'ara ara';
				} else if (continued.includes(msg.author.id) ) {
					(Text = '*ara ara~*');
				}

				if (random == 0) {gif = 'https://imgur.com/p3yCJTJ.gif';}
				if (random == 1) {gif = 'https://imgur.com/cOzoBc7.gif';}
				if (random == 2) {gif = 'https://imgur.com/VUmTOjn.gif';}
				if (random == 3) {gif = 'https://imgur.com/iOS7yCp.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/784698913340391425/tenor_29.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'dance') {
				random = Math.round(Math.random() * 20);
				let gif = '';
				let Text = `${msg.author} dances with ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} dances`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} dances alone`);
				}

				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663393190051900/tenor_79.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663406708293682/tenor_71.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663407639691395/tenor_74.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663410923831296/tenor_70.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663428678189138/tenor_68.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663431668727849/tenor_64.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663434256613452/tenor_76.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663437268254730/tenor_67.gif';}
				if (random == 8) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663446734536725/tenor_69.gif';}
				if (random == 9) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663449314164887/tenor_65.gif';}
				if (random == 10) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663460923998260/tenor_72.gif';}
				if (random == 11) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663463985709066/tenor_75.gif';}
				if (random == 12) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663488019202118/tenor_66.gif';}
				if (random == 13) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663491756195900/tenor_77.gif';}
				if (random == 14) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663502116257832/tenor_62.gif';}
				if (random == 15) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663519501647932/tenor_73.gif';}
				if (random == 16) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663532810305606/tenor_78.gif';}
				if (random == 17) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663540787740682/tenor_63.gif';}
				if (random == 18) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663567644000276/Saikou_2.gif';}
				if (random == 19) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/731663575910973502/tenor_61.gif';}
				if (random == 19) {gif = 'https://media.discordapp.net/attachments/298954459172700181/744664808044888165/image0-9.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'cry') {
				random = Math.round(Math.random() * 22);
				let gif = '';
				let Text = `${msg.author} cries at ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} cries`;
				} else if (continued.includes(msg.author.id) ) {
					(Text = `${msg.author} cries alone`);
				}

				if (random == 0) {gif = 'https://imgur.com/jnF5z08.gif';}
				if (random == 1) {gif = 'https://imgur.com/iNKKQxv.gif';}
				if (random == 2) {gif = 'https://imgur.com/z4rAT1r.gif';}
				if (random == 3) {gif = 'https://imgur.com/YnVsRk4.gif';}
				if (random == 4) {gif = 'https://imgur.com/3ejgTQ6.gif';}
				if (random == 5) {gif = 'https://imgur.com/KYFDM3V.gif';}
				if (random == 6) {gif = 'https://imgur.com/lYvOupn.gif';}
				if (random == 7) {gif = 'https://imgur.com/zcXhtNP.gif';}
				if (random == 8) {gif = 'https://imgur.com/Yv7BTxg.gif';}
				if (random == 9) {gif = 'https://imgur.com/5vp1At7.gif';}
				if (random == 10) {gif = 'https://imgur.com/vc8MJ9Z.gif';}
				if (random == 11) {gif = 'https://imgur.com/AlKuHJK.gif';}
				if (random == 12) {gif = 'https://imgur.com/9EcuSHQ.gif';}
				if (random == 13) {gif = 'https://imgur.com/Zaun0Dp.gif';}
				if (random == 14) {gif = 'https://imgur.com/kL7VL1c.gif';}
				if (random == 15) {gif = 'https://imgur.com/J9ZIPNc.gif';}
				if (random == 16) {gif = 'https://imgur.com/iRVFwFu.gif';}
				if (random == 17) {gif = 'https://imgur.com/xlDT3hM.gif';}
				if (random == 18) {gif = 'https://imgur.com/ioF96Yc.gif';}
				if (random == 19) {gif = 'https://imgur.com/Zf76Xh5.gif';}
				if (random == 20) {gif = 'https://imgur.com/uTY4ArY.gif';}
				if (random == 21) {gif = 'https://imgur.com/DU5QxVt.gif';}
				if (random == 22) {gif = 'https://imgur.com/xe8Hbdo.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'highfive') {
				random = Math.round(Math.random() * 6);
				let gif = '';
				let Text = `${msg.author} highfives ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Highfives you*');
				}

				if (random == 0) {gif = 'https://imgur.com/HCVPExE.gif';}
				if (random == 1) {gif = 'https://imgur.com/lorZArB.gif';}
				if (random == 2) {gif = 'https://imgur.com/c0o55ht.gif';}
				if (random == 3) {gif = 'https://imgur.com/EY3E6Pr.gif';}
				if (random == 4) {gif = 'https://imgur.com/FMaovBN.gif';}
				if (random == 5) {gif = 'https://imgur.com/bqTG8vE.gif';}
				if (random == 6) {gif = 'https://imgur.com/pxCP8O4.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 === 'bonk') {
				random = Math.round(Math.random() * 6);
				let gif = '';
				let Text = `${msg.author} bonks ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Bonks you*');
				}

				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289436987555950/tenor_-_2020-07-24T203041.175.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289443014770789/tenor_-_2020-07-24T203032.745.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289447116537936/tenor_-_2020-07-24T203049.272.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289454842445944/tenor_-_2020-07-24T203046.597.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289455844884510/tenor_-_2020-07-24T203052.337.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289456545333289/tenor_-_2020-07-24T203043.765.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/726252103302905907/736289456990060624/tenor_-_2020-07-24T203058.934.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 == 'feed') {
				random = Math.round(Math.random() * 20);
				let gif = '';
				let Text = `${msg.author} feeds ${continued}`;
				if (!continued.includes('<@')) { replier('You need to mention a user');
					return;}
				if (continued.includes(msg.author.id) ) {
					(Text = '*Feeds you*');
				}

				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678431709855855/tenor_-_2020-07-25T221634.366.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678442665246801/tenor_-_2020-07-25T221626.177.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678449900683324/tenor_-_2020-07-25T221631.846.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678465910210741/tenor_-_2020-07-25T221639.854.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678466476310538/tenor_-_2020-07-25T221629.159.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678474948935680/tenor_-_2020-07-25T221619.519.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678481802559598/tenor_-_2020-07-25T221637.110.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678490161676319/tenor_-_2020-07-25T221623.488.gif';}
				if (random == 8) {gif = 'https://cdn.discordapp.com/attachments/705095466358145035/736678490744684584/tenor_-_2020-07-25T221616.297.gif';}
				if (random > 8) {gif = Neko.feed();}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 == 'ayaya') {
				random = Math.round(Math.random() * 6);
				let gif = '';
				let Text = `${msg.author} **AYAYA!**'s at ${continued}`;
				if (!continued.includes('<@')) { 
					Text = '**AYAYA!**';}
				if (continued.includes(msg.author.id) ) {
					Text = '**AYAYA!**';
				}
				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768450932211732/tenor_54.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768451192127518/tenor_56.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768451582853160/tenor_55.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768454195904522/tenor_52.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768452718460959/tenor_53.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768454724124712/tenor_57.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825768456070103040/tenor_51.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 == 'woof') {
				random = Math.round(Math.random() * 6);
				let gif = '';
				let Text = `${msg.author} woofs at ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} woofs!`;
				}
				if (continued.includes(msg.author.id) ) {
					Text = '*Woof*';
				}
				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773975815979028/tenor_64.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773976747507822/tenor_62.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773979162640384/tenor_61.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773976374345728/tenor_63.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773981973479455/tenor_59.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773982321737768/tenor_60.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825773984963756072/tenor_58.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			if (command1 == 'nya') {
				random = Math.round(Math.random() * 8);
				let gif = '';
				let Text = `${msg.author} nyas at ${continued}`;
				if (!continued.includes('<@')) { Text = `${msg.author} Meow~!`;
				}
				if (continued.includes(msg.author.id) ) {
					Text = 'Meow~';
				}
				if (random == 0) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788696631574608/tenor_74.gif';}
				if (random == 1) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788700628746240/tenor_65.gif';}
				if (random == 2) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788699462991912/tenor_69.gif';}
				if (random == 3) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788700562554900/tenor_73.gif';}
				if (random == 4) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788700834660352/tenor_68.gif';}
				if (random == 5) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788702323376158/tenor_67.gif';}
				if (random == 6) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788713640001595/tenor_71.gif';}
				if (random == 7) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788705046396948/tenor_66.gif';}
				if (random == 8) {gif = 'https://cdn.discordapp.com/attachments/760152457799401532/825788702071455744/tenor_70.gif';}
				processedInteraction2Function(Text, gif, CD);
			}
			
			function processedInteraction2Function(Text, gif, CD) {
				pool.query(`SELECT mode FROM interactionsmode WHERE guildid = '${msg.guild.id}'`, (err, result) => {
					const restext = `${result.rows[0]}`;
					if (restext == 'undefined' || result.rows[0].mode == true) {
						ProcessedSmall(Text, gif, CD);
					} else if (result.rows[0].mode == false) {
						ProcessedBig(Text, gif, CD);
					}
	
				});
				function ProcessedSmall(Text, gif, CD) {
					var embed = new Discord.MessageEmbed()
						.setThumbnail(gif)
						.setDescription(Text)
						.setColor('b0ff00');
					msg.channel.send(embed).then(m => {
						if (CD) {
							if (CD > 30000) return;
							setTimeout(() => {
								m.reactions.removeAll().catch(() => {});
							}, CD);
							let emote;
							if (CD == 1000) emote = '762473070841036800';
							if (CD == 2000) emote = '762473168899539012';
							if (CD == 3000) emote = '762473213526933514';
							if (CD == 4000) emote = '762473267474071622';
							if (CD == 5000) emote = '762473533078765591';
							if (CD == 6000) emote = '762473583044722709';
							if (CD == 7000) emote = '762473613529448448';
							if (CD == 8000) emote = '762473646324842536';
							if (CD == 9000) emote = '762473706122641408';
							if (CD == 10000) emote = '762473759541035058';
							if (CD == 11000) emote = '762473793703641109';
							if (CD == 12000) emote = '762473832513536011';
							if (CD == 13000) emote = '762473884145549342';
							if (CD == 14000) emote = '762473930095067136';
							if (CD == 15000) emote = '762473955298115615';
							if (CD == 16000) emote = '762473986747007026';
							if (CD == 17000) emote = '762474020561354773';
							if (CD == 18000) emote = '762474063238791168';
							if (CD == 19000) emote = '762474094125907969';
							if (CD == 20000) emote = '762474157169704960';
							if (CD == 21000) emote = '762474226308481024';
							if (CD == 22000) emote = '762474264170332201';
							if (CD == 23000) emote = '762474291072729098';
							if (CD == 24000) emote = '762474335113838622';
							if (CD == 25000) emote = '762474386317901854';
							if (CD == 26000) emote = '762474415761653782';
							if (CD == 27000) emote = '762474451953647627';
							if (CD == 28000) emote = '762474489404850176';
							if (CD == 29000) emote = '762474518861709332';
							if (CD == 30000) emote = '762474546266898502';
							m.react(emote).catch(() => {}); 
	
						}
					}).catch(() => {});
					
				}
	
	
				function ProcessedBig(Text, gif, CD) {
					let embed = new Discord.MessageEmbed()
						.setImage(gif)
						.setDescription(Text)
						.setColor('b0ff00');
					msg.channel.send(embed).then(m => {
						if (CD) {
							if (CD > 30000) return;
							setTimeout(() => {
								m.reactions.removeAll().catch(() => {});
							}, CD);
							let emote;
							if (CD == 1000) emote = '762473070841036800';
							if (CD == 2000) emote = '762473168899539012';
							if (CD == 3000) emote = '762473213526933514';
							if (CD == 4000) emote = '762473267474071622';
							if (CD == 5000) emote = '762473533078765591';
							if (CD == 6000) emote = '762473583044722709';
							if (CD == 7000) emote = '762473613529448448';
							if (CD == 8000) emote = '762473646324842536';
							if (CD == 9000) emote = '762473706122641408';
							if (CD == 10000) emote = '762473759541035058';
							if (CD == 11000) emote = '762473793703641109';
							if (CD == 12000) emote = '762473832513536011';
							if (CD == 13000) emote = '762473884145549342';
							if (CD == 14000) emote = '762473930095067136';
							if (CD == 15000) emote = '762473955298115615';
							if (CD == 16000) emote = '762473986747007026';
							if (CD == 17000) emote = '762474020561354773';
							if (CD == 18000) emote = '762474063238791168';
							if (CD == 19000) emote = '762474094125907969';
							if (CD == 20000) emote = '762474157169704960';
							if (CD == 21000) emote = '762474226308481024';
							if (CD == 22000) emote = '762474264170332201';
							if (CD == 23000) emote = '762474291072729098';
							if (CD == 24000) emote = '762474335113838622';
							if (CD == 25000) emote = '762474386317901854';
							if (CD == 26000) emote = '762474415761653782';
							if (CD == 27000) emote = '762474451953647627';
							if (CD == 28000) emote = '762474489404850176';
							if (CD == 29000) emote = '762474518861709332';
							if (CD == 30000) emote = '762474546266898502';
							m.react(emote).catch(() => {}); 
	
						}
					}).catch(() => {});
				}
			}
		}
		async function sender(content) {
			const m = await msg.channel.send(content).catch(() => {});
			return(m);
		}
		async function replier(content) {
			const m = await msg.reply(content).catch(() => {});
			return(m);
		}
		async function userhandler() {
			const muserarray = [];
			for (let i = 0; i < args.length; i++) {
				const arg = args[i].replace(/\D+/g, '');
				let muser = await client.users.fetch(arg);
				if (muser && muser.id) muserarray.push(muser);
			}
			const resarray = [];
			for (let j = 0; j < muserarray.length; j++) {
				const res = await pool.query(`SELECT * FROM ship WHERE userid = '${msg.author.id}' AND muserid '${muserarray[j].id}'`);
				if (res) {
					if (res.rows[0]) {
						resarray.push(res);
					} else {
						await pool.query(`INSERT INTO ship (userid, pos, neg, muserid) VALUES ('${msg.author.id}', '0', '0', '${muserarray[j].id}')`);
					}
				}
			}
			return resarray;
		}
	}
};
	