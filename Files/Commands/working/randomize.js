const { pool } = require('../files/Database');
module.exports = {
	name: 'randomize',
	DMallowed: 'No',
	Category: 'Giveaway',
	description: 'Pick a winner',
	usage: 'h!randomize',
	ThisGuildOnly: ['108176345204264960', '694246293295595611'],
	requiredPermissions: 2,
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        if (msg.guild.id == '108176345204264960') {
            if (msg.author.id !== '108176076261314560' && msg.author.id !== '318453143476371456') return;
            const res = await pool.query(`SELECT * FROM stats`)
            const m = await msg.channel.send('<a:Loading:780543908861182013> Picking a winner...');
            const random = Math.floor(Math.random() * +res.rows[0].willis.length);
            setTimeout(() => {
                m.edit(`<@${res.rows[0].willis[random]}> has won the Giveaway!`);
            }, 2000);
        } else if (msg.author.id == '318453143476371456') {
            if (args.length > 1) {
                const random = Math.floor(Math.random() * (args.length));
                msg.channel.send('Randomized: '+ args[random])
            } else {
                msg.reply('You cant really... Randomize 1 argument');
            }
        }
    }
}