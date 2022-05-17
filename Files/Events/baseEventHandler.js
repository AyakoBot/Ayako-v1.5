const client = require('../BaseClient/DiscordClient');

module.exports = (name, args) => {
  const path = client.eventPaths.find((p) => p.endsWith(`${name}.js`));
  const event = require(path);

  if (event.execute) event.execute(...args);
  else event(...args);
};
