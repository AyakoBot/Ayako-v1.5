const Discord = require('discord.js');

const antiraidCache = new Discord.Collection();
const sendings = new Discord.Collection();

module.exports = {
  async execute(member) {
    if (!member || !member.guild) return;

    const res = await member.client.ch.query(
      'SELECT * FROM antiraidsettings WHERE guildid = $1 AND active = true;',
      [member.guild.id],
    );
    if (!res || res.rowCount === 0) return;

    this.addMember(member, res.rows[0]);
    this.check(member, res.rows[0]);
  },
  addMember(member, r) {
    if (antiraidCache.has(member.guild.id)) {
      clearTimeout(antiraidCache.get(member.guild.id).timeout);
    }

    const cache = antiraidCache.get(member.guild.id);
    antiraidCache.set(member.guild.id, {
      members: cache ? [...new Set([...cache.members, member.user.id])] : [member.user.id],
      time: member.joinedTimestamp,
      joins: (cache?.joins || 0) + 1,
      timeout: setTimeout(() => {
        antiraidCache.delete(member.guild.id);
      }, r.time),
    });
  },
  check(member, r) {
    if (!antiraidCache.has(member.guild.id)) return null;

    const cache = antiraidCache.get(member.guild.id);

    if (cache.joins >= Number(r.jointhreshold)) {
      if (sendings.has(member.guild.id)) {
        clearTimeout(sendings.get(member.guild.id).timeout);
      }

      const oldSettings = sendings.get(member.guild.id);
      sendings.set(member.guild.id, {
        members: oldSettings
          ? [...new Set([...oldSettings.members, ...cache.members])]
          : cache.members,
        time: cache.time,
        joins: cache.joins,
        timeout: setTimeout(() => {
          member.client.emit('antiraidHandler', sendings.get(member.guild.id), member.guild, r);
          antiraidCache.delete(member.guild.id);
        }, r.time),
      });
    }

    return null;
  },
};
