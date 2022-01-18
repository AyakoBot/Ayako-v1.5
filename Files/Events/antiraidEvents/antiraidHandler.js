const Discord = require('discord.js');

const cooldowns = new Discord.Collection();

module.exports = {
  async execute(users, guild, r) {
    const language = await guild.client.ch.languageSelector(guild.id);
    const lan = language.commands.antiraidHandler;
    const con = guild.client.constants.antiraidMessage;
    const { client } = guild;

    if (r.posttof) sendMessage();
    if (r.punishmenttof) {
      if (r.punishment) return ban();
      if (!r.punishment) return kick();
    }
    return null;

    function kick() {
      client.emit(
        'antiraidKickAdd',
        client.user,
        users.map((u) => u.id),
        language.autotypes.antiraid,
        guild,
      );
    }

    function ban() {
      client.emit(
        'antiraidBanAdd',
        client.user,
        users.map((u) => u.id),
        language.autotypes.antiraid,
        guild,
      );
    }

    function sendMessage() {
      if (!cooldowns.has(guild.id)) {
        cooldowns.set(guild.id, {
          users,
          now: Date.now(),
          interval: executeInterval(guild, lan, con, client, r),
        });
      } else {
        const newUsers = [...cooldowns.get(guild.id).users, ...users];

        const object = {
          now: cooldowns.get(guild.id).now,
          users: newUsers,
          interval: executeInterval(guild, lan, con, client, r),
        };

        clearInterval(cooldowns.get(guild.id).interval);
        cooldowns.set(guild.id, object);
      }
    }
  },
};

const executeInterval = (guild, lan, con, client, r) => {
  setInterval(() => {
    if (cooldowns.has(guild.id) && Date.now() - cooldowns.get(guild.id).now > 15000) {
      clearInterval(cooldowns.get(guild.id).interval);

      let path;
      const embed = new Discord.MessageEmbed()
        .setAuthor({
          name: lan.debugMessage.author,
          iconURL: con.author.image,
          url: con.author.link,
        })
        .setColor(con.color)
        .setDescription(
          `${lan.debugMessage.description}\n${
            lan.debugMessage.below
          }\n${guild.client.ch.makeCodeBlock(
            cooldowns
              .get(guild.id)
              .users.map((u) => `User ID ${u.id} | User Tag: ${client.users.cache.get(u.id)?.tag}`)
              .join(' '),
          )}`,
        );

      if (embed.description.length > 2000) {
        embed.setDescription(`${lan.debugMessage.description}\n${lan.debugMessage.file}`);

        path = client.ch.txtFileWriter(
          guild,
          [...new Set(cooldowns.get(guild.id).users)].map((u) => `${u.id}`),
          'antiraid',
        );
      }

      cooldowns.delete(guild.id);

      const channel = client.channels.cache.get(r.postchannel);
      if (channel) {
        const pingRoles = r.pingroles?.map((role) => `<@&${role}>`);
        const pingUsers = r.pingusers?.map((user) => `<@${user}>`);

        const payload = { embeds: [embed], content: `${pingRoles || ''}\n${pingUsers || ''}` };
        if (path) payload.files = [path];

        client.ch.send(channel, payload);
      }
    }
  }, 1000);
};
