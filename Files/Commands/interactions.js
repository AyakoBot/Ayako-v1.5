const fs = require('fs');
const path = require('path');

const files = [];

const aliases = [];
fs.readdirSync(path.join(__dirname, '/interactions')).forEach((fileName) => {
  const file = require(`./interactions/${fileName}`);
  files.push({ name: file.name, aliases: file.aliases });
  if (file.aliases) aliases.push(...file.aliases);
  aliases.push(file.name);
});

module.exports = {
  name: 'interactions',
  aliases,
  perm: null,
  dm: false,
  takesFirstArg: false,
  type: 'fun',
  async execute(msg) {
    const [, prefix] = await require('../Events/messageEvents/messageCreate/commandHandler').prefix(
      msg,
    );
    const args = msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/);
    const usedCommandName = args.shift().toLowerCase();

    const interaction =
      msg.client.interactions.get(usedCommandName) ||
      msg.client.interactions.find((i) => i.aliases.includes(usedCommandName));

    interaction.execute(msg);
  },
};
