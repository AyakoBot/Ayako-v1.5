module.exports = {
  name: 'reloadeditor',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['re'],
  execute(msg) {
    const { args } = msg;
    if (!args.length) {
      return msg.channel.send(`You didn't pass any editor to reload, ${msg.author}!`);
    }
    const editorName = args.slice(0).join(' ').toLowerCase();
    const editor = msg.client.settingsEditors.get(editorName);
    if (!editor) {
      return msg.channel.send(`There is no editor with name \`${editorName}\`, ${msg.author}!`);
    }
    delete require.cache[require.resolve(`./settings/editors/${editorName}.js`)];
    try {
      const newEditor = require(`./settings/editors/${editorName}.js`);
      msg.client.commands.set(editorName, newEditor);
      msg.channel.send(`Editor \`${editorName}\` was reloaded!`);
    } catch (error) {
      msg.channel.send(
        `There was an error while reloading the editor \`${editorName}\`:\n${msg.client.ch.makeCodeBlock(
          error.stack,
        )}`,
      );
    }

    return null;
  },
};
