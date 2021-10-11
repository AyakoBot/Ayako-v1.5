const auth = require('./auth.json');

const eris = require('eris');
const Eris = new eris(auth.token);

module.exports = Eris;