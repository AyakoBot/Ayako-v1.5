const { parentPort } = require('worker_threads');

const SA = require('superagent');
const axios = require('axios');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const ch = require('../../../BaseClient/ClientHelper');
const constants = require('../../../Constants.json');

const auth = require('../../../BaseClient/auth.json');

parentPort.on('message', async (data) => {
  run(data);
});

/*
  {
    contentType: 'text/html; charset=ISO-8859-1',
    href: 'https://www.google.com/',
    url: 'https://www.google.com/',
    hostname: 'google.com',
    baseURL: 'https://google.com',
    baseURLhostname: 'google.com'
  }
*/

const run = async ({
  msgData,
  linkObject,
  lan,
  includedBadLink,
  check,
  blacklist,
  whitelist,
  whitelistCDN,
  blocklist,
}) => {
  if (includedBadLink) {
    return;
  }

  const websiteExists = await checkIfWebsiteExists(linkObject);
  if (!websiteExists) {
    parentPort.postMessage({ msgData, lan, linkObject, type: 'doesntExist', check });
    return;
  }

  const note = getNote(blacklist, linkObject);
  if (note) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({ msgData, lan, linkObject, note, check, type: 'blacklisted' });
    return;
  }

  const isFile = !!(
    linkObject.contentType?.includes('video') ||
    linkObject.contentType?.includes('image') ||
    linkObject.contentType?.includes('audio')
  );

  if (
    (whitelist.includes(linkObject.baseURLhostname) &&
      linkObject.hostname.endsWith(linkObject.baseURLhostname)) ||
    (whitelist.includes(linkObject.baseURLhostname) && !isFile) ||
    (isFile && whitelistCDN.includes(linkObject.baseURLhostname))
  ) {
    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'whitelisted' });
    return;
  }

  const sinkingYachtsBad = sinkingYatchtsCheck(linkObject);
  if (sinkingYachtsBad === true) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'blacklisted' });
    return;
  }

  const spamHausIncluded = await getSpamHaus(linkObject);
  if (
    blocklist.includes(linkObject.baseURLhostname) ||
    blacklist.includes(linkObject.baseURLhostname) ||
    spamHausIncluded
  ) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({ msgData, lan, linkObject, check, note, type: 'blacklisted' });
    return;
  }

  const urlIsNew = await getURLage(linkObject);
  if (urlIsNew && !Number.isNaN(urlIsNew)) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'newUrl' });
    return;
  }

  const postVTurlsRes = await postVTUrls(linkObject);
  const VTurls = postVTurlsRes?.stats;
  const urlsAttributes = postVTurlsRes;
  const urlSeverity = getSeverity(VTurls);
  if (Number.isNaN(urlSeverity)) {
    parentPort.postMessage({ type: 'VTfail', msgData, check, linkObject });
    return;
  }

  if (urlSeverity > 2) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({
      msgData,
      lan,
      linkObject,
      check,
      urlSeverity,
      type: 'severeLink',
    });
    return;
  }

  const attributes = urlsAttributes;
  if (attributes && `${+attributes.creation_date}000` > Date.now() - 604800000) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'newUrl' });
    return;
  }

  const selfCheckCatched = await selfChecker(linkObject);
  if (selfCheckCatched) {
    if (!check) {
      includedBadLink = true;
    }

    if (selfCheckCatched === 'ccscam') {
      parentPort.postMessage({
        msgData,
        lan,
        linkObject,
        check,
        type: 'ccscam',
      });
      return;
    }

    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'newUrl' });
    return;
  }

  const isCloudFlareProtected = await checkCloudFlare(linkObject);
  if (isCloudFlareProtected === true) {
    if (!check) {
      includedBadLink = true;
    }

    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'cloudFlare' });
    return;
  }

  if (attributes && !whitelist.includes(linkObject.baseURLhostname)) {
    fs.appendFile(
      'S:/Bots/ws/CDN/antivirus/whitelisted.txt',
      `\n${linkObject.baseURLhostname}`,
      () => {},
    );

    parentPort.postMessage({
      type: 'send',
      content: `${ch.makeCodeBlock(linkObject.baseURLhostname)}\n${ch.stp(
        constants.standard.discordUrlDB,
        {
          guildid: msgData.guildid ? msgData.guildid : '@me',
          channelid: msgData.channelid,
          msgid: msgData.msgid,
        },
      )}`,
      channelid: constants.standard.trashLogChannel,
    });

    parentPort.postMessage({ msgData, lan, linkObject, check, type: 'whitelisted' });
  }

  if (
    attributes &&
    !whitelist.includes(linkObject.hostname) &&
    linkObject.hostname !== linkObject.baseURLhostname
  ) {
    fs.appendFile('S:/Bots/ws/CDN/antivirus/whitelisted.txt', `\n${linkObject.hostname}`, () => {});

    parentPort.postMessage({
      type: 'send',
      content: `${ch.makeCodeBlock(linkObject.hostname)}\n${ch.stp(
        constants.standard.discordUrlDB,
        {
          guildid: msgData.guildid ? msgData.guildid : '@me',
          channelid: msgData.channelid,
          msgid: msgData.msgid,
        },
      )}`,
      channelid: constants.standard.trashLogChannel,
    });

    parentPort.postMessage({ msgData, lan, linkObject, check });
  }
};

const checkIfWebsiteExists = async (linkObject) => {
  const hostname = `${new URL(linkObject.url).protocol}//${linkObject.hostname}`;

  const [hrefRes, urlRes, baseUrlRes, hostnameRes] = await Promise.all([
    linkObject.href
      ? axios.get(linkObject.href).catch((e) => {
          return e;
        })
      : null,
    linkObject.url
      ? axios.get(linkObject.url).catch((e) => {
          return e;
        })
      : null,
    linkObject.baseURL
      ? axios.get(linkObject.baseURL).catch((e) => {
          return e;
        })
      : null,
    hostname
      ? axios.get(hostname).catch((e) => {
          return e;
        })
      : null,
  ]);

  let exists = false;

  if (
    (hrefRes && hrefRes.code !== 'ENOTFOUND') ||
    (urlRes && urlRes.code !== 'ENOTFOUND') ||
    (baseUrlRes && baseUrlRes.code !== 'ENOTFOUND') ||
    (hostnameRes && hostnameRes.code !== 'ENOTFOUND')
  ) {
    exists = true;
  }

  return exists;
};

const getNote = (blacklist, url) => {
  const include = [];

  blacklist.forEach((entry) => {
    if (entry.includes('|') && entry.split(/ \| /g)[0] === url.baseURLhostname) include.push(entry);
  });

  return include.find((entry) => entry !== undefined);
};

const getSpamHaus = async (linkObject) => {
  const res = await SA.get(`https://apibl.spamhaus.net/lookup/v1/dbl/${linkObject.baseURLhostname}`)
    .set('Authorization', `Bearer ${auth.spamhausToken}`)
    .set('Content-Type', 'application/json')
    .catch(() => {});

  return !!(res && res.status === 200);
};

const getURLage = async (linkObject) => {
  const ageInDays = await promptapi(linkObject);
  if (ageInDays && +ageInDays < 7) {
    return ageInDays;
  }

  return false;
};

const promptapi = async (linkObject) => {
  const promptapiRes = await SA.get(
    `https://api.promptapi.com/whois/query?domain=${linkObject.baseURLhostname}`,
  )
    .set('apikey', auth.promptAPIToken)
    .catch(() => {});

  if (
    promptapiRes &&
    promptapiRes.text &&
    JSON.parse(promptapiRes.text).result &&
    JSON.parse(promptapiRes.text).result.creation_date
  ) {
    return Math.ceil(
      Math.abs(
        new Date(JSON.parse(promptapiRes.text).result.creation_date).getTime() -
          new Date().getTime(),
      ) /
        (1000 * 3600 * 24),
    );
  }
  return undefined;
};

const postVTUrls = async (linkObject) => {
  if (!linkObject.href) {
    // eslint-disable-next-line no-console
    console.log(linkObject);
  }

  const res = await new Promise((resolve) => {
    SA.post('https://www.virustotal.com/api/v3/urls')
      .set('x-apikey', auth.VTtoken)
      .field('url', linkObject.href)
      .then((r) => {
        resolve(r.body);
      })
      .catch((e) => {
        resolve(e.body);
      });
  });

  if (res?.data.id) {
    return getNewVTUrls(res.data.id, 0);
  }

  return null;
};

const getNewVTUrls = async (id, i) => {
  if (i > 5) {
    throw new Error('Too many requests');
  }

  // eslint-disable-next-line no-async-promise-executor
  const res = await new Promise(async (resolve) => {
    await SA.get(`https://www.virustotal.com/api/v3/analyses/${id}`)
      .set('x-apikey', auth.VTtoken)
      .then((r) => {
        resolve(r.body);
      })
      .catch((e) => {
        resolve(e.body);
      });
  });

  if (res.data.attributes.status === 'completed') {
    return res.data.attributes;
  }

  if (res.data.attributes.status === 'queued' || res.data.attributes.status === 'in-progress') {
    return getNewVTUrlsTimeouted(id, 1);
  }

  return undefined;
};

const getNewVTUrlsTimeouted = async (id, i) => {
  i += 1;
  const timeout = 5000 * i;

  if (i > 5) {
    throw new Error('Too many requests');
  }

  const timeoutRes = await new Promise((timeoutResolve) => {
    setTimeout(async () => {
      const res = await new Promise((resolve) => {
        SA.get(`https://www.virustotal.com/api/v3/analyses/${id}`)
          .set('x-apikey', auth.VTtoken)
          .then((r) => {
            resolve(r.body);
          })
          .catch((e) => {
            resolve(e.body);
          });
      });

      if (res.data.attributes.status === 'completed') {
        timeoutResolve(res.data.attributes);
      } else if (
        res.data.attributes.status === 'queued' ||
        res.data.attributes.status === 'in-progress'
      ) {
        timeoutResolve(null);
        timeoutResolve(await getNewVTUrlsTimeouted(id, i));
      }
    }, timeout * i);
  });

  if (timeoutRes) {
    return timeoutRes;
  }

  return null;
};

const getSeverity = (VTresponse) => {
  if (
    !VTresponse ||
    VTresponse === 'QuotaExceededError' ||
    typeof VTresponse.suspicious !== 'number'
  ) {
    return undefined;
  }

  let severity = 0;

  if (VTresponse.suspicious) {
    severity = VTresponse.suspicious % 10;
  }

  if (VTresponse.malicious) {
    if (VTresponse.malicious > 1 && VTresponse.malicious < 5) {
      severity += 6;
    } else if (VTresponse.malicious > 50) {
      severity = 100;
    }

    severity += VTresponse.malicious * 2;
  }
  return severity;
};

const selfChecker = async (linkObject) => {
  const siteHTML = (await axios.get(linkObject.href).catch((e) => e))?.data;
  if (!siteHTML) return false;
  // eslint-disable-next-line no-useless-escape
  const siteNameBad =
    /property=["'`]og:site_name["'`](.*)content=["'`]discord["'`]>/gi.test(siteHTML) ||
    /<title>(.*)Discord(.*)<\/title>/gi.test(siteHTML) ||
    /<title>Redeem Promotion(.*)<\/title>/gi.test(siteHTML);
  const embedNameBad = /property=["'`]og:title["'`](.*)content=["'`]discord/gi.test(siteHTML);

  const args = siteHTML.split(/["'`]+/);
  const embedDescription = args[args.indexOf('og:description') + 2];
  const similarity = stringSimilarity.compareTwoStrings(
    embedDescription,
    'Discord is the easiest way to talk over voice, video, and text. Talk, chat, hang out, and stay close with your friends and communities.',
  );
  const embedDescriptionBad = Math.round(similarity * 100) > 80;

  const usesDiscordSlogan =
    /we[`|'|´|"]re[\n|\s](.*)so[\n|\s](.*)excited[\n|\s](.*)to[\n|\s](.*)see[\n|\s](.*)you[\n|\s](.*)again/gi.test(
      siteHTML,
    );
  const usesDiscordImage =
    /property=["'`]og:image["'`](.*)content=["'`]https:\/\/discord\.com\/assets\/652f40427e1f5186ad54836074898279\.png["'`]>/gi.test(
      siteHTML,
    ) ||
    /property=["'`]og:image["'`](.*)content=["'`]\/assets\/652f40427e1f5186ad54836074898279\.png["'`]>/gi.test(
      siteHTML,
    ) ||
    /rel=["'`]icon["'`](.*)href=["'`]https:\/\/discord\.com\/assets\/847541504914fd33810e70a0ea73177e\.ico["'`]/gi.test(
      siteHTML,
    );

  const websiteProbablyAdvertisesNitro =
    /(.*)3\smonths/gi.test(siteHTML) || /discord(.*)nitro(.*)free(.*)steam/gi.test(siteHTML);

  const wantsCCNumber = /(.*)credit\scard\s(Number|)/gi.test(siteHTML);
  const wantsCCexpiry = /(.*)Expiration\sDate/gi.test(siteHTML);
  const wantsCCcvc = /(.*)cvc/gi.test(siteHTML);
  const wantsCCzip = /(.*)(Postcode|zip)/gi.test(siteHTML);
  const wantsCCname = /[^_|^s]name[^=]/gi.test(siteHTML);

  if (
    (siteNameBad && websiteProbablyAdvertisesNitro) ||
    (embedNameBad && embedDescriptionBad && usesDiscordImage) ||
    usesDiscordSlogan
  ) {
    if (wantsCCNumber && wantsCCexpiry && wantsCCcvc && wantsCCzip && wantsCCname) return 'ccscam';
    return 'nitroscam';
  }
  return false;
};

// https://phish.sinking.yachts/
const sinkingYatchtsCheck = async (linkObject) => {
  const res = await SA.get(`https://phish.sinking.yachts/v2/check/${linkObject.baseURLhostname}`)
    .set('X-Identity', `Discord Bot - Owner ID ${auth.ownerID}`)
    .catch(() => {});

  if (res && res.statusCode === 200) {
    return res.body;
  }
  return 'unkown';
};

const checkCloudFlare = async (linkObject) => {
  const res = await SA.get(linkObject.href).catch((e) => e);

  if (res && res.response) {
    return (
      /https:\/\/www\.cloudflare\.com\/5xx-error-landing/gi.test(res.response?.text) &&
      /We\sare\schecking\syour\sbrowser/gi.test(res.response?.text)
    );
  }
  return 'unkown';
};
