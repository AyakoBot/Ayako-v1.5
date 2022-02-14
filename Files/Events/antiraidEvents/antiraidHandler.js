const Discord = require('discord.js');

module.exports = {
  async execute(joins, guild, r) {
    const language = await guild.client.ch.languageSelector(guild.id);
    const con = guild.client.constants.antiraidMessage;
    const { client } = guild;

    const members = guild.members.cache
      .filter((m) => {
        console.log(m.joinedTimestamp - joins.time);
        if (
          m.joinedTimestamp > joins.time - Number(r.time) / 2 &&
          m.joinedTimestamp < joins.time + Number(r.time) / 2
        ) {
          return m;
        }
        return null;
      })
      .filter((m) => !!m);

    if (members && members.size) {
      executeInterval(guild, language, con, client, r, members);
    }
  },
};

const executeInterval = (guild, language, con, client, r, members) => {
  const lan = language.commands.antiraidHandler;

  if (r.posttof) sendMessage(client, lan, con, r, members);
  if (r.punishmenttof) {
    if (r.punishment) ban(client, guild, language, members);
    if (!r.punishment) kick(client, guild, language, members);
  }
};

const kick = (client, guild, language, members) => {
  client.emit(
    'antiraidKickAdd',
    client.user,
    members.map((u) => u.user.id),
    language.autotypes.antiraid,
    guild,
  );
};

const ban = (client, guild, language, members) => {
  client.emit(
    'antiraidBanAdd',
    client.user,
    members.map((u) => u.user.id),
    language.autotypes.antiraid,
    guild,
  );
};

const sendMessage = (client, lan, con, r, members) => {
  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: lan.debugMessage.author,
      iconURL: con.author.image,
      url: con.author.link,
    })
    .setColor(con.color);
  embed.setDescription(`${lan.debugMessage.description}\n${lan.debugMessage.file}`);

  const channel = client.channels.cache.get(r.postchannel);
  if (channel) {
    const pingRoles = r.pingroles?.map((role) => `<@&${role}>`);
    const pingUsers = r.pingusers?.map((user) => `<@${user}>`);

    const payload = { embeds: [embed], content: `${pingRoles || ''}\n${pingUsers || ''}` };
    payload.files = [
      client.ch.txtFileWriter(
        members.map((u) => `${u.user.id}`),
        'antiraid',
      ),
    ];

    const printIds = new Discord.MessageButton()
      .setLabel(lan.debugMessage.printIDs)
      .setCustomId('antiraid_print_ids')
      .setStyle('SECONDARY')
      .setDisabled(true);

    if (payload.files?.length) {
      printIds.setDisabled(false);
    }

    const massban = new Discord.MessageButton()
      .setLabel(lan.debugMessage.massban)
      .setCustomId('antiraid_massban')
      .setStyle('DANGER');

    payload.components = client.ch.buttonRower([[printIds, massban]]);

    client.ch.send(channel, payload);
  }
};
