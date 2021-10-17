const auth = require('./auth.json');

const eris = require('eris');
const Eris = new eris(`Bot ${auth.token}`);

module.exports = Eris;