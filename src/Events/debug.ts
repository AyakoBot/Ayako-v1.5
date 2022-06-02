export default (log: string, id: number) => {
  // eslint-disable-next-line no-console
  console.log(`[Shard ${id}]: ${log}`);
};
