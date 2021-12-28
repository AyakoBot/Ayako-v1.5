const readline = require('readline');
const auth = require('./Files/BaseClient/auth.json');
const client = require('./Files/BaseClient/DiscordClient');

// Connect to Discord
client.login(auth.token).then(() => {
  console.log(`| Discord Client connected at ${new Date().toUTCString()}`);
});

client.ch = require('./Files/BaseClient/ClientHelper');

client.ch.pathCheck();

// eslint-disable-next-line no-undef
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// eslint-disable-next-line no-eval
rl.on('line', async (msg) => console.log(await eval(`(async () => {${msg}})()`)));

// eslint-disable-next-line no-undef
process.setMaxListeners(2);

[...client.events.entries()].forEach((rawevent) => {
  const event = client.events.get(rawevent[0]);
  if (event.once) client.once(rawevent[0], (...args) => event.execute(...args));
  else client.on(rawevent[0], (...args) => event.execute(...args));
});

// eslint-disable-next-line no-undef
process.on('unhandledRejection', (error) => {
  client.emit('unhandledRejection', error);
});
// eslint-disable-next-line no-undef
process.on('uncaughtException', (error) => {
  client.ch.logger('Unhandled Exception', error);
});

// AP.on('posted', () => {console.log('Posted stats to Top.gg!')})
// const { AP } = require('./Files/BaseClient/DBL');
