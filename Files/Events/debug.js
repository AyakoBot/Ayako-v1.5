const auth = require('../BaseClient/auth.json');

module.exports = {
  async execute(log) {
    // eslint-disable-next-line global-require
    const client = require('../BaseClient/DiscordClient');
    if (`${log}`.includes('Tried to send packet')) {
      client.destroy();
      return client.login(auth.token);
    }
    if (log.includes('Heartbeat') && log.includes('latency'))
      client.ch.query('UPDATE stats SET heartbeat = $1;', [log.replace(/\D+/g, '')]);
    const res = await client.ch.query('SELECT * FROM stats;');
    if (res?.rows[0]?.verbosity) console.log(log);
    return null;
  },
};
