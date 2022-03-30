const fs = require('fs');
const path = require('path');
const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');

const files = [];

const aliases = [];
fs.readdirSync(path.join(__dirname, '/interactions')).forEach((fileName) => {
  const file = require(`./interactions/${fileName}`);
  files.push({ name: file.name, aliases: file.aliases });
  if (file.aliases) aliases.push(...file.aliases);
  aliases.push(file.name);
});

module.exports = {
  name: 'interactions',
  aliases,
  perm: null,
  dm: false,
  takesFirstArg: false,
  type: 'fun',
  async execute(msg) {
    const [, prefix] = await require('../Events/messageEvents/messageCreate/commandHandler').prefix(
      msg,
    );
    const args = msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/);
    const usedCommandName = args.shift().toLowerCase();

    const interaction =
      msg.client.interactions.get(usedCommandName) ||
      msg.client.interactions.find((i) => i.aliases.includes(usedCommandName));

    const { gif, loneError } = await interaction.execute(msg);
    const text = getMainText(msg, usedCommandName);

    if (loneError) {
      msg.client.ch.reply(msg, { content: msg.lan.loneError }).then((m) => {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          m.delete().catch(() => {});
          msg.delete().catch(() => {});
        });
      });
      return;
    }

    const small = await getMode(msg);

    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(text)
      .setColor(msg.client.ch.colorSelector(msg.guild.me));

    if (small) embed.setThumbnail(gif);
    else embed.setImage(gif);

    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};

const getMainText = (msg, usedCommandName) => {
  const mentioned = getMentioned(msg);
  const lastMention = mentioned.length > 1 ? mentioned.pop() : null;
  const mentionText = getMentionText(msg, lastMention, mentioned);
  const saidText = msg.args
    .slice(1)
    .join(' ')
    .replace(/<@(!)?[0-9]+>/g, '')
    .replace(/\s+/g, ' ');

  return getText(msg, saidText, mentionText, usedCommandName);
};

const getMode = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT interactionsmode FROM guildsettings WHERE guildid = $1;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0].interactionsmode;
  return true;
};

const getMentioned = (msg) => {
  let mentioned = [];

  if (msg.mentions.repliedUser) mentioned.push(msg.mentions.repliedUser);
  if (msg.mentions.users.size) mentioned = [].concat(msg.mentions.users.map((o) => o));

  return mentioned;
};

const getMentionText = (msg, lastMention, mentioned) => {
  let mentionText;

  if (mentioned.length === 1 && !lastMention) mentionText = `${mentioned[0]}`;
  else if (mentioned.length === 1 && lastMention) {
    mentionText = `${mentioned[0]} ${msg.lan.connector} ${lastMention}`;
  } else mentionText = `${mentioned.join(', ')} ${msg.lan.connector} ${lastMention}`;

  return mentionText;
};

const getText = (msg, saidText, mentionText, usedCommandName) => {
  let text;

  if (saidText.startsWith(' ')) saidText = saidText.slice(1, saidText.length);
  if (saidText.endsWith(' ')) saidText = saidText.slice(0, saidText.length - 1);

  if (saidText !== ' '.repeat(saidText.length)) {
    saidText = msg.client.ch.stp(msg.lan.saying, { text: saidText });
  } else saidText = ' ';

  if (msg.mentions.users.size === 1 && msg.mentions.has(msg.author.id)) {
    text = msg.client.ch.stp(`${msg.lan.self[usedCommandName]}`, {
      msg,
      users: mentionText,
      text: saidText,
    });
  }

  if (!msg.mentions.users.size) {
    text = msg.client.ch.stp(`${msg.lan.lone[usedCommandName]}`, {
      msg,
      text: saidText,
    });
  }

  if (msg.mentions.users.size && !msg.mentions.has(msg.author.id)) {
    let lan = msg.lan.all[usedCommandName];

    if (!lan && msg.mentions.users.size === 1) lan = msg.lan.one[usedCommandName];
    if (!lan && msg.mentions.users.size > 1) lan = msg.lan.many[usedCommandName];

    text = msg.client.ch.stp(lan, {
      msg,
      users: mentionText,
      text: saidText,
    });
  }

  return text;
};
