import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (member: Eris.Member, guild: Eris.Guild) => {
  if (client.user.id !== client.mainID) return;

  policyReminder(member, guild);
  if (guild.id === '366219406776336385') gv(member);
  if (guild.id !== '298954459172700181') return;

  const content = `***;⌗ El~~ite~~ Em__pire__***
🌸 One of the **richest** and **biggest** __Dank Memer__ communities \`!!\`
🌸 **__ $100 worth__** of Nitro gwys daily ‹𝟹
🌸 Friendly and chill environment  with epic emotes:wilted_rose: 
🌸 Many fun events & gwys for **Karuta, Dank Memer, Nitro and OwO**

*join now * ⇝  https://discord.gg/yUjy9Z2ahJ

✧･ﾟ: ✧･ﾟ:  :･ﾟ✧:･ﾟ✧

• 𝐘𝐮𝐫𝐢’𝐬 𝐀𝐫𝐜𝐚𝐝𝐞 is a place for all anime lovers to come together. We offer a safe place for those who enjoy anime to talk about it with others and learn more about anime.

𝐃𝐢𝐬𝐜𝗼𝐫𝐝: https://discord.gg/sST6whJbdN

https://discord.gg/WGRbUwqkwG
`;

  const dm = await member.user.getDMChannel();
  dm.createMessage({ content }).catch(() => null);

  const channel = client.guilds.get('298954459172700181')?.channels.get('317410162061344768');
  if (!channel) return;
  if (!('createMessage' in channel)) return;

  channel
    .createMessage({
      content: `${member.user} \`${member.user.id}\` has joined! <a:Wave:775409859339747349>`,
    })
    .catch(() => null);
};

const gv = (member: Eris.Member) => {
  const channel = client.guilds.get('366219406776336385')?.channels.get('371033911394041857');
  if (!channel) return;
  if (!('createMessage' in channel)) return;

  channel
    .createMessage({
      content: `${member.user} \`${member.user.id}\` has joined! <a:Wave:775409859339747349>`,
      allowedMentions: { users: [] },
    })
    .catch(() => null);
};

const policyReminder = async (member: Eris.Member, guild: Eris.Guild) => {
  const isDisabled = await client.ch
    .query(`SELECT * FROM policy_guilds WHERE guildid = $1;`, [guild.id])
    .then((r: DBT.policy_guilds[] | null) => (r ? r[0] : null));
  if (isDisabled) return;

  const isSent = await client.ch
    .query(`SELECT * FROM policy_users WHERE userid = $1;`, [member.user.id])
    .then((r: DBT.policy_users[] | null) => (r ? r[0] : null));
  if (isSent) return;

  client.ch.query(`INSERT INTO policy_users (userid) VALUES ($1);`, [member.user.id]);

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      url: client.constants.standard.invite,
      name: `Hi! I don't think we've met before.`,
    },
    title: `Here's a quick Guide to my Terms of Service and Privacy Policy`,
    description:
      `At least one of the Servers you have joined uses Ayako (and possibly the Ayako Development Version) for some Features and/or Services.\n\n` +
      `**Terms of Service** https://ayakobot.com/terms\nViolation of any of these Terms can lead to your Access to Ayako being revoked.\n\n` +
      `**Privacy Policy** https://ayakobot.com/privacy\nAyako will never share or store sensitive Data or Information about you outside of Discord and outside the Discord Server you sent them in.`,
    fields: [
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
        value: `You can Invite Ayako to your Server using this link: ${client.constants.standard.invite}`,
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
    ],
    color: client.constants.standard.color,
  };

  const dm = await member.user.getDMChannel();
  const m = await dm.createMessage({
    embeds: [embed],
    content: 'Ayako Terms and Privacy Notice',
  });

  client.ch.edit(m, {
    embeds: [embed],
    content: 'This Reminder will only be sent to you __once__\nhttps://discord.gg/GNpcspBbDr',
  });
};
