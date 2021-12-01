const imgur = require('imgur');
const auth = require('./auth.json');

imgur.setClientId(auth.Imgur.clientId);

module.exports = { imgur };
