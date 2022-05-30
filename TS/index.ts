import readline from 'readline';
import client from './BaseClient/ErisClient';
require('./Files/BaseClient/DataBase');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', async (msg) =>
  console.log(msg.includes('await') ? await eval(`(async () => {${msg}})()`) : eval(msg)),
);

process.setMaxListeners(2);

client.eventPaths.forEach((path: string) => {
  const eventName = path.replace('.js', '').split(/\/+/).pop();
  const eventHandler = require('./Files/Events/baseEventHandler');

  if (!eventName) return;

  if (eventName === 'ready') client.once(eventName, (...args: []) => eventHandler(eventName, args));
  else client.on(eventName, (...args: []) => eventHandler(eventName, args));
});

process.on('unhandledRejection', (error) => {
  client.emit('unhandledRejection', error);
});

process.on('uncaughtException', (error) => {
  console.log('Unhandled Exception', error);
});

process.on('promiseRejectionHandledWarning', () => {});

client.connect().then(() => {
  console.log(`| Discord Client connected at ${new Date().toUTCString()}`);
});
