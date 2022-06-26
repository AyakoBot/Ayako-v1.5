module.exports = (member) => {
  const oldMember = member.client.ch.objectClone(member);
  const newMember = member.client.ch.objectClone(member);

  newMember.premiumSinceTimestamp = null;
  newMember.premiumSince = null;

  oldMember.client = member.client;
  newMember.client = member.client;
  oldMember.guild = member.guild;
  newMember.guild = member.guild;

  member.client.emit('guildMemberUpdate', oldMember, newMember);
};
