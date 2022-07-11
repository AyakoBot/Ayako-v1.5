export default (message: string, id: number) => {
  // eslint-disable-next-line no-console
  console.log(`[Shard ${id || '-'}] Warn received!\n${message}`);
};
