export default (error: Error, id: number) => {
  // eslint-disable-next-line no-console
  console.log(`[Shard ${id || '-'}] Disconnected!${error ? `\n${error}` : ''}`);
};
