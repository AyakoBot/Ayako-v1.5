module.exports = {
  async execute(invite) {
    const { client } = invite;
    const { guild } = invite;

    client.invites.set(guild.id, await client.ch.getAllInvites(guild));
  },
};
