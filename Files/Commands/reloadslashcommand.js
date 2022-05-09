const fs = require('fs');

module.exports = {
  name: 'reloadslashcommand',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['rsc'],
  type: 'owner',
  execute(msg) {
    const { args } = msg;
    if (!args.length) {
      return msg.channel.send(`You didn't pass any Slash Command to reload, ${msg.author}!`);
    }
    if (args[0].toLowerCase() === 'all') {
      const commandFiles = fs
        .readdirSync('./Files/Interactions/SlashCommands')
        .filter((file) => file.endsWith('.js'));
      let i = 0;
      let o = 0;
      commandFiles.forEach((file) => {
        i += 1;
        delete require.cache[require.resolve(`../Interactions/SlashCommands/${file}`)];
        try {
          const newCommand = require(`../Interactions/SlashCommands/${file}`);
          msg.client.slashCommands.set(newCommand.name, newCommand);
        } catch (error) {
          msg.channel.send(
            `There was an error while reloading a Slash Command \`${file.replace(
              '.js',
              '',
            )}\`:\n${msg.client.ch.makeCodeBlock(error.stack)}`,
          );
          i -= 1;
          o += 1;
        }
      });
      if (o > 0) {
        msg.channel.send(
          `Reloaded ${i} Slash Command files\nFailed to reload ${o} Slash Command files`,
        );
      } else msg.channel.send(`Reloaded ${i} Slash Command files`);
    } else {
      const commandName = args.slice(0).join(' ').toLowerCase();
      const command =
        msg.client.slashCommands.get(commandName) ||
        msg.client.slashCommands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
      if (!command) {
        return msg.channel.send(
          `There is no Slash Command with name or alias \`${commandName}\`, ${msg.author}!`,
        );
      }
      delete require.cache[require.resolve(`../Interactions/SlashCommands/${command.name}.js`)];
      try {
        const newCommand = require(`../Interactions/SlashCommands/${command.name}.js`);
        msg.client.slashCommands.set(newCommand.name, newCommand);
        msg.channel.send(`Slash Command \`${command.name}\` was reloaded!`);
      } catch (error) {
        msg.channel.send(
          `There was an error while reloading a Slash Command \`${
            command.name
          }\`:\n${msg.client.ch.makeCodeBlock(error.stack)}`,
        );
      }
    }
    return null;
  },
};
