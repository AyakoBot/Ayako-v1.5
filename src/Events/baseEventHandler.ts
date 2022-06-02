import client from '../BaseClient/ErisClient';

export default async (name: string, args: unknown[]) => {
  const path = client.eventPaths.find((p) => p.endsWith(`${name}.js`));
  if (!path) return;

  const event = (await import(path)).default;
  event(...args);
};
