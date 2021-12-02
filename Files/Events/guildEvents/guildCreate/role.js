module.exports = {
  async execute(guild) {
    setTimeout(() => {
      const role = guild.roles.cache.find((r) => r.name === guild.client.constants.standard.color);
      if (role && role.id) {
        role.edit({ color: guild.client.constants.guildCreate.logEmbed.color }).catch(() => {});
      }
    }, 600000);
  },
};
