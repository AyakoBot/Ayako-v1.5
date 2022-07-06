import jobs from 'node-schedule';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message) => {
  if (!msg.channel) return;
  if (!msg.author) return;
  if (!msg.guild) return;

  gvMessageCheck(msg);
  amMessageCheck(msg);

  if (
    (msg.channel.id === '554487212276842534' || msg.channel.id === '791390835916537906') &&
    msg.attachments.length < 1 &&
    !msg.member?.roles.includes('366238244775657472') &&
    !msg.member?.roles.includes('776248679363248168') &&
    msg.author.id !== client.user.id
  ) {
    msg.delete().catch(() => null);
  }
};

const gvMessageCheck = (msg: CT.Message) => {
  if (!msg.member) return;
  if (!msg.member?.permissions.has('manageGuild')) return;
  if (msg.guild?.id !== '366219406776336385') return;
  if (msg.channel.id === '801804774759727134') return;

  const inviteCheck = () => {
    if (!msg.content.toLocaleLowerCase().includes('discord.gg/')) return;
    msg.delete().catch(() => null);

    client.ch
      .send(
        msg.channel,
        { content: `${msg.author} **Do not send Discord Links in this Channel**` },
        msg.language,
      )
      .then((m) => {
        if (Array.isArray(m)) return;
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          m?.delete().catch(() => null);
        });
      });
  };

  const linkCheck = () => {
    if (
      msg.content.toLowerCase().startsWith('https://') &&
      msg.content.toLowerCase().startsWith('http://')
    ) {
      return;
    }
    if (
      msg.member?.roles.includes('369619820867747844') ||
      msg.member?.roles.includes('367781331683508224') ||
      msg.member?.roles.includes('585576789376630827') ||
      msg.channel.id === '367403201646952450' ||
      msg.channel.id === '777660259200270376'
    ) {
      return;
    }

    msg.delete().catch(() => null);
    client.ch
      .send(
        msg.channel,
        {
          content: `${msg.author} You are not allowed to post links yet. \`Needed level: Donut [40]\`\n Please use <#298954962699026432> and <#348601610244587531> instead.`,
        },
        msg.language,
      )
      .then((m) => {
        if (Array.isArray(m)) return;
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          m?.delete().catch(() => null);
        });
      });
  };

  inviteCheck();
  linkCheck();
};

const amMessageCheck = (msg: CT.Message) => {
  if (!msg.guild) return;
  if (msg.guildID !== '298954459172700181') return;
  if (!msg.content.includes(' is now level ') || !msg.content.includes(' leveled up!')) return;
  if (Number(msg.content?.split(/ +/)[4].replace(/!/g, '')) > 39) return;

  const levelUp = () => {
    if (msg.author.id !== '159985870458322944' && msg.author.id !== '172002275412279296') {
      return;
    }

    jobs.scheduleJob(new Date(Date.now() + 10000), () => {
      msg.delete().catch(() => null);
    });
  };

  const linkCheck = () => {
    if (msg.channel.id !== '298954459172700181') return;
    if (
      !msg.content.toLocaleLowerCase().includes('http://') &&
      !msg.content.toLocaleLowerCase().includes('https://')
    ) {
      return;
    }

    if (msg.member?.roles.includes('334832484581769217')) return;
    if (msg.member?.roles.includes('606164114691194900')) return;

    client.ch
      .send(
        msg.channel,
        {
          content: `${msg.author} You are not allowed to post links yet. \`Needed level: Cookie [20]\`\n Please use <#298954962699026432> and <#348601610244587531> instead.`,
        },
        msg.language,
      )
      .then((m) => {
        if (Array.isArray(m)) return;
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          m?.delete().catch(() => null);
        });
      });
  };

  levelUp();
  linkCheck();
};
