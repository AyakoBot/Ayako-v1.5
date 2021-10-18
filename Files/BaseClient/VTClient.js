const VT = require('node-virustotal');
const auth = require('./auth.json');

const defaultTimedInstance = VT.makeAPI();
defaultTimedInstance.setKey(auth.VTtoken);

module.exports = defaultTimedInstance;