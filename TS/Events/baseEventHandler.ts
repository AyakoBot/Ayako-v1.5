import client from '../BaseClient/ErisClient';

export default (name: string, args: any[]) => {
  const path = client.eventPaths.find((p) => p.endsWith(`${name}.js`));
  if (!path) return;

  const event = require(path);

  if (event.execute) event.execute(...args);
  else event(...args);
};
