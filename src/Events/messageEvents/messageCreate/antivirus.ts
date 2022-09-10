import urlCheck from 'valid-url';
import request from 'request';
import fs from 'fs';
import jobs from 'node-schedule';
import { Worker as WorkerThread } from 'worker_threads';
import type Eris from 'eris';

import blocklists from '../../../BaseClient/Other/Blocklist.json' assert { type: 'json' };
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

type Language = typeof import('../../../Languages/lan-en.json');
interface LinkObject {
  href: string;
  url: string;
  hostname: string;
  baseURL: string;
  baseURLhostname: string;
  contentType: string;
}

export default async (msg: CT.Message) => {
  let check = false;

  if (!msg.content || msg.author.id === client.user.id) {
    return;
  }

  if (msg.channel.type === 1) {
    check = true;
  }

  if (check) {
    await prepare(msg, { lan: msg.language.antivirus, language: msg.language }, check);
    return;
  }

  const antivirusRow = await client.ch
    .query('SELECT * FROM antivirus WHERE guildid = $1 AND active = true;', [msg.guildID])
    .then((r: DBT.antivirus[] | null) => (r ? r[0] : null));

  if (!antivirusRow) return;
  await prepare(msg, { lan: msg.language.antivirus, language: msg.language }, check, antivirusRow);
};

const prepare = async (
  msg: CT.Message,
  { lan }: { lan: Language['antivirus']; language: Language },
  check: boolean,
  res?: DBT.antivirus,
) => {
  const { content } = msg;
  const args = content
    .replace(/\n/g, ' ')
    .replace(/https:\/\//g, ' https://')
    .replace(/http:\/\//, ' http://')
    .split(/ +/);

  const links: string[] = [];

  args.forEach((arg) => {
    let url;
    try {
      url = new URL(arg).hostname;
    } catch {
      // empty block statement
    }

    if (
      urlCheck.isUri(arg) &&
      arg.toLowerCase() !== 'http://' &&
      arg.toLowerCase() !== 'https://' &&
      url
    ) {
      links.push(arg);
    }
  });
  const blocklist = getBlocklist();
  const whitelist = getWhitelist();
  const blacklist = getBlacklist();
  const badLinks = getBadLinks();
  const whitelistCDN = getWhitelistCDN();

  const fullLinks = await makeFullLinks(links);

  let includedBadLink = false;
  let exited = false;

  if (links.length && check) await msg.addReaction(client.reactionEmotes.loading).catch(() => null);

  fullLinks.forEach((linkObject: LinkObject, i) => {
    const AVworker = new WorkerThread(
      `${process.cwd()}/dist/Events/messageEvents/messageCreate/antivirusWorker.js`,
    );

    AVworker.on('exit', () => {
      exited = true;
    });

    AVworker.on('message', (data) => {
      data.msg = msg;
      data.language = msg.language;

      if (!data.check && data.type !== 'send') {
        includedBadLink = true;
      }

      if (includedBadLink || i === fullLinks.length - 1) {
        msg.removeReaction(client.reactionEmotes.loading).catch(() => null);
        AVworker.terminate();
      }

      switch (data.type) {
        case 'doesntExist': {
          doesntExist(data, res);
          break;
        }
        case 'blacklisted': {
          blacklisted(data, res);
          break;
        }
        case 'whitelisted': {
          whitelisted(data, res);
          break;
        }
        case 'newUrl': {
          newUrl(data, res);
          break;
        }
        case 'severeLink': {
          severeLink(data, res);
          break;
        }
        case 'ccscam': {
          ccscam(data, res);
          break;
        }
        case 'cloudFlare': {
          cloudFlare(data, res);
          break;
        }
        case 'send': {
          const channel = client.guilds.get('669893888856817665')?.channels.get(data.channelid);
          client.ch.send(channel, { content: data.content }, msg.language);
          break;
        }
        case 'VTfail': {
          VTfail(data, res);
          break;
        }
        default:
          break;
      }
    });

    AVworker.on('error', (error) => {
      throw error;
    });

    AVworker.postMessage({
      msgData: {
        channelid: msg.channel.id,
        msgid: msg.id,
        guildid: msg.guildID,
      },
      linkObject,
      lan,
      includedBadLink,
      check,
      blacklist,
      whitelist,
      whitelistCDN,
      blocklist,
      badLinks,
    });

    jobs.scheduleJob(new Date(Date.now() + 180000), () => {
      if (!exited) {
        AVworker.terminate();
      }
    });
  });
};

const getBlocklist = () => {
  const blacklist: string[] = [...new Set(blocklists)];
  blacklist.forEach((entry, index) => {
    entry = entry.replace(/#{2}-{1}/g, '');

    if (entry.startsWith('#')) {
      blacklist.splice(index, 1);
    }
  });
  return blacklist;
};

const getWhitelist = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/whitelisted.txt', {
    encoding: 'utf8',
  });
  const whitelistRes = file ? file.split(/\n+/) : [];

  return whitelistRes.map((entry) => entry.replace(/\r/g, ''));
};

const getBlacklist = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/blacklisted.txt', {
    encoding: 'utf8',
  });
  const blacklistRes = file ? file.split(/\n+/) : [];

  return blacklistRes.map((entry) => entry.replace(/\r/g, ''));
};

const getBadLinks = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/badLinks.txt', {
    encoding: 'utf8',
  });
  const badLinks = file ? file.split(/\n+/).filter((line) => !line.startsWith('//')) : [];

  return badLinks.map((entry) => entry.replace(/\r/g, '').replace(/https:\/\//g, ''));
};

const getWhitelistCDN = () => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/whitelistedCDN.txt', {
    encoding: 'utf8',
  });
  const whitelistCDNRes = file ? file.split(/\n+/) : [];

  return whitelistCDNRes.map((entry) => entry.replace(/\r/g, ''));
};

const makeFullLinks = async (links: string[]) => {
  const fullLinks: LinkObject[] = [];

  const makeAndPushLinkObj = async (link: string) => {
    const url = new URL(link);
    const response = await new Promise((resolve) => {
      request(link, { method: 'HEAD', followAllRedirects: true }, (_error, res) => {
        if (res) {
          resolve([res?.request?.href, res?.headers ? res.headers['content-type'] : null]);
        } else {
          resolve([link, null]);
        }
      });
    });

    const [href, contentType] = response as [string, string];

    const object = {
      contentType,
      href,
      url: `${href || (url.href ? url.href : `${url.protocol}//${url.hostname}`)}`,
      hostname: url.hostname,
      baseURL: '',
      baseURLhostname: '',
    };

    fullLinks.push(object);
  };

  const promises = links.map((link) => makeAndPushLinkObj(link));

  await Promise.all(promises);

  return fullLinks.map((linkObject) => {
    const urlParts = new URL(linkObject.url).hostname.split('.');
    const slicedURL = urlParts
      .slice(0)
      .slice(-(urlParts.length === 4 ? 3 : 2))
      .join('.');
    const newLink = `${new URL(linkObject.url).protocol}//${slicedURL}`;

    return {
      ...linkObject,
      baseURL: newLink,
      baseURLhostname: new URL(newLink).hostname,
    };
  });
};

const doesntExist = async (
  {
    msg,
    lan,
    linkObject,
    check,
  }: { msg: CT.Message; lan: Language['antivirus']; linkObject: LinkObject; check: boolean },
  res?: DBT.antivirus,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.notexistent, {
      url: linkObject.baseURLhostname,
    })}`,
    color: client.constants.colors.success,
  };

  embed.fields = [];
  if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

  client.ch.reply(msg, { embeds: [embed] });

  linkLog(
    msg,
    lan,
    client.constants.colors.success,
    linkObject,
    client.ch.stp(lan.notexistent, {
      url: linkObject.baseURLhostname,
    }),
    res,
  );
};

const blacklisted = async (
  {
    msg,
    lan,
    linkObject,
    check,
    note,
  }: {
    msg: CT.Message;
    lan: Language['antivirus'];
    linkObject: LinkObject;
    check: boolean;
    note: string | boolean;
  },
  res?: DBT.antivirus,
) => {
  if (note && typeof note === 'string') {
    const embed: Eris.Embed = {
      type: 'rich',
      description: `**${msg.language.result}**\n${client.ch.stp(lan.malicious, {
        cross: client.stringEmotes.cross,
      })}`,
      color: client.constants.colors.warning,
      fields: [{ name: msg.language.attention, value: note.split(/\|+/)[1] }],
    };

    if (check) embed.fields?.push({ name: lan.checking, value: linkObject.href });

    await client.ch.reply(msg, { embeds: [embed] });
  } else {
    const embed: Eris.Embed = {
      type: 'rich',
      description: `**${msg.language.result}**\n${client.ch.stp(lan.malicious, {
        cross: client.stringEmotes.cross,
      })}`,
      color: client.constants.colors.warning,
    };

    embed.fields = [];
    if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

    const m = await client.ch.reply(msg, { embeds: [embed] });

    client.ch.send(
      client.guilds.get('669893888856817665')?.channels.get('726252103302905907'),
      {
        content: msg.jumpLink,
      },
      msg.language,
    );

    if (!check) client.emit('antivirusHandler', msg, m, 'blacklist');
  }

  linkLog(
    msg,
    lan,
    client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.malicious, {
      cross: client.stringEmotes.cross,
    }),
    res,
  );
};

const severeLink = async (
  {
    msg,
    lan,
    linkObject,
    check,
    hrefLogging,
  }: {
    msg: CT.Message;
    lan: Language['antivirus'];
    linkObject: LinkObject;
    check: boolean;
    hrefLogging: boolean;
  },
  res?: DBT.antivirus,
) => {
  saveToBadLink(linkObject, msg, hrefLogging);

  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.malicious, {
      cross: client.stringEmotes.cross,
    })}`,
    color: client.constants.colors.warning,
  };
  embed.fields = [];

  if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

  const m = await client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(
    client.guilds.get('669893888856817665')?.channels.get('726252103302905907'),
    {
      content: msg.jumpLink,
    },
    msg.language,
  );
  if (!check) client.emit('antivirusHandler', msg, m, 'virustotal');

  linkLog(
    msg,
    lan,
    client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.malicious, {
      cross: client.stringEmotes.cross,
    }),
    res,
  );
};

const ccscam = async (
  {
    msg,
    lan,
    linkObject,
    check,
  }: { msg: CT.Message; lan: Language['antivirus']; linkObject: LinkObject; check: boolean },
  res?: DBT.antivirus,
) => {
  saveToBadLink(linkObject, msg);
  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.ccscam, {
      cross: client.stringEmotes.cross,
    })}`,
    color: client.constants.colors.warning,
  };

  embed.fields = [];
  if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

  const m = await client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(
    client.guilds.get('669893888856817665')?.channels.get('726252103302905907'),
    {
      content: msg.jumpLink,
    },
    msg.language,
  );
  if (!check) client.emit('antivirusHandler', msg, m, 'selfscan');

  linkLog(
    msg,
    lan,
    client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.ccscam, {
      cross: client.stringEmotes.cross,
    }),
    res,
  );
};

const newUrl = async (
  {
    msg,
    lan,
    linkObject,
    check,
  }: { msg: CT.Message; lan: Language['antivirus']; linkObject: LinkObject; check: boolean },
  res?: DBT.antivirus,
) => {
  saveToBadLink(linkObject, msg);

  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.newLink, {
      cross: client.stringEmotes.cross,
    })}`,
    color: client.constants.colors.warning,
  };

  embed.fields = [];
  if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

  const m = await client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(
    client.guilds.get('669893888856817665')?.channels.get('726252103302905907'),
    {
      content: msg.jumpLink,
    },
    msg.language,
  );

  if (!check) client.emit('antivirusHandler', msg, m, 'newurl');

  linkLog(
    msg,
    lan,
    client.constants.colors.warning,
    linkObject,
    client.ch.stp(lan.newLink, {
      cross: client.stringEmotes.cross,
    }),
    res,
  );
  return true;
};

const saveToBadLink = async (linkObject: LinkObject, msg: CT.Message, hrefLogging?: boolean) => {
  const file = fs.readFileSync('/root/Bots/Website/CDN/antivirus/badLinks.txt', {
    encoding: 'utf8',
  });
  const res = file ? file.split(/\n+/).map((entry) => entry.replace(/\r/g, '')) : [];

  if (!res.includes(linkObject.baseURL)) {
    client.ch.send(
      client.guilds.get('669893888856817665')?.channels.get('726252103302905907'),
      {
        content: `contentType: ${linkObject.contentType}\nhref: ${linkObject.href}\nurl: ${linkObject.url}\nhostname: ${linkObject.hostname}\nbaseURL: ${linkObject.baseURL}\nbaseURLhostname: ${linkObject.baseURLhostname}\n`,
      },
      msg.language,
    );
  }

  const appended = hrefLogging ? linkObject.href : linkObject.baseURL;
  fs.appendFile('/root/Bots/Website/CDN/antivirus/badLinks.txt', `\n${appended}`, () => null);
};

const whitelisted = async (
  {
    msg,
    lan,
    linkObject,
    check,
  }: { msg: CT.Message; lan: Language['antivirus']; linkObject: LinkObject; check: boolean },
  res?: DBT.antivirus,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.whitelisted, {
      tick: client.stringEmotes.tick,
    })}`,
    color: client.constants.colors.success,
  };

  embed.fields = [];
  if (check) {
    embed.fields.push({ name: lan.checking, value: linkObject.href });
    client.ch.reply(msg, { embeds: [embed] });
  }

  linkLog(
    msg,
    lan,
    client.constants.colors.success,
    linkObject,
    client.ch.stp(lan.whitelisted, {
      tick: client.stringEmotes.tick,
    }),
    res,
  );
  return true;
};

const cloudFlare = async (
  {
    msg,
    lan,
    linkObject,
    check,
  }: { msg: CT.Message; lan: Language['antivirus']; linkObject: LinkObject; check: boolean },
  res?: DBT.antivirus,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.cfProtected, {
      cross: client.stringEmotes.cross,
    })}`,
    color: 16776960,
  };

  embed.fields = [];
  if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

  client.ch.reply(msg, { embeds: [embed] });

  client.ch.send(
    client.guilds.get('669893888856817665')?.channels.get('726252103302905907'),
    {
      content: `${msg.jumpLink}\nis CloudFlare Protected\n${linkObject.href}`,
    },
    msg.language,
  );

  linkLog(
    msg,
    lan,
    client.constants.colors.loading,
    linkObject,
    client.ch.stp(lan.cfProtected, {
      cross: client.stringEmotes.cross,
    }),
    res,
  );
  return true;
};

const VTfail = (
  {
    msg,
    lan,
    linkObject,
    check,
  }: { msg: CT.Message; lan: Language['antivirus']; linkObject: LinkObject; check: boolean },
  res?: DBT.antivirus,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    description: `**${msg.language.result}**\n${client.ch.stp(lan.VTfail, {
      cross: client.stringEmotes.cross,
    })}`,
    color: client.constants.colors.loading,
  };

  embed.fields = [];
  if (check) embed.fields.push({ name: lan.checking, value: linkObject.href });

  client.ch.reply(msg, { embeds: [embed] });

  linkLog(
    msg,
    lan,
    client.constants.colors.loading,
    linkObject,
    client.ch.stp(lan.VTfail, {
      cross: client.stringEmotes.cross,
    }),
    res,
  );
};

const linkLog = (
  msg: CT.Message,
  lan: Language['antivirus'],
  color: number,
  linkObject: LinkObject,
  text: string,
  row?: DBT.antivirus,
) => {
  if (!row || !row.linklogging || !row.linklogchannels?.length) return;

  const embed: Eris.Embed = {
    type: 'rich',
    description: client.ch.stp(lan.log.value, {
      author: msg.author,
      channel: msg.channel,
    }),
    author: {
      name: lan.log.author,
      url: client.constants.standard.invite,
    },
    color,
    fields: [
      { name: `\u200b`, value: text, inline: false },
      {
        name: lan.log.href,
        value: client.ch.util.makeCodeBlock(linkObject.href),
        inline: false,
      },
      {
        name: lan.log.url,
        value: client.ch.util.makeCodeBlock(String(linkObject.url)),
        inline: false,
      },
      {
        name: lan.log.hostname,
        value: client.ch.util.makeCodeBlock(String(linkObject.hostname)),
        inline: true,
      },
      {
        name: lan.log.baseURL,
        value: client.ch.util.makeCodeBlock(String(linkObject.baseURL)),
        inline: false,
      },
      {
        name: lan.log.baseURLhostname,
        value: client.ch.util.makeCodeBlock(String(linkObject.baseURLhostname)),
        inline: true,
      },
    ],
  };

  const channels = row.linklogchannels
    .map((c: string) => msg.guild?.channels.get(c))
    .filter((c): c is Eris.AnyGuildChannel => !!c);
  client.ch.send(channels, { embeds: [embed] }, msg.language);
};
