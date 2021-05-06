module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 8n, 
	category: 'Owner',
	description: 'Unspecified',
	usage: 'h!execute (options)',
	exe(msg) {
        console.log('I was executed!');
	}
};