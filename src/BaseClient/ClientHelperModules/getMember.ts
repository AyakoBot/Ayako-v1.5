export default async (id: string, guildID: string) => {
  const { default: client } = await import('../ErisClient');

  const guild = client.guilds.get(guildID);
  if (!guild) return null;

  let member = guild.members.get(id);
  if (member) return member;

  const members = await guild.getRESTMembers().catch(() => []);

  if (members.length) member = members.find((m) => m.user.id === id);
  if (member) return member;

  member = await guild.getRESTMember(id).catch(() => undefined);

  return member;
};
