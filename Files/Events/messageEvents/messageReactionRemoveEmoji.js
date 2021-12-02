module.exports = {
  async execute(reaction) {
    const { client } = reaction;
    const { ch } = client;
    ch.logger('A Reaction Emoji was removed', reaction); // Logging output since I was unable to determine when this Event fires
  },
};
