module.exports = {
  async execute(msg) {
    if (msg.guild && msg.author.discriminator !== '0000') {
      msg.member = await msg.guild.members.fetch(msg.author.id).catch(() => {});
    }
    if (msg.author.discriminator === '0000') return;

    require('./commandHandler').execute(msg);
    require('./afk').execute(msg);
    require('./disboard').execute(msg);
    // require('./leveling').execute(msg);
    require('./blacklist').execute(msg);
    require('./willis').execute(msg);
    require('./DMlog').execute(msg);
    require('./other').execute(msg);
    require('./shoob').execute(msg);
    require('./nadeko').execute(msg);
    require('./antivirus').execute(msg);
    require('./autothreading').execute(msg);
    require('./verificationChannel').execute(msg);
    if (!msg.editedAt) {
      if (msg.client.uptime > 10000) {
        const res = await msg.client.ch.query('SELECT * FROM stats;');
        if (res.rows[0].antispam === true) require('./antispam').execute(msg);
      }
    }
  },
};
