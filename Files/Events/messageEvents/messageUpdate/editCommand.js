const fs = require('fs');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(oldMsg, newMsg) {
    const { ch } = client;
    if (!oldMsg || !newMsg || !oldMsg.content || !newMsg.content) return;
    if (oldMsg.content === newMsg.content) return;
    if (oldMsg.pinned !== newMsg.pinned) return;

    let prefix;
    const prefixStandard = client.constants.standard.prefix;
    let prefixCustom;

    if (newMsg.channel.type !== 1) {
      const res = await ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [
        newMsg.guild.id,
      ]);
      if (res && res.rowCount > 0) prefixCustom = res.rows[0].prefix;
    }

    if (newMsg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
    else if (newMsg.content.toLowerCase().startsWith(prefixCustom)) prefix = prefixCustom;
    else return;

    if (!prefix) return;

    const args = newMsg.content.slice(prefix.length).split(/ +/);
    const command = getCommand(newMsg, args);

    if (!command) return;

    client.emit('messageCreate', newMsg);
  },
};

const getCommand = (msg, args) => {
  const dir = `${require.main.path}/Files/Commands`;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  const searchedFileName = args.shift().toLowerCase();

  const file = files
    .map((c) => {
      const possibleFile = require(`${dir}/${c}`);
      if (
        possibleFile.name === searchedFileName ||
        possibleFile.aliases?.includes(searchedFileName)
      ) {
        if (possibleFile.takesFirstArg && !msg.args[0]) {
          msg.triedCMD = possibleFile;
          return require(`${dir}/cmdhelp`);
        }
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)[0];

  return file;
};
