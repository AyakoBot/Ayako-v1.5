const Discord = require('discord.js');

module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../../BaseClient/DiscordClient');
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query("SELECT * FROM levelglobal WHERE reminderdone = 'false';");
    if (res && res.rowCount > 0) {
      res.rows.forEach(async (r) => {
        const { userid } = r;
        const { reminder } = r;
        const { runsoutat } = r;
        const { votegain } = r;
        const { reminderdone } = r;
        if (Date.now() > +reminder && reminderdone === false) {
          const user = await client.users.fetch(userid);
          const DMchannel = await user.createDM().catch(() => {});
          const language = await ch.languageSelector('en');
          const reEmbed = new Discord.MessageEmbed()
            .setAuthor(
              language.ready.vote.author,
              Constants.standard.image,
              Constants.standard.invite,
            )
            .setDescription(ch.stp(language.ready.vote.description, { votegain }))
            .setColor(Constants.standard.color)
            .setTimestamp();
          ch.send(DMchannel, reEmbed);
          ch.query('UPDATE levelglobal SET reminderdone = $1 WHERE userid = $2;', [true, user.id]);
        }
        if (Date.now() > +runsoutat && reminderdone === true && votegain !== 1.0)
          ch.query('UPDATE levelglobal SET votegain = $1 WHERE userid = $2;', [1.0, userid]);
      });
    }
  },
};
