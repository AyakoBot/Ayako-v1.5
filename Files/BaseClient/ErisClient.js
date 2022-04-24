const Eris = require('eris');
const auth = require('./auth.json');

const eris = new Eris(`Bot ${auth.token}`, {
  allowedMentions: {
    everyone: false,
    roles: false,
    users: false,
    repliedUser: false,
  },
  defaultImageFormat: 'png',
  defaultImageSize: 2048,
  messageLimit: 11885,
  restMode: true,
});

module.exports = eris;
