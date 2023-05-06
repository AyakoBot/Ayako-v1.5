const fs = require('fs');
const path = require('path');
const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');
const Discord = require('discord.js');

const interactionFiles = [];
let aliases = [];

const getAliases = () => {
  aliases = [];

  fs.readdirSync(path.join(__dirname, '/Interactions')).forEach((fileName) => {
    const file = require(`./Interactions/${fileName}`);
    interactionFiles.push({ name: file.name, aliases: file.aliases });
    if (file.aliases) aliases.push(...file.aliases);
    aliases.push(file.name);
  });
};

getAliases();

module.exports = {
  name: 'interactions',
  aliases,
  perm: null,
  dm: false,
  takesFirstArg: false,
  type: 'fun',
  queueAble: true,
  async execute(msg) {
    const interaction = await getInteraction(msg);
    if (!interaction) return;
    const loneError = !msg.mentions.users.size && !msg.lan.lone[interaction.name];

    if (loneError) {
      checkMentionFuckup(msg);
      if (!msg.mentions.users.size) {
        needMentions(msg);
        return;
      }
    }

    const commandName = msg.content.split(/\s+/g)[0].toLowerCase();
    const [, prefix] = await require('./../Events/messageEvents/messageCreate/commandHandler').prefix(
      msg,
    );
    const usedAlias = commandName.replace(prefix, '');

    const text = getMainText(msg, interaction.name, usedAlias);
    const small = await getMode(msg);
    const gif = await getGif(msg, interaction);

    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(text)
      .setColor(msg.client.ch.colorSelector(msg.guild.members.me));

    if (small) embed.setThumbnail(gif);
    else embed.setImage(gif);

    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};

const getMainText = (msg, usedCommandName, usedAlias) => {
  const mentioned = getMentioned(msg);
  const lastMention = mentioned.length > 1 ? mentioned.pop() : null;
  const mentionText = getMentionText(msg, lastMention, mentioned);
  const saidText = msg.args
    .slice(0)
    .join(' ')
    .replace(/<@(!)?[0-9]+>/g, '')
    .replace(/\s+/g, ' ');

  return getText(msg, saidText, mentionText, usedCommandName, usedAlias);
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

const getText = (msg, saidText, mentionText, usedCommandName, usedAlias) => {
  let text;
  let uncutContent;

  if (saidText.startsWith(' ')) saidText = saidText.slice(1, saidText.length);
  if (saidText.endsWith(' ')) saidText = saidText.slice(0, saidText.length - 1);

  if (saidText !== ' '.repeat(saidText.length)) {
    uncutContent = `${saidText}`;
    saidText = ` "${uncutContent}"`;
  } else {
    saidText = ' ';
    uncutContent = ' ';
  }

  if (msg.mentions.users.size === 1 && msg.mentions.has(msg.author.id)) {
    text = msg.client.ch.stp(`${msg.lan.self[usedAlias] ?? msg.lan.self[usedCommandName]}`, {
      msg,
      users: mentionText,
      text: saidText,
    });
  }

  if (!msg.mentions.users.size) {
    text = msg.client.ch.stp(`${msg.lan.lone[usedAlias] ?? msg.lan.lone[usedCommandName]}`, {
      msg,
      text: saidText,
    });
  }

  if (msg.mentions.users.size && !msg.mentions.has(msg.author.id)) {
    let lan = msg.lan.all[usedAlias] ?? msg.lan.all[usedCommandName];

    if (!lan && msg.mentions.users.size === 1) lan = msg.lan.one[usedAlias] ?? msg.lan.one[usedCommandName];
    if (!lan && msg.mentions.users.size > 1) lan = msg.lan.many[usedAlias] ?? msg.lan.many[usedCommandName];

    text = msg.client.ch.stp(lan, {
      msg,
      users: mentionText,
      text: saidText,
      uncutContent,
    });
  }

  return text;
};

const needMentions = (msg) => {
  msg.client.ch.reply(msg, { content: msg.lan.loneError }).then((m) => {
    jobs.scheduleJob(new Date(Date.now() + 10000), () => {
      m.delete().catch(() => {});
      msg.delete().catch(() => {});
    });
  });
};

const checkMentionFuckup = (msg) => {
  if (!/@(.{2,})#(\d{4})/g.test(msg.content)) return;

  const fuckups = msg.content.match(/@(.{2,})#(\d{4})/g);

  const mentions = fuckups.map((fuckup) =>
    msg.guild.members.cache.find((m) => m.user.tag === fuckup.slice(1, fuckup.length)),
  );

  const newCollection = new Discord.Collection();
  mentions.forEach((m) => newCollection.set(m.user.id, m.user));
  msg.mentions.users = newCollection;

  fuckups.forEach((fuckup) => {
    msg.args.splice(msg.args.indexOf(fuckup), 1);
  });
};

const getGif = (msg, interaction) => {
  if (interaction.isAsync) return interaction.gif(msg);

  const random = Math.floor(Math.random() * interaction.gifs.length);
  return interaction.gifs[random];
};

const getInteraction = async (msg) => {
  getAliases();

  const [, prefix] = await require('../Events/messageEvents/messageCreate/commandHandler').prefix(
    msg,
  );
  const args = msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/);
  const dir = `${require.main.path}/Files/Commands/Interactions`;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  const searchedFileName = args.shift().toLowerCase();

  const file = files
    .map((c) => {
      const possibleFile = require(`${dir}/${c}`);
      if (
        possibleFile.name === searchedFileName ||
        possibleFile.aliases?.includes(searchedFileName)
      ) {
        return possibleFile;
      }
      return null;
    })
    .filter((f) => !!f)[0];

  return file;
};
