const os = require('os');
const Discord = require('discord.js');

module.exports = {
	name: 'workload',
	perm: null,
	dm: true,
	takesFirstArg: false,
	aliases: [],
	async execute(msg) {
		const startMeasure = cpuAverage();

		const m = await msg.client.ch.reply(msg, await msg.client.ch.loadingEmbed(msg.lan, msg.guild));

		setTimeout(function () {
			const endMeasure = cpuAverage();
			const idleDifference = endMeasure.idle - startMeasure.idle;
			const totalDifference = endMeasure.total - startMeasure.total;
			const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

			const now = Date.now();
			while (Date.now() - now < 500);

			// eslint-disable-next-line no-undef
			const used = process.memoryUsage().heapUsed / 1024 / 1024;
			const totalmem = os.totalmem() / 1024 / 1024;

			const embed = new Discord.MessageEmbed(m.embeds[0])
				.setAuthor(msg.lan.author, msg.client.constants.emotes.workloadLink, msg.client.constants.standard.invite)
				.addFields(
					{ name: msg.lan.RAM.name, value: msg.client.ch.stp(msg.lan.RAM.value, { used: Math.round(used * 100) / 100, total: Math.round(totalmem * 100) / 100})},
					{ name: msg.lan.CPU, value: `${percentageCPU}%` },
					{ name: 'Host OS Runtime', value: `${Math.round(os.uptime() / 60 / 60) / 1} ${msg.language.time.hours}` }
				);
			embed.description = null;

			m.edit({embeds: [embed]}).catch((() => {}));

		}, 100);
        
	}
};

function cpuAverage() {
	let totalIdle = 0, totalTick = 0;
	const cpus = os.cpus();
	for (let i = 0, len = cpus.length; i < len; i++) {
		const cpu = cpus[i];
		for (const type in cpu.times) {
			totalTick += cpu.times[type];
		}
		totalIdle += cpu.times.idle;
	}
	return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}