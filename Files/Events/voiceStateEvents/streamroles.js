module.exports = (oldState, newState) => {
  if ((!oldState.streaming || !oldState.channel) && newState.streaming) giveRoles(newState);
  if (oldState.streaming && (!newState.streaming || !newState.channel)) removeRoles(newState);
};

const giveRoles = async (state) => {
  const row = await getRows(state);
  if (row && row.streamroles && row.streamroles.length) {
    state.member.roles.add(row.streamroles).catch((e) => {
      console.log(e);
    });
  }
};

const removeRoles = async (state) => {
  const row = await getRows(state);
  if (row && row.streamroles && row.streamroles.length) {
    state.member.roles.remove(row.streamroles).catch((e) => {
      console.log(e);
    });
  }
};

const getRows = async (state) => {
  const res = await state.client.ch.query(
    `SELECT streamroles FROM guildsettings WHERE guildid = $1;`,
    [state.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
