module.exports = {
  name: 'help',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['h', 'commands'],
  type: 'info',
  execute: async (msg) => {
    doDefaultEmbed(msg, msg.args[0].toLowerCase());
  },
};

const doDefaultEmbed = (msg, category) => {
    

}