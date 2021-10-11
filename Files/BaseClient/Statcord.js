const Statcord = require('statcord.js');
const auth = require('./auth.json');
const client = require('./DiscordClient.js');
const ch = require('./ClientHelper.js');

//Create Statcord Client
const statcord = new Statcord.Client({
	client,
	key: auth.statcordKey,
	postCpuStatistics: true,
	postMemStatistics: true,
	postNetworkStatistics: true,
});

statcord.on('autopost-start', () =>{
	ch.logger('Started autopost', null);
});

module.exports = { statcord };