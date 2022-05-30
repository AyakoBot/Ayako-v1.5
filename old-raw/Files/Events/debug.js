const auth = require('../BaseClient/auth.json');

module.exports = {
  async execute(log) {
    const client = require('../BaseClient/DiscordClient');
    if (
      `${log}`.includes('Tried to send packet') ||
      `${log}`.includes('Destroying and reconnecting') ||
      `${log}`.includes('No token available to identify a new session') ||
      `${log}`.includes('Manager was destroyed')
    ) {
      client.destroy();
      client.login(auth.token).catch(() => {});
      return;
    }

    if (log.toLowerCase().includes('heartbeat') && log.includes('latency')) {
      client.ch.query('UPDATE stats SET heartbeat = $1;', [log.split(']')[1].replace(/\D+/g, '')]);
      return;
    }
    if (log.toLowerCase().includes('heartbeat')) return;
    const res = await client.ch.query('SELECT * FROM stats;');
    if (res?.rows[0]?.verbosity) console.log(log);
  },
};
