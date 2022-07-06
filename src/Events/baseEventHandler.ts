import client from '../BaseClient/ErisClient';

export default async (eventName: string, args: unknown[]) => {
  const path = client.eventPaths.find((p) => p.endsWith(`${eventName}.js`));
  if (!path) return;

  const eventToRun = (await import(path)).default;
  eventToRun(...args);
};
