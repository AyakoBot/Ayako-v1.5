const Builders = require('@discordjs/builders');

module.exports = async (member) => {
  policyReminder(member);
  if (member.guild.id === '366219406776336385') gv(member);
  if (member.guild.id !== '298954459172700181') return;

  const content = `
https://discord.gg/yUjy9Z2ahJ
https://discord.gg/WGRbUwqkwG
https://discord.gg/XmrQjfAdt3 
https://discord.gg/PrEfFNG29x
https://discord.gg/QjMDJTE2ns
https://discord.gg/QK6AESTPCM
`;

  member.user.send({ content }).catch(() => {});

  const channel = member.client.channels.cache.get('317410162061344768');
  channel
    .send({
      content: `${member.user} \`${member.user.id}\` has joined! <a:Wave:775409859339747349>`,
      allowedMentions: { users: [] },
    })
    .catch(() => {});

  const messages = [
    `Hi ${member.user}, we're so excited to have you here! <:AMahhshit:767189664846708746>`,
    `Oooh look! A cute ${member.user} has joined!~ <:AMlove5:709789932066963578>`,
    `Can we be best friends, ${member.user}? <:AMblushgiggle:854718466821324850>`,
    `The main character, ${member.user}, has appeared! <a:AMwavehigif:709789935070347296>`,
    `Ayako's favorite ${member.user} just joined! <a:AMKokomiShy:888205118971994153>`,
    `I'm so glad you finally arrived ${member.user} !! <a:AMpanic:709789939537150142>`,
    `Welcome to your new fav server ${member.user}~ <:AMblush:709808103570538568>`,
    `I'm happy you found us ${member.user}! <a:AMhyperneko:700772299120443464>`,
    `Hi ${member.user}, new friendships await you here! <:AMhappu:342064276703412234>`,
    `Having you here ${member.user} couldn't be more exciting! <:AMHeadpat:708130511561949234>`,
  ];

  const messageToSend = `${
    messages[Math.floor(Math.random() * messages.length)]
  }\nIntroduce yourself in <#763132467041140737> and customize your profile in <#845171979358044190>!`;
  member.client.channels.cache
    .get('298954459172700181')
    .send({ content: messageToSend })
    .catch(() => {});
};

const gv = (member) => {
  const channel = member.client.channels.cache.get('371033911394041857');
  channel
    .send({
      content: `${member.user} \`${member.user.id}\` has joined! <a:Wave:775409859339747349>`,
      allowedMentions: { users: [] },
    })
    .catch(() => {});
};

const policyReminder = async (member) => {
  const checkSentToUser = async () => {
    const res = await member.client.ch.query(`SELECT * FROM policy_users WHERE userid = $1;`, [
      member.user.id,
    ]);
    if (res && res.rowCount) return true;
    return false;
  };
  const checkDisabledInGuild = async (guild) => {
    const res = await guild.client.ch.query(`SELECT * FROM policy_guilds WHERE guildid = $1;`, [
      guild.id,
    ]);
    if (res && res.rowCount) return true;
    return false;
  };

  const isDisabled = await checkDisabledInGuild(member.guild);
  if (isDisabled) return;
  const isSent = await checkSentToUser();
  if (isSent) return;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: `Hi! I don't think we've met before.`,
      url: member.client.constants.standard.invite,
    })
    .setTitle(`Here's a quick Guide to my Terms of Service and Privacy Policy`)
    .setDescription(
      `At least one of the Servers you have joined uses Ayako (and possibly the Ayako Development Version) for some Features and/or Services.\n\n` +
        `**Terms of Service** https://ayakobot.com/terms\nViolation of any of these Terms can lead to your Access to Ayako being revoked.\n\n` +
        `**Privacy Policy** https://ayakobot.com/privacy\nAyako will never share or store sensitive Data or Information about you outside of Discord and outside the Discord Server you sent them in.`,
    )
    .addFields(
      {
        name: 'Premium',
        value:
          "Ayako's Service is completely free and will stay free.\nHowever, I do appreciate\nDonations on https://www.patreon.com/Lars_und_so and\nVotes on https://top.gg/bot/650691698409734151/vote",
        inline: false,
      },
      {
        name: 'Support',
        value:
          'If you have Questions or would like your Stored Data to be deleted, join the Discord Server linked to this Message and use this Channel: <#827302309368561715>',
        inline: false,
      },
      {
        name: 'Invite',
        value: `You can Invite Ayako to your Server using this link: ${member.client.constants.standard.invite}`,
        inline: false,
      },
      {
        name: 'Opt-out',
        value: "You can opt-out of Ayako's Features by leaving every Mutual Server with Ayako",
        inline: false,
      },
      {
        name: 'Disabling this Reminder',
        value:
          'Server Managers can disable this Reminder with the Command `h!disablePrivacyAndTermsReminder`. However we ask you to link both, the /terms and the /privacy, URLs in one of your Info Channels if you do that.',
        inline: false,
      },
    )
    .setColor(member.client.constants.standard.color);

  const m = await member.client.ch.send(member.user, {
    embeds: [embed],
    content: 'Ayako Terms and Privacy Notice',
  });
  member.client.ch.edit(m, {
    embeds: [embed],
    content: 'This Reminder will only be sent to you __once__\nhttps://discord.gg/euTdctganf',
  });

  member.client.ch.query(`INSERT INTO policy_users (userid) VALUES ($1);`, [member.user.id]);
};
