module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	exe(msg) {
		console.log('I was executed!');
	}
};