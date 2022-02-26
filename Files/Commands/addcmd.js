module.exports = {
  name: 'addcmd',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  execute(msg) {
    const { args } = msg;
    if (!args[0]) return msg.client.ch.reply(msg, 'Please enter a valid command');
    const newCommand = require(`./${args[0]}.js`);
    try {
      msg.client.commands.set(newCommand.name, newCommand);
      msg.client.ch.reply(msg, `Command \`${newCommand.name}\` was added!`);
    } catch (error) {
      msg.client.ch.reply(
        msg,
        `There was an error while adding a command \`${args[0]}\`:\n${msg.client.ch.makeCodeBlock(
          error.stack,
        )}`,
      );
    }
    return null;
  },
};
