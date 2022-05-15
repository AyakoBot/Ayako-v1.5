const readline = require('readline');
const auth = require('./Files/BaseClient/auth.json');
const client = require('./Files/BaseClient/DiscordClient');
require('./Files/BaseClient/DataBase');
client.ch = require('./Files/BaseClient/ClientHelper');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', async (msg) =>
  // eslint-disable-next-line no-eval, no-console
  console.log(msg.includes('await') ? await eval(`(async () => {${msg}})()`) : eval(msg)),
);

process.setMaxListeners(2);

client.eventPaths.forEach((path) => {
  const event = require(path);
  const eventName = path.replace('.js', '').split(/\/+/).pop();

  if (event.once) {
    client.once(eventName, (...args) => (event.execute ? event.execute(...args) : event(...args)));
  } else {
    client.on(eventName, (...args) => (event.execute ? event.execute(...args) : event(...args)));
  }
});

process.on('unhandledRejection', (error) => {
  client.emit('unhandledRejection', error);
});
process.on('uncaughtException', (error) => {
  client.ch.logger('Unhandled Exception', error);
});
process.on('promiseRejectionHandledWarning', () => {});

/*
client.rest.on('request', (request) => {
  require('./Files/Events/REST Events/request')(request);
});

client.rest.on('response', (request, response) => {
  require('./Files/Events/REST Events/response')(request, response);
});

client.eris.on('rawREST', (response) => {
  require('./Files/Events/REST Events/response')(null, response);
});
*/

client.rest.on('rateLimited', (rateLimitInfo) => {
  require('./Files/Events/REST Events/rateLimited')(rateLimitInfo);
});

// Connect to Discord
client.login(auth.token).then(() => {
  // eslint-disable-next-line no-console
  console.log(`| Discord Client connected at ${new Date().toUTCString()}`);
});
