module.exports = {
  execute(msg) {
    if (!msg.channel || msg.channel.type === 1 || !msg.author || !msg.guild) return;
    if (msg.guild.id !== '298954459172700181') return;
    if (
      msg.content.toLowerCase().startsWith('.$') ||
      msg.content.toLowerCase().startsWith('.cash') ||
      msg.content.toLowerCase().startsWith('.bal') ||
      msg.content.toLowerCase().startsWith('.balance')
    ) {
      msg.channel.send(
        'Balance required for Role purchases was switched to Ayako <a:AMAyakoBookGIF:1010325150949969930>Read\nhttps://canary.discord.com/channels/298954459172700181/388441229064667157/982460958310027324\nto find out how to gain <a:AMAyakoBookGIF:1010325150949969930>\n__You can also have your Nadeko Balance transferred into Ayako__',
      );
    }
  },
};
