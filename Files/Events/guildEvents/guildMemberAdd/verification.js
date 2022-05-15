module.exports = async (member) => {
  const res = await member.user.client.ch.query(
    'SELECT * FROM verification WHERE guildid = $1 AND active = $2;',
    [member.guild.id, true],
  );
  if (res && res.rowCount > 0) {
    member.roles.add(res.rows[0].pendingrole).catch(() => {});
    const msg = {};
    [msg.r] = res.rows;
    const language = await member.client.ch.languageSelector(member.guild);
    const DM = await member.user.createDM().catch(() => {});
    if (DM && DM.id && res.rows[0].selfstart) {
      msg.DM = DM;
      [msg.r] = res.rows;
      msg.client = member.user.client;
      msg.user = member.user;
      msg.member = member;
      msg.guild = member.guild;
      require('../../../Interactions/SlashCommands/verify').startProcess(msg, null, null, {
        lan: language.verification,
        language,
      });
    }
  }
};
