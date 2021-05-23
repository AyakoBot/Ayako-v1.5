module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	category: 'Owner',
	description: 'Unspecified',
	usage: ['execute (options)'],
	exe(msg) {
		console.log('I was executed!');
	}
};