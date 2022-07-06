export default (log: Error) => {
  if (String(log).includes('Connection reset by peer')) {
    process.exit();
    return;
  }
  // eslint-disable-next-line no-console
  console.log(log);
};
