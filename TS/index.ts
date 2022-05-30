import readline from 'readline';
import client from './BaseClient/ErisClient';
require('./Files/BaseClient/DataBase');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', async (msg) =>
  // eslint-disable-next-line no-eval, no-console
  console.log(msg.includes('await') ? await eval(`(async () => {${msg}})()`) : eval(msg)),
);

process.setMaxListeners(2);

client.eventPaths.forEach((path) => {
  const eventName = path.replace('.js', '').split(/\/+/).pop();
  const eventHandler = require('./Files/Events/baseEventHandler.ts');

  if (eventName === 'ready') client.once(eventName, (...args) => eventHandler(eventName, args));
  else client.on(eventName, (...args) => eventHandler(eventName, args));
});

process.on('unhandledRejection', (error) => client.emit('unhandledRejection', error));
process.on('uncaughtException', (error) => console.error('Unhandled Exception', error));
process.on('promiseRejectionHandledWarning', () => {});

client.connect().then(() => {
  console.log(`| Discord Client connected at ${new Date().toUTCString()}`);
});
