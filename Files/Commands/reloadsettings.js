module.exports = {
  name: 'reloadsettings',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['rs'],
  execute(msg) {
    const { args } = msg;
    if (!args.length) {
      return msg.channel.send(`You didn't pass any settings to reload, ${msg.author}!`);
    }

    const editorName = args.slice(0).join(' ').toLowerCase();
    const editor = msg.client.settings.get(editorName);

    if (!editor) {
      return msg.channel.send(`There is no editor with name \`${editorName}\`, ${msg.author}!`);
    }

    delete require.cache[require.resolve(`./settings/editors/${editorName}.js`)];
    try {
      const newEditor = require(`./settings/editors/${editorName}.js`);
      msg.client.settings.set(editorName, newEditor);
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

const getSettings = (msg) => {
  const settings = new Discord.Collection();
  const settingsFiles = fs
    .readdirSync('./Files/Commands/settings/categories')
    .filter((file) => file.endsWith('.js'));

  const settingsFolders = fs
    .readdirSync('./Files/Commands/settings/categories')
    .filter((file) => !file.endsWith('.js'));

  settingsFolders.forEach((folder) => {
    const files = fs
      .readdirSync(`./Files/Commands/settings/categories/${folder}`)
      .filter((file) => file.endsWith('.js'));

    files.forEach((file) => {
      settingsFiles.push([file, folder]);
    });
  });

  settingsFiles.forEach((file) => {
    let settingsFile;
    if (Array.isArray(file)) {
      settingsFile = require(`./settings/categories/${file[1]}/${file[0]}`);
      [file, settingsFile.folder] = file;
    } else {
      settingsFile = require(`./settings/categories/${file}`);
    }
    if (!settingsFile.finished) return;
    settingsFile.name = file.replace('.js', '');

    if (!msg.language.commands.settings[settingsFile.name]) {
      throw new Error(`Couldn't find ${settingsFile.name} in msg.language.commands.settings`);
    }

    settingsFile.category = msg.language.commands.settings[settingsFile.name].category;
    settings.set(file.replace('.js', ''), settingsFile);
  });

  return settings;
};
