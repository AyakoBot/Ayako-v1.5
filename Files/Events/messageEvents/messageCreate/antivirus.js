/* eslint-disable no-param-reassign */
const urlCheck = require('valid-url');
const fs = require('fs');
const Discord = require('discord.js');
const axios = require('axios');
const blocklist = require('../../../blocklist.json');
const auth = require('../../../BaseClient/auth.json');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(msg) {
    let check = false;
    if (!msg.content || msg.author.id === msg.client.user.id) return;
    if (msg.channel.type === 'DM') check = true;
    // eslint-disable-next-line no-param-reassign
    msg.language = await msg.client.ch.languageSelector(check ? null : msg.guild);
    const lan = check ? msg.language.antivirus.dm : msg.language.antivirus.guild;
    if (check) {
      run(msg, check, lan);
      return;
    }
    const res = await msg.client.ch.query('SELECT * FROM antivirus WHERE guildid = $1;', [msg.guild.id]);
    if (res && res.rowCount > 0) {
      const r = res.rows[0];
      if (r.active !== true) return;
      run(msg, check, lan, r);
    }
  },
};

const run = async (msg, check, lan) => {
  const { content } = msg;
  const args = content.replace(/\\n/g, ' ').replace(/^https:\/\//g, ' https://').replace(/^http:\/\//, ' http://').split(/ +/);
  const links = [];
  args.forEach((arg) => {
    if (urlCheck.isUri(arg)) {
      links.push(arg);
    }
  });

  const blacklist = [...new Set(blocklist)];
  blacklist.map((entry) => entry.replace(/#{2}-{1}/g, ''));

  const whitelistRes = await axios.get('https://ayakobot.com/cdn/whitelisted.txt');

  const whitelistRaw = whitelistRes ? whitelistRes.text.split(/\n+/) : [];
  whitelistRaw.map((entry) => entry.replace(/\r/g, ''));

  const blacklistRes = await axios.get('https://ayakobot.com/cdn/blacklisted.txt');

  const blacklistRaw = blacklistRes ? blacklistRes.text.split(/\n+/) : [];
  blacklistRaw.map((entry) => entry.replace(/\r/g, ''));

  const whitelistCDNRes = await axios.get('https://ayakobot.com/cdn/whitelistedCDN.txt');

  const whitelistCDNRaw = whitelistCDNRes ? whitelistCDNRes.text.split(/\n+/) : [];
  whitelistCDNRaw.map((entry) => entry.replace(/\r/g, ''));

  const fullLinks = [];
  const promises = links.map(async (link) => {
    const response = await axios.get(link);
    if (response.status === 200) {
      const header = response.headers['content-type'];
      if (header.includes('audio') || header.includes('video') || header.includes('image')) {
        fullLinks.push(`CheckThis-${response.request.responseURL}`);
      } else {
        fullLinks.push(response.request.responseURL);
      }
    }
  });

  await Promise.all(promises);

  fullLinks.forEach((link, i) => {
    if (!link.startsWith('CheckThis-')) {
      const urlParts = new URL(link).hostname.split('.');
      const newUrl = `${new URL(link).protocol}//${urlParts
        .slice(0)
        .slice(-(urlParts.length === 4 ? 3 : 2))
        .join('.')}`;
      if (!fullLinks.includes(newUrl)) fullLinks.push(newUrl);
    } else fullLinks[i] = link;
  });

  fullLinks.forEach((link, i) => {
    if (link.hostname) fullLinks[i] = `${link.protocol}//${link.hostname}`;
    if (fullLinks[i].endsWith('/')) fullLinks[i] = fullLinks[i].slice(0, -1);
  });
  const fullLinksUnique = [...new Set(fullLinks)];

  let included = false;
  const linksPromises = fullLinksUnique.map(async (currentUrl) => {
    const embed = new Discord.MessageEmbed();
    let url = currentUrl;

    if (!currentUrl.hostname) {
      url = new URL(currentUrl);
    }

    const checkthis = !!url.protocol.includes('checkthis-');

    if (checkthis) {
      url = new URL(url.href.replace('checkthis-', ''));
    }

    const enteredWebsite = await axios.head(url.href);
    const baseWebsite = await axios.head(url.hostname);

    if (
      ((!enteredWebsite || enteredWebsite.text === 'Domain not found')
      && (!baseWebsite || baseWebsite.text === 'Domain not found'))
      || (`${enteredWebsite}`.includes('ENOTFOUND') || `${baseWebsite}`.includes('ENOTFOUND'))) {
      await end({
        msg, text: 'NOT_EXISTENT', res: null, severity: null, link: url,
      }, check, embed, null, lan);
      return;
    }

    if (check) {
      embed.setDescription(`${lan.checking} \`${url}\``);
    } else {
      embed.setDescription('');
    }

    let include = false;
    blacklistRes.forEach((entry, index) => {
      if (entry.includes('|') && entry.split(/ | /g)[0] === url.hostname) {
        include = index;
      }
    });

    if (!whitelistRes.includes(`${url.hostname}`) || checkthis) {
      if (checkthis && whitelistCDNRes.includes(`${url.hostname}`)) {
        await end({
          msg, text: 'WHITELISTED', res: null, severity: null, link: url,
        }, check, embed, null, lan);
        return;
      }

      if (included === false) {
        embed
          .setDescription(`${embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }))}\n\n${msg.client.ch.stp(lan.notWhitelisted, { warning: msg.client.constants.emotes.warning })}${msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })}`)
          .setColor('#ffff00');
        switch (blacklistRes) {
          case (blacklistRes.includes(`${url.hostname}`) || include !== false): {
            await end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg }, check, embed, blacklistRes[include], lan);

            if (!check) {
              included = true;
            }
            break;
          }

          case (blacklist.includes(url.hostname)): {
            await end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg }, check, embed, null, lan);

            if (!check) {
              included = true;
            }
            break;
          }

          default: {
            embed
              .setDescription(`${embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }))}\n\n${msg.client.ch.stp(lan.notBlacklisted, { warning: msg.client.constants.emotes.warning })}${msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })}`)
              .setColor('#ffff00');

            const spamHausRes = await axios
              .get(
                `https://apibl.spamhaus.net/lookup/v1/dbl/${url.hostname}`,
                {
                  headers: {
                    Authorization: `Bearer ${auth.spamhausToken}`,
                    'Content-Type': 'application/json',
                  },
                },
              );
            if (spamHausRes && spamHausRes.status === 200) {
              await end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg }, check, embed, null, lan);
            } else {
              let ageInDays;
              const ip2whoisRes = await axios.get(`https://api.ip2whois.com/v2?key=${auth.ip2whoisToken}&domain=${url.hostname}&format=json`);

              if (ip2whoisRes && ip2whoisRes.text && JSON.parse(ip2whoisRes.text).domain_age) {
                ageInDays = JSON.parse(ip2whoisRes.text).domain_age;
              }

              if (!ageInDays) {
                const promptapiRes = await axios.get(`https://api.promptapi.com/whois/query?domain=${url.hostname}`, {
                  headers: {
                    apikey: auth.promptAPIToken,
                  },
                });

                if (promptapiRes
                    && promptapiRes.text
                    && JSON.parse(promptapiRes.text).result
                    && JSON.parse(promptapiRes.text).result.creation_date
                ) {
                  ageInDays = Math.ceil(
                    Math.abs(
                      new Date(
                        JSON.parse(
                          promptapiRes.text,
                        ).result.creation_date,
                      ).getTime() - new Date().getTime(),
                    ) / (1000 * 3600 * 24),
                  );
                }
              }

              if (ageInDays && +ageInDays < 7) {
                await end({
                  msg, text: 'NEW_URL', res: null, severity: null, link: url,
                }, check, embed, null, lan);
                return;
              }

              let res1;
              let res2;
              let res;

              const VTget = await axios
                .get(`https://www.virustotal.com/api/v3/domains/${url.hostname}`, {
                  headers: {
                    'x-apikey': auth.VTtoken,
                  },
                });

              if (VTget) {
                res1 = JSON.parse(VTget.text).error
                  ? JSON.parse(VTget.text).error.code
                  : JSON.parse(VTget.text).data.attributes.last_analysis_stats;
              }

              const VTdomainGet = await axios
                .get(`https://www.virustotal.com/api/v3/urls/${btoa(url.href).replace(/={1,2}$/, '')}`, {
                  headers: {
                    'x-apikey': auth.VTtoken,
                  },
                });

              if (VTdomainGet) {
                res2 = JSON.parse(VTdomainGet.text).error
                  ? JSON.parse(VTdomainGet.text).error.code
                  : JSON.parse(VTdomainGet.text).data.attributes.last_analysis_stats;
              }

              if (res2 === 'NotFoundError' && res1 === 'NotFoundError') {
                embed
                  .setDescription(`${embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }))}\n\n${msg.client.ch.stp(lan.VTanalyze, { warning: msg.client.constants.emotes.warning })}${msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })}`)
                  .setColor('#ffff00');

                const VTpost = await axios
                  .post('https://www.virustotal.com/api/v3/urls', { url: url.hostname }, {
                    headers: {
                      'x-apikey': auth.VTtoken,
                      'Content-Type': 'multipart/form-data',
                    },
                  });

                if (VTpost) {
                  res = JSON.parse(VTpost.text).data.id;
                }

                setTimeout(async () => {
                  const VTsecondGet = await axios
                    .get(`https://www.virustotal.com/api/v3/analyses/${res}`, {
                      headers: {
                        'x-apikey': auth.VTtoken,
                      },
                    });

                  if (VTsecondGet) {
                    res = JSON.parse(VTsecondGet.text).error
                      ? JSON.parse(VTsecondGet.text).error.code
                      : JSON.parse(VTsecondGet.text).data.attributes.stats;
                  }

                  return evaluation(
                    msg,
                    res,
                    url,
                    JSON.parse(VTsecondGet?.text)?.data?.attributes,
                    check,
                    embed,
                    lan,
                  );
                }, 60000);
              } else {
                await evaluation(
                  msg,
                  [res1, res2],
                  url,
                  VTget ? JSON.parse(VTget.text)?.data.attributes : null,
                  check,
                  embed,
                  lan,
                );
              }
            }
            break;
          }
        }
      }
    } else {
      end({
        msg, text: 'DB_INSERT', url: url.hostname, severity: 0,
      }, check, embed, null, lan);
    }
  });

  await Promise.all(linksPromises);
};

const evaluation = async (msg, VTresponse, url, attributes, check, embed, lan) => {
  let currentVTResponse;
  if (Array.isArray(VTresponse)) {
    currentVTResponse = VTresponse[0].suspicious > 0 || VTresponse[0].malicious > 0
      ? VTresponse[0]
      : VTresponse[1];
  }

  if (msg.m && !msg.m.logged) {
    msg.client.ch.send(
      msg.client.channels.cache.get(msg.client.constants.standard.trashLogChannel),
      { content: msg.m.url },
    );
    msg.m.logged = true;
  }

  let severity = 0;

  if (currentVTResponse && (currentVTResponse === 'QuotaExceededError' || !currentVTResponse.suspicious)) {
    if (embed.fields.length === 0) {
      await embed
        .addField(
          msg.language.result,
          msg.client.ch.stp(lan.VTfail, { cross: msg.client.constants.emotes.cross }),
        )
        .setDescription(
          embed.description.replace(
            msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }),
          ),
        )
        .setColor('#ffff00');
    }
    await end({
      msg, text: 'DB_INSERT', url: new URL(url).hostname, severity,
    }, check, embed, null, lan);
    return;
  }

  if (currentVTResponse) {
    if (currentVTResponse.suspicious) {
      severity = currentVTResponse.suspicious % 10;
    }

    if (currentVTResponse.malicious) {
      if (currentVTResponse.malicious > 1 && currentVTResponse.malicious < 5) {
        severity += 6;
      } else if (currentVTResponse.malicious > 50) {
        severity = 100;
      }

      severity += currentVTResponse.malicious * 2;
    }
  }

  if (severity > 2) {
    await end({
      msg, text: 'SEVERE_LINK', res: currentVTResponse, severity, link: url,
    }, check, embed, null, lan);
    return;
  }

  if (attributes && `${+attributes.creation_date}000` > Date.now() - 604800000) {
    await end({
      msg, text: 'NEW_URL', res: currentVTResponse, severity, link: url,
    }, check, embed, null, lan);
    return;
  }

  if (!check) {
    setTimeout(() => msg.m?.delete().catch(() => {
    }), 10000);
  }

  if (attributes) {
    if (embed.fields.length === 0) {
      await embed
        .addField(
          msg.language.result,
          msg.client.ch.stp(lan.VTharmless, { tick: msg.client.constants.emotes.tick }),
        )
        .setDescription(
          embed.description.replace(
            msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }),
            msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }),
          ),
        )
        .setColor('#00ff00');
    }
    fs.appendFile('S:/Bots/ws/CDN/whitelisted.txt', `\n${new URL(url).hostname}`, () => {});
  }
};

const end = async (data, check, embed, note, lan) => {
  if (data.msg.m && !data.msg.m.logged) {
    data.msg.client.ch.send(
      data.msg.client.channels.cache.get(data.msg.client.constants.standard.trashLogChannel),
      { content: data.msg.m.url },
    );
    data.msg.m.logged = true;
  }

  if (data.text === 'NOT_EXISTENT') {
    if (embed.fields.length === 0) {
      await embed
        .addField(
          data.msg.language.result,
          data.msg.client.ch.stp(lan.notexistent, { url: data.link.hostname }),
        )
        .setDescription(
          data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }),
        )
        .setColor('#00ff00');
      data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] });
      if (!check) setTimeout(() => data.msg.m.delete(), 10000);
    }
    await end({
      msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
    }, check, embed, null, lan);
    return true;
  }
  if (data.text === 'BLACKLISTED_LINK') {
    if (note && note !== false) {
      if (embed.fields.length === 0) {
        await embed
          .addField(
            data.msg.language.result,
            data.msg.client.ch.stp(
              lan.blacklisted,
              { cross: data.msg.client.constants.emotes.cross },
            ),
          )
          .addField(data.msg.language.attention, note.split(/\|+/)[1])
          .setDescription(
            embed.description.replace(
              data.msg.client.ch.stp(
                lan.check,
                { loading: data.msg.client.constants.emotes.loading },
              ),
              data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }),
            ),
          )
          .setColor('#ff0000');
        data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
      }
    } else {
      if (embed.fields.length === 0) {
        await embed
          .addField(
            data.msg.language.result,
            data.msg.client.ch.stp(
              lan.blacklisted,
              { cross: data.msg.client.constants.emotes.cross },
            ),
          )
          .setDescription(
            embed.description.replace(
              data.msg.client.ch.stp(
                lan.check,
                { loading: data.msg.client.constants.emotes.loading },
              ),
              data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }),
            ),
          )
          .setColor('#ff0000');
        data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
      }
      if (!check) {
        client.emit('antivirusHandler', data.msg, data.link, 'blacklist');
      }
    }
    await end({
      msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
    }, check, embed, null, lan);
    return true;
  }

  if (data.text === 'SEVERE_LINK') {
    if (embed.fields.length === 0) {
      await embed
        .addField(
          data.msg.language.result,
          data.msg.client.ch.stp(
            lan.VTmalicious,
            { cross: data.msg.client.constants.emotes.cross, severity: data.severity },
          ),
        )
        .setDescription(
          embed.description.replace(
            data.msg.client.ch.stp(
              lan.check,
              { loading: data.msg.client.constants.emotes.loading },
            ),
            data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }),
          ),
        )
        .setColor('#ff0000');
      data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
    }
    if (!check) client.emit('antivirusHandler', data.msg, data.link, 'virustotal');
    await end({
      msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
    }, check, embed, null, lan);
    return true;
  }

  if (data.text === 'NEW_URL') {
    if (embed.fields.length === 0) {
      await embed
        .addField(
          data.msg.language.result,
          data.msg.client.ch.stp(lan.newLink, { cross: data.msg.client.constants.emotes.cross }),
        )
        .setDescription(
          embed.description.replace(
            data.msg.client.ch.stp(
              lan.check,
              { loading: data.msg.client.constants.emotes.loading },
            ),
            data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }),
          ),
        )
        .setColor('#ff0000');
      data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
    }
    if (!check) client.emit('antivirusHandler', data.msg, data.link, 'newurl');
    end({
      msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
    }, check, embed, null, lan);
    return true;
  }
  if (data.text === 'DB_INSERT') {
    if (check && (data.severity !== null && data.severity < 2) && embed.fields.length === 0) {
      await embed
        .addField(
          data.msg.language.result,
          data.msg.client.ch.stp(lan.whitelisted, { tick: data.msg.client.constants.emotes.tick }),
        )
        .setDescription(
          embed.description.replace(
            data.msg.client.ch.stp(
              lan.check,
              { loading: data.msg.client.constants.emotes.loading },
            ),
            data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }),
          ),
        )
        .setColor('#00ff00');

      data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] });

      if (!check) {
        setTimeout(() => data.msg.m?.delete().catch(() => {
        }), 10000);
      }
    }
    client.ch.query('INSERT INTO antiviruslinks(link, severity, uses) VALUES ($1, $2, $3) ON CONFLICT (link) DO UPDATE SET uses = antiviruslinks.uses + 1, severity = $2;', [data.url, data.severity, 1]);
  }

  return false;
};
