const Builders = require('@discordjs/builders');

module.exports = {
  execute(msg) {
    if (!msg.channel || msg.channel.type === 1 || !msg.author || !msg.guild) return;
    if (msg.guild.id !== '298954459172700181') return;
    if (msg.content.toLocaleLowerCase().startsWith('.give')) {
      const user = msg.mentions.users.first();
      if (!user) return;
      if (
        user.id === '267835618032222209' ||
        user.id === '165154892447612928' ||
        user.id === '318453143476371456'
      ) {
        const args = msg.content.slice(1).split(/ +/);
        const amount = args[1];
        let rolename;
        if (amount === 15000) {
          rolename = 'Time Traveller';
        } else if (amount === 10000) {
          rolename = 'VIP';
        } else if (amount === 5000) {
          rolename = 'Koreaboo';
        } else if (amount === 500) {
          rolename = 'Kawaii Potato';
        } else if (amount === 200) {
          rolename = 'Babygirl';
        } else if (amount > 14999 && msg.content.toLocaleLowerCase().includes('time traveller')) {
          rolename = 'Time Traveller';
        } else if (amount > 9999 && msg.content.toLocaleLowerCase().includes('vip')) {
          rolename = 'VIP';
        } else if (amount > 4999 && msg.content.toLocaleLowerCase().includes('koreaboo')) {
          rolename = 'Koreaboo';
        } else if (amount > 499 && msg.content.toLocaleLowerCase().includes('kawaii potato')) {
          rolename = 'Kawaii Potato';
        } else if (amount > 199 && msg.content.toLocaleLowerCase().includes('babygirl')) {
          rolename = 'Babygirl';
        } else if (amount < 200) return;
        msg.channel
          .awaitMessages((m) => m.author.id === '116275390695079945', { max: 1, time: 30000 })
          .then((collected) => {
            collected.first().embeds.forEach(async (embed) => {
              if (embed.description.includes(' has gifted ')) {
                const PaidRole = msg.guild.roles.cache.find((role) => role.name === rolename);
                if (!PaidRole) {
                  return msg.client.ch.reply(msg, 'Something is wrong with the Role you entered');
                }
                const successEmbed = new Builders.UnsafeEmbedBuilder()
                  .setDescription(`Congraz! You now have the ${PaidRole} role`)
                  .setColor(msg.client.constants.standard.color);
                msg.member.roles.add(PaidRole).catch(() => {});
                msg.client.ch.reply(msg, { embeds: [successEmbed] });
              } else {
                const successEmbed = new Builders.UnsafeEmbedBuilder()
                  .setDescription('Seems like something went wrong')
                  .setColor(msg.client.constants.standard.color);
                msg.client.ch.reply(msg, { embeds: [successEmbed] });
              }
              return null;
            });
          })
          .catch(() => {});
      }
    }
  },
};