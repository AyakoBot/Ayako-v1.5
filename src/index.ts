import readline from 'readline';
import client from './BaseClient/ErisClient.js';
import './BaseClient/DataBase.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', async (msg) =>
  // eslint-disable-next-line no-eval, no-console
  console.log(msg.includes('await') ? await eval(`(async () => {${msg}})()`) : eval(msg)),
);

process.setMaxListeners(2);

client.eventPaths.forEach(async (path) => {
  const eventName = path.replace('.js', '').split(/\/+/).pop();
  if (!eventName) return;

  const eventHandler = await import('./Events/baseEventHandler.js');

  if (eventName === 'ready') client.once(eventName, (...args) => eventHandler.default(eventName, args));
  else client.on(eventName, (...args) => eventHandler.default(eventName, args));
});

process.on('unhandledRejection', (error) => client.emit('unhandledRejection', error));
process.on('uncaughtException', (error) => console.error('Unhandled Exception', error));
process.on('promiseRejectionHandledWarning', () => {});

client.connect().then(() => {
  console.log(`| Discord Client connected at ${new Date().toUTCString()}`);
});
