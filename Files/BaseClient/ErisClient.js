const Eris = require('eris');
const auth = require('./auth.json');

const eris = new Eris(`Bot ${auth.token}`);

module.exports = eris;
