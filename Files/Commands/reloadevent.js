
const fs = require('fs');

module.exports = {
  name: 'reloadevent',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['rv'],
  execute(msg) {
    const { args } = msg;
    const { client } = msg;
    const { ch } = client;
    if (!args.length) return ch.reply(msg, "You didn't pass anything to reload!");
    const name = args[0].toLowerCase();
    if (name.toLowerCase() === 'constants') {
      delete require.cache[require.resolve('../Constants.json')];
      try {
        client.constants = require('../Constants.json');
        ch.reply(msg, 'File `Constants.json` was reloaded!');
      } catch (e) {
        ch.reply(
          msg,
          `There was an error while reloading the \`Constants.json\`\n${msg.client.ch.makeCodeBlock(
            e.stack,
          )}`,
        );
      }
    } else if (name.toLowerCase() === 'lan') {
      try {
        delete require.cache[require.resolve(`../Languages/lan-${args[1]}.json`)];
        const lan = require(`../Languages/lan-${args[1]}.json`);
        client.languages.set(`lan-${args[1]}`, lan);
        ch.reply(msg, `Language File \`lan-${args[1]}.json\` was reloaded!`);
      } catch (e) {
        if (`${e}`.startsWith('Error: Cannot find module'))
          ch.reply(msg, `There is no Language File called \`lan-${args[1]}.json\``);
        else
          ch.reply(
            msg,
            `There was an error while reloading that Language File \`${name}\`:\n${msg.client.ch.makeCodeBlock(
              e.stack,
            )}`,
          );
      }
    } else if (name.toLowerCase() === 'ch') {
      delete require.cache[require.resolve('../BaseClient/ClientHelper')];
      try {
        client.ch = require('../BaseClient/ClientHelper');
        ch.reply(msg, 'The Client Helper was reloaded!');
      } catch (e) {
        ch.reply(
          msg,
          `There was an error while reloading the ClientHelper:\n${msg.client.ch.makeCodeBlock(
            e.stack,
          )}`,
        );
      }
    } else if (msg.args[0] && msg.args[1]) {
      let mainFolder = msg.args[0].toLowerCase();
      let file;
      let mainSubFolder;
      if (msg.args[2]) {
        mainSubFolder = msg.args[1].toLowerCase();
        file = msg.args[2].toLowerCase();
      } else file = msg.args[1].toLowerCase();
      const mainFolderFS = fs.readdirSync('./Files/Events/');
      mainFolderFS.forEach((folderName, index) => {
        if (folderName.toLowerCase() === `${mainFolder}events`) mainFolder = mainFolderFS[index];
      });
      let PathToReload;
      if (mainSubFolder) {
        const mainSubFolderFS = fs.readdirSync(`./Files/Events/${mainFolder}`);
        mainSubFolderFS.forEach((folderName, index) => {
          if (folderName.toLowerCase() === msg.args[0].toLowerCase() + mainSubFolder)
            mainSubFolder = mainSubFolderFS[index];
        });
        const fileFolderFS = fs.readdirSync(`./Files/Events/${mainFolder}/${mainSubFolder}`);
        fileFolderFS.forEach((fileName, index) => {
          if (fileName.toLowerCase() === `${file}.js`) file = fileFolderFS[index];
        });
        PathToReload = `./Files/Events/${mainFolder}/${mainSubFolder}/${file}`;
      } else {
        const fileFolderFS = fs.readdirSync(`./Files/Events/${mainFolder}`);
        fileFolderFS.forEach((fileName, index) => {
          if (fileName.toLowerCase() === `${msg.args[0].toLowerCase() + file}.js`)
            file = fileFolderFS[index];
        });
        PathToReload = `./Files/Events/${mainFolder}/${file}`;
      }
      PathToReload = PathToReload.replace('/Files', '.');
      const pathToReloadName = PathToReload.split(/\/+/)[
        PathToReload.split(/\/+/).length - 1
      ].replace('.js', '');
      try {
        delete require.cache[require.resolve(PathToReload)];
        require(PathToReload);
        ch.reply(
          msg,
          `The Event \`${pathToReloadName}\` in path \`${PathToReload}\` was reloaded!`,
        );
      } catch (e) {
        ch.reply(
          msg,
          `There was an error while reloading Event \`${pathToReloadName}\` in path \`${PathToReload}\`\n${msg.client.ch.makeCodeBlock(
            e.stack,
          )}`,
        );
      }
    } else {
      const eventArr = [];
      [...client.events.entries()].forEach((rawevent) => {
        if (name === rawevent[0].toLowerCase()) {
          const event = client.events.get(rawevent[0]);
          eventArr.push(rawevent[0]);
          delete require.cache[require.resolve(event.path)];
          try {
            const newEvent = require(event.path);
            newEvent.path = event.path;
            client.events.set(rawevent[0], newEvent);
            ch.reply(
              msg,
              `The Event \`${rawevent[0]}\` in path \`${newEvent.path}\` was reloaded!`,
            );
          } catch (e) {
            ch.reply(
              msg,
              `There was an error while reloading Event \`${rawevent[0]}\` in path \`${
                event.path
              }\`\n${msg.client.ch.makeCodeBlock(e.stack)}`,
            );
          }
        }
      });
      if (!eventArr[0]) ch.reply(msg, `Event \`${name}\` not found.`);
    }
    return null;
  },
};
