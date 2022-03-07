// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const ms = require('ms');
const util = require('util');
const auth = require('../BaseClient/auth.json');

const reg = new RegExp(auth.token, 'g');

module.exports = {
  name: 'eval',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  async execute(msg) {
    if (msg.author.id !== auth.ownerID) return;
    const clean = (text) => {
      if (typeof text === 'string') {
        return text
          .replace(/`/g, `\`${String.fromCharCode(8203)}`)
          .replace(/@/g, `@${String.fromCharCode(8203)}`)
          .replace(reg, 'TOKEN');
      }
      return text;
    };
    try {
      let code = `${msg.args.slice(0).join(' ')}`;
      if (code.startsWith('```')) code = code.replace(/```js/g, '').replace(/```/g, '');
      // eslint-disable-next-line no-eval
      let evaled = await eval(`(async () => {${code}})()`);
      if (typeof evaled !== 'string') evaled = util.inspect(evaled);

      if (evaled.length > 2000) {
        msg.client.ch.reply(msg, 'Too long, check console');
        console.log(evaled);
      } else if (clean(evaled) !== 'undefined') {
        msg.client.ch.reply(msg, `\n${msg.client.ch.makeCodeBlock(`q\n${clean(evaled)}`)}`);
      } else msg.react(msg.client.objectEmotes.cross.id);
    } catch (err) {
      if (err.length > 2000) {
        msg.client.ch.reply(msg, 'Too long, check console');
        console.log(err);
      } else if (clean(err) !== 'undefined') {
        msg.client.ch.reply(
          msg,
          `\`ERROR\` \n${msg.client.ch.makeCodeBlock(`q\n${clean(err)}`)}\n`,
        );
      } else msg.react(msg.client.objectEmotes.cross.id);
    }
    // eslint-disable-next-line no-unused-vars
    async function send(text) {
      msg.client.ch.send(msg.channel, { content: clean(text) });
    }
  },
};
