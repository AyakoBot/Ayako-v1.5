const Discord = require('discord.js');

module.exports = {
  async execute(users, guild, r, member) {
    const language = await guild.client.ch.languageSelector(guild.id);
    const lan = language.commands.antiraidHandler;
    const con = guild.client.constants.antiraidMessage;
    const { client } = guild;

    if (r.posttof) sendMessage();
    if (r.bantof) return ban();
    if (r.kicktof) return kick();

    function kick() {
      users.forEach((u) => {
        const user = client.users.cache.get(u);
        const msg = {};
        msg.client = client;
        msg.author = client.user;
        msg.guild = guild;
        msg.lanSettings = language.commands.settings;
        msg.lan = msg.lanSettings.separators;
        msg.language = language;
        client.emit('antiraidKickAdd', client.user, user, language.autotypes.antiraid, msg);
      });
    }

    function ban() {
      users.forEach((u) => {
        const user = client.users.cache.get(u);
        const msg = {};
        msg.client = client;
        msg.author = client.user;
        msg.guild = guild;
        msg.lanSettings = language.commands.settings;
        msg.lan = msg.lanSettings.separators;
        msg.language = language;
        client.emit('antiraidBanAdd', client.user, user, language.autotypes.antiraid, msg);
      });
    }

    function sendMessage() {
      const embed = new Discord.MessageEmbed()
        .setAuthor(lan.debugMessage.author, con.author.image, con.author.link)
        .setColor(con.color)
        .setDescription(
          `${guild.client.ch.stp(lan.debugMessage.description, {
            user: member.user,
          })}\n${guild.ch.makeCodeBlock(users.map((u) => u.id))}`,
        );

      const channel = client.channels.cache.get(r.postchannel);
      if (channel) {
        const pingRoles = r.pingroles.map((role) => `<@&${role}>`);
        const pingUsers = r.pingroles.map((user) => `<@&${user}>`);
        client.ch.send({
          embed: [embed],
          content: `${pingRoles}\n${pingUsers}`,
        });
      }
    }
    return null;
  },
};
