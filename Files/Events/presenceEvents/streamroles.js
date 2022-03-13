module.exports = (oldPresence, newPresence) => {
  if (
    !oldPresence?.activities.find((a) => a.name === 'Twitch') &&
    newPresence?.activities.find((a) => a.name === 'Twitch')
  ) {
    giveRoles(newPresence);
  }
  if (
    oldPresence?.activities.find((a) => a.name === 'Twitch') &&
    !newPresence?.activities.find((a) => a.name === 'Twitch')
  ) {
    removeRoles(newPresence);
  }
};

const giveRoles = async (presence) => {
  const row = await getRows(presence);
  if (row && row.streamroles && row.streamroles.length) {
    presence.member.roles.add(row.streamroles).catch((e) => {
      console.log(e);
    });
  }
};

const removeRoles = async (presence) => {
  const row = await getRows(presence);
  if (row && row.streamroles && row.streamroles.length) {
    presence.member.roles.remove(row.streamroles).catch((e) => {
      console.log(e);
    });
  }
};

const getRows = async (presence) => {
  const res = await presence.client.ch.query(
    `SELECT streamroles FROM guildsettings WHERE guildid = $1;`,
    [presence.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
