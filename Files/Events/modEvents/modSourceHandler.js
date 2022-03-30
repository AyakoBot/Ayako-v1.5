const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(msg, embed) {
    let minimizeTimeout = 0;
    let deleteTimeout = 0;

    switch (msg.source) {
      case 'antivirus': {
        minimizeTimeout = Number(msg.r.minimize);
        deleteTimeout = Number(msg.r.delete);

        if (deleteTimeout <= minimizeTimeout) {
          jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
            msg.m?.delete().catch(() => {});
          });
        } else {
          embed = new Builders.UnsafeEmbedBuilder(embed).setDescription(embed.fields[0].value);
          embed.fields = [];

          jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
            msg.m.edit({ embeds: [embed] }).catch(() => {});
          });

          jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
            msg.m?.delete().catch(() => {});
          });
        }

        break;
      }
      default: {
        break;
      }
    }
  },
};
