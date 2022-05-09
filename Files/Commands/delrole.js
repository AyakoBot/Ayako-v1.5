const Builders = require('@discordjs/builders');
const stringSimilarity = require('string-similarity');

module.exports = {
  name: 'delrole',
  perm: 268435456n,
  takesFirstArg: true,
  dm: false,
  type: 'roles',
  async execute(msg) {
    const { language, lan } = msg;

    let role = msg.guild.roles.cache.get(msg.args[0].replace(/\D+/g, ''));
    if (!role) {
      const roles = msg.guild.roles.cache.filter((r) =>
        r.name.toLowerCase().includes(msg.args[0].toLowerCase()),
      );
      if (roles.size === 1) role = roles.first();
      else if (roles.size > 1) {
        const res = stringSimilarity.findBestMatch(
          msg.args[0].toLowerCase(),
          roles.map((r) => r.name.toLowerCase()),
        );
        if (res.bestMatch.rating > 0.7) role = roles.find((r) => r.name === res.bestMatch.target);
      }
    }
    if (!role) return msg.client.ch.reply(msg, lan.noRoleFound);

    const embed = new Builders.UnsafeEmbedBuilder();
    if (role.managed) {
      embed
        .setAuthor({
          name: language.error,
          iconURL: msg.client.constants.standard.errorImage,
          url: msg.client.constants.standard.invite,
        })
        .setColor(msg.client.constants.error)
        .setDescription(msg.client.ch.makeUnderlined(msg.language.permissions.error.msg))
        .addFields({
          name: language.problem,
          value: msg.client.ch.makeCodeBlock(lan.error.roleManagedProblem),
        })
        .addFields({
          name: language.solution,
          value: msg.client.ch.makeCodeBlock(lan.error.roleManagedSolution),
        });
      return msg.client.ch.reply(msg, { embeds: [embed] });
    }
    if (msg.guild.me.roles.highest.position <= role.position) {
      embed
        .setAuthor({
          name: language.error,
          iconURL: msg.client.constants.standard.errorImage,
          url: msg.client.constants.standard.invite,
        })
        .setColor(msg.client.constants.error)
        .setDescription(msg.client.ch.makeUnderlined(msg.language.permissions.error.msg))
        .addFields({
          name: language.problem,
          value: msg.client.ch.makeCodeBlock(lan.error.rolePosProblem),
        })
        .addFields({
          name: language.solution,
          value: msg.client.ch.makeCodeBlock(lan.error.rolePosSolution),
        });
      return msg.client.ch.reply(msg, { embeds: [embed] });
    }
    await role.delete().catch(() => {});
    embed.setDescription(msg.client.ch.stp(lan.deleted, { role })).setColor(role.color);
    msg.client.ch.reply(msg, { embeds: [embed] });
    return null;
  },
};
