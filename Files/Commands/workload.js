const os = require('os');
const Discord = require('discord.js');

module.exports = {
  name: 'workload',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: [],
  type: 'info',
  async execute(msg) {
    const startMeasure = cpuAverage();

    const m = await msg.client.ch.reply(msg, {
      embeds: [await msg.client.ch.loadingEmbed(msg.lan, msg.guild)],
    });

    const endMeasure = cpuAverage();
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    const percentageCPU = 100 - ~~((100 * idleDifference) / totalDifference);

    const now = Date.now();
    while (Date.now() - now < 500);

    // eslint-disable-next-line no-undef
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalmem = os.totalmem() / 1024 / 1024;

    const embed = new Discord.Embed(m.embeds[0])
      .setAuthor({
        name: msg.lan.author,
        iconURL: msg.client.constants.emotes.workloadLink,
        url: msg.client.constants.standard.invite,
      })
      .addFieldss([
        {
          name: msg.lan.RAM.name,
          value: msg.client.ch.stp(msg.lan.RAM.value, {
            used: Math.round(used * 100) / 100,
            total: Math.round(totalmem * 100) / 100,
          }),
        },
        { name: msg.lan.CPU, value: `${percentageCPU}%` },
        {
          name: 'Host OS Runtime',
          value: `${Math.round(os.uptime() / 60 / 60) / 1} ${msg.language.time.hours}`,
        },
      ]);
    embed.description = null;

    m.edit({ embeds: [embed] }).catch(() => {});
  },
};

const cpuAverage = () => {
  let totalIdle = 0;
  let totalTick = 0;
  const cpus = os.cpus();
  cpus.forEach((cpu) => {
    Object.keys(cpu.times).forEach((type) => {
      totalTick += cpu.times[type];
    });
    totalIdle += cpu.times.idle;
  });
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
};
