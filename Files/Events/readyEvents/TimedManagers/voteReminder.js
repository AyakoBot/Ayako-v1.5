const Discord = require('discord.js');

module.exports = {
	async execute() {
		const { client } = require('../../../BaseClient/DiscordClient');
		const ch = client.ch;
		const Constants = client.constants;
		const res = await ch.query('SELECT * FROM levelglobal WHERE reminderdone = \'false\';');
		if (res && res.rowCount > 0) {
			for (let i = 0; i < res.rowCount; i++) {
				const r = res.rows[i];
				const userid = r.userid;
				const reminder = r.reminder;
				const runsoutat = r.runsoutat;
				const votegain = r.votegain;
				const reminderdone = r.reminderdone;
				if (Date.now() > +reminder && reminderdone == false) {
					const user = await client.users.fetch(userid);
					const DMchannel = await user.createDM().catch(() => {});
					const language = await ch.languageSelector('en');
					const reEmbed = new Discord.MessageEmbed()
						.setAuthor(language.ready.vote.author, Constants.standard.image, Constants.standard.invite)
						.setDescription(ch.stp(language.ready.vote.description, {votegain: votegain}))
						.setColor(Constants.standard.color)
						.setTimestamp();
					ch.send(DMchannel, reEmbed);
					ch.query('UPDATE levelglobal SET reminderdone = $1 WHERE userid = $2;', [true, user.id]);
				}
				if (Date.now() > +runsoutat && reminderdone == true && votegain !== 1.0) ch.query('UPDATE levelglobal SET votegain = $1 WHERE userid = $2;', [1.0, userid]);
			}
		}
	}
};
