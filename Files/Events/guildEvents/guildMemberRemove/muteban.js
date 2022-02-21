module.exports = {
  execute: async (member) => {
    if (!member.communicationDisabledUntilTimestamp) return;

    const res = await member.client.ch.query(
      `SELECT * FROM modsettings WHERE muteban = true AND guildid = $1;`,
      [member.guild.id],
    );

    if (!res || !res.rowCount) return;

    const language = await member.client.ch.languageSelector(member.guild);

    member.guild.bans
      .create(member.user.id, {
        days: 7,
        reason: `${language.autotypes.autopunish} | ${language.autotypes.muteban}`,
      })
      .catch(() => {});
  },
};
