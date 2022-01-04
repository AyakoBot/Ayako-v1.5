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

    const settingName = args.slice(0).join(' ').toLowerCase();
    const setting = msg.client.settings.get(settingName);

    if (!setting) {
      return msg.channel.send(`There is no setting with name \`${settingName}\`, ${msg.author}!`);
    }

    delete require.cache[require.resolve(setting.path)];
    try {
      const newSetting = require(setting.path);
      newSetting.folder = setting.folder;

      msg.client.settings.set(settingName, newSetting);
      msg.channel.send(`Setting \`${settingName}\` was reloaded!`);
    } catch (error) {
      msg.channel.send(
        `There was an error while reloading the Setting \`${settingName}\`:\n${msg.client.ch.makeCodeBlock(
          error.stack,
        )}`,
      );
    }

    return null;
  },
};
