const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'createvc',
	Category: 'SelfVC',
	description: 'Create a private VC',
	usage: 'h!createvc',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        const res = await pool.query(`SELECT * FROM pvc WHERE guildid = '${msg.guild.id}`)
    }
}