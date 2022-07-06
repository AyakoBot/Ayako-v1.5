import client from '../../../BaseClient/ErisClient';

export default () => {
  let totalrolecount = 0;
  let totalusers = 0;
  let totalchannelcount = 0;

  client.guilds.forEach((guild) => {
    totalrolecount += guild.roles.size;
    if (guild.memberCount) totalusers += guild.memberCount;
    totalchannelcount += guild.channels.size;
  });

  client.ch.query(
    `UPDATE stats SET usercount = $1, guildcount = $2, channelcount = $3, rolecount = $4, allusers = $5;`,
    [client.users.size, client.guilds.size, totalchannelcount, totalrolecount, totalusers],
  );
};
