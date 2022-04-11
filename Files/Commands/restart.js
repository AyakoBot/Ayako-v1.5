module.exports = {
  name: 'restart',
  perm: 0,
  dm: true,
  takesFirstArg: false,
  aliases: ['reboot'],
  execute: (msg) => {
    msg.client.ch.reply(msg, 'Restarting Client');
    process.exit();
  },
};
