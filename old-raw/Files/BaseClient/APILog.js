const fs = require('fs');
const { Console } = require('console');

const reqOutput = fs.createWriteStream('./Files/Downloads/Logs/Req.log');
const reqErrorOutput = fs.createWriteStream('./Files/Downloads/Logs/reqErr.log');

const reqLogger = new Console({
  stdout: reqOutput,
  stderr: reqErrorOutput,
  ignoreErrors: true,
  colorMode: false,
});

const resOutput = fs.createWriteStream('./Files/Downloads/Logs/Res.log');
const resErrorOutput = fs.createWriteStream('./Files/Downloads/Logs/resErr.log');

const resLogger = new Console({
  stdout: resOutput,
  stderr: resErrorOutput,
  ignoreErrors: true,
  colorMode: false,
});

module.exports = { reqLogger, resLogger };
