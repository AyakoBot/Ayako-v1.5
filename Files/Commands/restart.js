module.exports = {
  name: 'restart',
  perm: 0,
  dm: true,
  takesFirstArg: false,
  aliases: ['reboot'],
  type: 'owner',
  execute: async (msg) => {
    await msg.client.ch.reply(msg, 'Restarting Client');
    process.exit();
  },
};
