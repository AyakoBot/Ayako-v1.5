module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	execute(msg) {
		msg.client.eris.createMessage(msg.channel.id, 'no').then((m) => console.log(m));
		msg.channel.send({ content: 'yes' }).then((m) => console.log(m));
	}
};