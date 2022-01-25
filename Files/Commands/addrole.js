const Discord = require('discord.js');

const re = /[0-9A-Fa-f]{6}/g;

module.exports = {
  name: 'addrole',
  perm: 268435456n,
  takesFirstArg: true,
  dm: false,
  type: 'util',
  async execute(msg) {
    const color = re.test(msg.args[0]) ? msg.args[0] : '||000000';
    let RoleName;
    if (color === '||000000') RoleName = msg.args.slice(0).join(' ');
    else RoleName = msg.args.slice(1).join(' ');
    const { lan } = msg;
    if (!RoleName) return msg.client.ch.reply(msg, lan.noName);
    const role = await msg.guild.roles
      .create({
        name: `${RoleName}`,
        color: color.replace('||', ''),
        reason: msg.client.ch.stp(lan.reason, { user: msg.author }),
      })
      .catch(() => {});
    const embed = new Discord.MessageEmbed()
      .setDescription(msg.client.ch.stp(lan.created, { role }))
      .setColor(color);
    return msg.client.ch.reply(msg, { embeds: [embed] });
  },
};
