const Discord = require('discord.js');
module.exports = {
	name: 'workload',
	Category: 'Info',
	description: 'Display the current workload of Ayako on the host machine',
	usage: 'h!workload',
	DMallowed: 'Yes',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		var os = require('os');
		function cpuAverage() {
			var totalIdle = 0, totalTick = 0;
			var cpus = os.cpus();
			for(var i = 0, len = cpus.length; i < len; i++) {
				var cpu = cpus[i];
				for(var type in cpu.times) {
					totalTick += cpu.times[type];
				}     
				totalIdle += cpu.times.idle;
			}
			return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
		}
		var startMeasure = cpuAverage();
		setTimeout(function() { 
			var endMeasure = cpuAverage(); 
			var idleDifference = endMeasure.idle - startMeasure.idle;
			var totalDifference = endMeasure.total - startMeasure.total;
			var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
			const now = Date.now();
			while (Date.now() - now < 500);
/* eslint-disable */
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
          /* eslint-enable */
			const totalmem = os.totalmem() / 1024 / 1024;
			const workloadEmbed = new Discord.MessageEmbed()
				.setColor('#b0ff00')
				.setTitle('Bot Workload')
				.setThumbnail(client.user.displayAvatarURL())
				.setAuthor('Ayako', client.user.displayAvatarURL())
				.addFields(
					{ name: 'RAM usage', value:`${Math.round(used * 100) / 100} MB out of ${Math.round(totalmem * 100) / 100} MB`},
					{ name: 'CPU usage', value:`${percentageCPU}%`},
					{ name: 'Host OS Runtime', value:`${Math.round(os.uptime() / 60 / 60) / 1} hours`}
				)
				.setTimestamp();
			msg.channel.send(workloadEmbed);
		}, 100); 
	}
};