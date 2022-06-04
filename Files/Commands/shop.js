const Builders = require('@discordjs/builders');

const AMRoles = [
  ['330766391999463424', 15000],
  ['358778201868075008', 10000],
  ['332858829706362882', 5000],
  ['389601915958198283', 500],
  ['349652217885622273', 200],
];

module.exports = {
  name: 'shop',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['support'],
  ThisGuildOnly: ['298954459172700181', '266632338883084290'],
  description: 'Display the Server Shop',
  usage: ['shop'],
  type: 'info',
  async execute(msg) {
    if (msg.guild.id === '298954459172700181') {
      const coins = await getCoins(msg, msg.author);

      const embed = new Builders.UnsafeEmbedBuilder()
        .setAuthor({
          name: 'Server Role Shop',
          url: msg.client.constants.standard.invite,
        })
        .addFields(
          {
            name: '**#1 - 15000<a:AMLantern:982432370814759003>**',
            value: '<@&330766391999463424>',
            inline: true,
          },
          {
            name: '**#2 - 10000<a:AMLantern:982432370814759003>**',
            value: '<@&358778201868075008>',
            inline: true,
          },
          {
            name: '**#3 - 5000<a:AMLantern:982432370814759003>**',
            value: '<@&332858829706362882>',
            inline: true,
          },
          {
            name: '**#4 - 500<a:AMLantern:982432370814759003>**',
            value: '<@&389601915958198283>',
            inline: true,
          },
          {
            name: '**#5 - 200<a:AMLantern:982432370814759003>**',
            value: '<@&349652217885622273>',
            inline: true,
          },
          { name: '\u200b', value: '\u200b', inline: false },
          {
            name: 'https://top.gg/bot/650691698409734151/vote\nhttps://top.gg/servers/298954459172700181/vote',
            value: 'Earn <a:AMLantern:982432370814759003> by voting for Animekos and/or Ayako',
            inline: false,
          },
        )
        .setDescription(`Buy Roles through the Select Menu below\nYou currently have ${coins} <a:AMLantern:982432370814759003>`)
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me));

      const menu = new Builders.UnsafeSelectMenuBuilder()
        .setCustomId('roles')
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder('Select a Role')
        .setOptions(
          ...AMRoles.map(([roleID, cost]) => {
            const role = msg.guild.roles.cache.get(roleID);

            return {
              label: role.name,
              value: role.id,
              description: `This Role costs ${cost} Lanterns`,
              disabled: msg.member.roles.cache.has(role.id),
            };
          }),
        );

      const m = await msg.client.ch.reply(msg, {
        embeds: [embed],
        components: msg.client.ch.buttonRower([menu]),
      });
      interactionHandler(msg, m, menu);
    } else if (msg.guild.id === '266632338883084290') {
      const embed = new Builders.UnsafeEmbedBuilder()
        .setAuthor({
          name: 'Server Role Shop',
          url: msg.client.constants.standard.invite,
        })
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
        .setDescription(
          'To buy these Roles visit `t!shop` number `3` i. e. `Server Shop`\n View this message anytime by typing `h!shop`',
        )
        .addFields(
          {
            name: '2.500 <a:TatsuCoins:800684425582477392>',
            value: '<@&800159175836827719> <a:DogDance:800685678958608404> ',
            inline: true,
          },
          {
            name: '2.500 <a:TatsuCoins:800684425582477392>',
            value: '<@&800157887611404298> <:FoxLove:750155509348302960> ',
            inline: true,
          },
          {
            name: '2.500 <a:TatsuCoins:800684425582477392>',
            value: '<@&800119007427428381> <:BunnyLove:800685882533085195> ',
            inline: true,
          },
          {
            name: '2.500 <a:TatsuCoins:800684425582477392>',
            value: '<@&800160316884516896> <a:RainbowCat:800685849246957578> ',
            inline: true,
          },
          {
            name: '2.500 <a:TatsuCoins:800684425582477392>',
            value: '<@&800425649084694538> <:mikuSleepy:726249050575208558>',
            inline: true,
          },
          { name: '\u200b', value: '\u200b', inline: false },
        )
        .addFields({
          name: 'How to get Tatsu Server Coins',
          value: 'Just be active in chat, you get 5 Server Coins per message',
          inline: false,
        });
      msg.client.ch.reply(msg, { embeds: [embed] });
    }
  },
};

const getCoins = async (msg, user) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM balance WHERE userid = $1 AND guildid = $2;`,
    [user.id, msg.guild.id],
  );

  if (res && res.rowCount) return Number(res.rows[0].balance);
  return 0;
};

const interactionHandler = async (msg, m) => {
  const collector = m.createMessageComponentCollector({ time: 60000 });
  collector.on('collect', async (interaction) => {
    const coins = await getCoins(msg, interaction.user);
    const r = AMRoles.find(([or]) => or === interaction.values[0]);

    if (r[1] > coins) {
      msg.client.ch.reply(interaction, {
        content: 'You do not have enough <a:AMLantern:982432370814759003>',
        ephemeral: true,
      });
      return;
    }

    const role = msg.guild.roles.cache.get(r[0]);
    msg.guild.members.cache.get(interaction.user.id)?.roles.add(role);
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.collectorEnd(msg, m);
    }
  });
};
