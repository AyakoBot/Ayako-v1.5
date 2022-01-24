const Discord = require('discord.js');

const cooldowns = new Discord.Collection();

module.exports = {
  async execute(users, guild, r) {
    const language = await guild.client.ch.languageSelector(guild.id);
    const con = guild.client.constants.antiraidMessage;
    const { client } = guild;

    if (!cooldowns.has(guild.id)) {
      cooldowns.set(guild.id, {
        users,
        now: Date.now(),
        interval: executeInterval(guild, language, con, client, r),
      });
    } else {
      const newUsers = [...new Set([...cooldowns.get(guild.id).users, ...users])];

      const object = {
        now: cooldowns.get(guild.id).now,
        users: newUsers,
        interval: executeInterval(guild, language, con, client, r),
      };

      clearInterval(cooldowns.get(guild.id).interval);
      cooldowns.set(guild.id, object);
    }
  },
};

const executeInterval = (guild, language, con, client, r) => {
  const lan = language.commands.antiraidHandler;

  setInterval(() => {
    if (cooldowns.has(guild.id) && Date.now() - cooldowns.get(guild.id).now > 15000) {
      clearInterval(cooldowns.get(guild.id).interval);

      if (r.posttof) sendMessage(client, guild, lan, con, r);
      if (r.punishmenttof) {
        if (r.punishment) ban(client, guild, language);
        if (!r.punishment) kick(client, guild, language);
      }

      cooldowns.delete(guild.id);
    }
  }, 1000);
};

const kick = (client, guild, language) => {
  client.emit(
    'antiraidKickAdd',
    client.user,
    cooldowns.get(guild.id).users.map((u) => u.id),
    language.autotypes.antiraid,
    guild,
  );
};

const ban = (client, guild, language) => {
  client.emit(
    'antiraidBanAdd',
    client.user,
    cooldowns.get(guild.id).users.map((u) => u.id),
    language.autotypes.antiraid,
    guild,
  );
};

const sendMessage = (client, guild, lan, con, r) => {
  let attachment;
  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: lan.debugMessage.author,
      iconURL: con.author.image,
      url: con.author.link,
    })
    .setColor(con.color)
    .setDescription(
      `${lan.debugMessage.description}\n${lan.debugMessage.below}\n${guild.client.ch.makeCodeBlock(
        cooldowns
          .get(guild.id)
          .users.map((u) => `User ID ${u.id} | User Tag: ${client.users.cache.get(u.id)?.tag}`)
          .join(' '),
      )}`,
    );

  if (embed.description.length > 2000) {
    embed.setDescription(`${lan.debugMessage.description}\n${lan.debugMessage.file}`);

    attachment = client.ch.txtFileWriter(
      cooldowns.get(guild.id).users.map((u) => `${u.id}`),
      'antiraid',
    );
  }

  const channel = client.channels.cache.get(r.postchannel);
  if (channel) {
    const pingRoles = r.pingroles?.map((role) => `<@&${role}>`);
    const pingUsers = r.pingusers?.map((user) => `<@${user}>`);

    const payload = { embeds: [embed], content: `${pingRoles || ''}\n${pingUsers || ''}` };
    if (attachment) payload.files = [attachment];

    client.ch.send(channel, payload);
  }
};
