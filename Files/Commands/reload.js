
const fs = require('fs');

module.exports = {
  name: 'reload',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['r'],
  execute(msg) {
    const { args } = msg;
    if (!args.length)
      return msg.channel.send(`You didn't pass any command to reload, ${msg.author}!`);
    if (args[0].toLowerCase() === 'all') {
      const commandFiles = fs
        .readdirSync('./Files/Commands')
        .filter((file) => file.endsWith('.js'));
      let i = 0;
      let o = 0;
      commandFiles.forEach((file) => {
        i += 1;
        delete require.cache[require.resolve(`./${file}`)];
        try {
          const newCommand = require(`./${file}`);
          msg.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
          msg.channel.send(
            `There was an error while reloading a command \`${file.replace(
              '.js',
              '',
            )}\`:\n${msg.client.ch.makeCodeBlock(error.stack)}`,
          );
          i -= 1;
          o += 1;
        }
      });
      if (o > 0)
        msg.channel.send(`Reloaded ${i} command files\nFailed to reload ${o} command files`);
      else msg.channel.send(`Reloaded ${i} command files`);
    } else {
      const commandName = args.slice(0).join(' ').toLowerCase();
      const command =
        msg.client.commands.get(commandName) ||
        msg.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
      if (!command)
        return msg.channel.send(
          `There is no command with name or alias \`${commandName}\`, ${msg.author}!`,
        );
      delete require.cache[require.resolve(`./${command.name}.js`)];
      try {
        const newCommand = require(`./${command.name}.js`);
        msg.client.commands.set(newCommand.name, newCommand);
        msg.channel.send(`Command \`${command.name}\` was reloaded!`);
      } catch (error) {
        msg.channel.send(
          `There was an error while reloading a command \`${
            command.name
          }\`:\n${msg.client.ch.makeCodeBlock(error.stack)}`,
        );
      }
    }
    return null;
  },
};
