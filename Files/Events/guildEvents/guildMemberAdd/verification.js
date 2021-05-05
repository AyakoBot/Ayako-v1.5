const ch = require('../../../BaseClient/ClientHelper');
const { client } = require('../../../BaseClient/DiscordClient');
const images = require('../../../sources.js');
const Constants = require('../../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(member, user) {
		const guild = member.guild;
		const res = await ch.query(`SELECT * FROM verification WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) {
			startProcess();
		}
		async function startProcess() {
			const DM = user.createDM().catch(() => {});
			const language = await ch.languageSelector(guild);
			const lan = language.guildMemberAddVerification;
			if (member.joinedTimestamp < (+Date.now() - +1800000)) {
				if (await ch.member(guild, user)) {
					let invite = guild.vanityURLCode ? `discord.gg/${guild.vanityURLCode}` : undefined;
					const textchannels = guild.channels.cache.filter((c) => c.type == 'text');
					const map = textchannels.map(x => x);
					for (let i = 0; map.length > i; i++) {
						if (!invite) invite = await map[i].createInvite({maxAge: 1800, reason: ch.stp(lan.kickReason, {user: user})}).catch(() => {});
					}
					if (invite) {
						user.createDM().then(dmChannel => {
							dmChannel.send(`${ch.stp(lan.kickMsg, {guild: guild})} ${invite.url}`).catch(() => {});
						}).catch(() => {});
					}
					member.kick(language.unverifiedTooLong).catch(() => {});
				}
			} else {
				const r = res.rows[0];
				const finishedRole = guild.roles.cache.get(r.finishedRole);
				if (finishedRole && finishedRole.id) {
					const random = Math.round(Math.random() * Object.keys(images.captchas).size-1);
					const image = images.captchas[random].image;
					const solution = images.captchas[random].solution;
					const embed = new Discord.MessageEmbed()
						.setImage(image)
						.setTitle(lan.author.name, Constants.standard.image, Constants.standard.invite)
						.setDescription(r.greetdesc ? r.greetdesc : ch.stp(lan.description, {guild: guild}))
						.addField(lan.hint, lan.hintmsg)
						.addField(lan.field, '\u200b')
						.setColor(Constants.standard.color)
						.setFooter(lan.footer);
					const errorChannel = client.channels.cache.get(r.errorchannel);
					const res = await ch.send(DM, embed);
					if (!res) {
						const m = await ch.send(errorChannel, ch.stp(lan.openDMs, {user: user}));
						if (m && m.id ) setTimeout(() => {m.delete().catch(() => {});}, 60000);
					} else {
						const collected = await DM.awaitMessages(m => m.author.id == user.id, {max: 1, time: 60000}).catch(() => {
							startProcess();
						});
						if (collected) {
							const answer = collected.first().content.toLowerCase();
							if (answer == solution) {
								member.roles.add(finishedRole).catch(() => {});
								const embed2 = new Discord.MessageEmbed()
									.setAuthor(lan.finishedTitle, Constants.standard.image, Constants.standard.invite)
									.setDescription(ch.stp(lan.finishDesc, {finishdesc: r.finishdesc}))
									.setColor('b0ff00');
								ch.send(DM, embed2).catch(() => {});
								if (guild.id == '298954459172700181') ch.send(DM, '🔥 __**The Tribe**__ 🔥\nCome join a friendly anime & flame themed server with over 500 emotes, addicting 24/7 chats and vcs, and giveaways!\nhttps://discord.gg/8EJgFxwRhX');
							} else {
								DM.send(ch.stp(lan.wrongInput, {solution: solution})).catch(() => {});
								startProcess();
							}
						} else {
							startProcess();
						}
					}
				}
			}
		}
	}
};