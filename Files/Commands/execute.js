module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async execute(msg) {

		msg.channel.send({content: 'yes'});
		msg.channel.send('no');
		
	}
};