const Discord = require('discord.js');

const antiraidCache = new Discord.Collection();

module.exports = {
  async execute(member) {
    if (!member || !member.guild) return;

    const res = await member.client.ch.query(
      'SELECT * FROM antiraidsettings WHERE guildid = $1 AND active = true;',
      [member.guild.id],
    );
    if (!res || res.rowCount === 0) return;

    this.addMember(member, res.rows[0]);
    const caches = this.check(member, res.rows[0]);

    if (caches) member.client.emit('antiraidHandler', caches, member.guild, res.rows[0], member);
  },
  addMember(member, r) {
    if (!antiraidCache.get(member.guild.id)) {
      antiraidCache.set(member.guild.id, []);
    }
    const guildJoins = antiraidCache.get(member.guild.id);

    const memberObject = {
      id: member.user.id,
      joinedAt: Date.now(),
      joinCount: 1,
      idIdent: member.user.id.slice(0, 3),
      guild: member.guild.id,
      timeout: setTimeout(
        () =>
          guildJoins.length
            ? antiraidCache.delete(member.guild.id)
            : guildJoins.splice(
                guildJoins.findIndex((m) => m.id === member.user.id),
                1,
              ),
        r.time,
      ),
    };

    const exists = guildJoins.findIndex((m) => m.id === member.user.id) !== -1;
    if (exists) {
      const existingMember = guildJoins[guildJoins.findIndex((m) => m.id === member.user.id)];

      clearTimeout(existingMember.timeout);
      existingMember.timeout = setTimeout(
        () =>
          guildJoins.length > 1
            ? antiraidCache.delete(member.guild.id)
            : guildJoins.splice(
                guildJoins.findIndex((m) => m.id === member.user.id),
                1,
              ),
        r.time,
      );

      existingMember.joinCount += 1;
    } else guildJoins.push(memberObject);
  },
  check(member, r) {
    let caches = null;
    const guildJoins = antiraidCache.get(member.guild.id);
    if (guildJoins) {
      if (guildJoins.length >= r.jointhreshold) caches = guildJoins;
      else {
        const findIndexEntries = guildJoins[guildJoins.findIndex((m) => m.id === member.user.id)];
        if (findIndexEntries.joinCount >= r.jointhreshold) caches = [findIndexEntries];
        else {
          const filterEntries = guildJoins.filter((m) => m.idIdent === member.user.id.slice(0, 3));
          if (filterEntries.length >= r.similaridthreshold) caches = filterEntries;
        }
      }
    }
    if (caches?.length) return caches;
    return null;
  },
};
