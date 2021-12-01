const AutoPoster = require('topgg-autoposter');
const SDK = require('@top-gg/sdk');
const express = require('express');
const auth = require('./auth.json');
const client = require('./DiscordClient');
const ch = require('./ClientHelper');

const AP = AutoPoster(auth.topggToken, client);
const app = express();
const webhook = new SDK.Webhook(auth.webhookPW);

app.post(
  '/dblwebhook',
  webhook.listener((vote) => {
    ch.send(client.channels.cache.get('834770912724647966'), `${vote.user} | ${vote.isWeekend}`);
    console.log(vote);
  }),
);
app.listen(80);

module.exports = { AP };
