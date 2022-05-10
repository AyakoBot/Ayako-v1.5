const readline = require('readline');
const auth = require('./Files/BaseClient/auth.json');
const client = require('./Files/BaseClient/DiscordClient');
require('./Files/BaseClient/DataBase');

client.ch = require('./Files/BaseClient/ClientHelper');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// eslint-disable-next-line no-eval, no-console
rl.on('line', async (msg) => console.log(await eval(`(async () => {${msg}})()`)));

process.setMaxListeners(2);

[...client.events.entries()].forEach((rawevent) => {
  const event = client.events.get(rawevent[0]);
  if (event.once) {
    client.once(rawevent[0], (...args) =>
      event.execute ? event.execute(...args) : event(...args),
    );
  } else {
    client.on(rawevent[0], (...args) => (event.execute ? event.execute(...args) : event(...args)));
  }
});

process.on('unhandledRejection', (error) => {
  client.emit('unhandledRejection', error);
});
process.on('uncaughtException', (error) => {
  client.ch.logger('Unhandled Exception', error);
});
process.on('promiseRejectionHandledWarning', () => {});

client.rest.on('request', (request) => {
  require('./Files/Events/REST Events/request')(request);
});

client.rest.on('response', (request, response) => {
  require('./Files/Events/REST Events/response')(request, response);
});

client.rest.on('rateLimited', (rateLimitInfo) => {
  require('./Files/Events/REST Events/rateLimited')(rateLimitInfo);
});

// Connect to Discord
client.login(auth.token).then(() => {
  // eslint-disable-next-line no-console
  console.log(`| Discord Client connected at ${new Date().toUTCString()}`);
});
