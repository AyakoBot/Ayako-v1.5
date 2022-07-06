import jobs from 'node-schedule';
import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message) => {
  if (!msg.channel) return;
  if (typeof msg.channel.type !== 'number' || msg.channel.type === 1) return;
  if (!msg.author || msg.author.bot) return;
  if (!msg.member) return;
  if (!client.ch.isManageable(msg.member, msg.guild?.members.get(client.user.id))) return;

  const blacklistsRow = await client.ch
    .query('SELECT * FROM blacklists WHERE guildid = $1 AND active = true;', [msg.guildID])
    .then((r: DBT.blacklists[] | null) => (r ? r[0] : null));

  if (!blacklistsRow) return;

  if (blacklistsRow.bpchannelid?.includes(msg.channel.id)) return;
  if (blacklistsRow.bpuserid?.includes(msg.author.id)) return;
  if (msg.member?.roles.some((r) => blacklistsRow.bproleid?.includes(r))) return;
  if (!blacklistsRow.words) return;

  const blwords = blacklistsRow.words;
  const words: string[] = [];

  const included = blwords
    .map((w) => {
      if (msg.content.toLowerCase().includes(w.toLowerCase())) {
        words.push(w);
        return true;
      }
      return false;
    })
    .filter((s) => !!s);

  if (!included.length) return;

  await msg.delete().catch(() => null);

  const language = await client.ch.languageSelector(msg.guildID);

  const m = await client.ch.send(
    msg.channel,
    { content: client.ch.stp(language.commands.toxicityCheck.warning, { user: msg.author }) },
    msg.language,
  );

  if (m) {
    if (Array.isArray(m)) return;
    jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
      if (m) m.delete().catch(() => null);
    });
  }

  sendDm(msg, words);

  const amount = await getAmount(msg);

  if (
    blacklistsRow.warntof === true &&
    amount === Number(blacklistsRow.warnafter) &&
    amount !== Number(blacklistsRow.muteafter)
  ) {
    client.emit(
      'modBaseEvent',
      {
        executor: client.user,
        target: msg.author,
        reason: language.commands.toxicityCheck.warnReason,
        msg,
        guild: msg.guild,
      },
      'warnAdd',
    );
    return;
  }

  if (
    blacklistsRow.mutetof === true &&
    amount % Number(blacklistsRow.muteafter) === 0 &&
    amount !== Number(blacklistsRow.kickafter)
  ) {
    client.emit(
      'modBaseEvent',
      {
        executor: client.user,
        target: msg.author,
        reason: language.commands.toxicityCheck.warnReason,
        msg,
        guild: msg.guild,
        duration: 3600000,
      },
      'tempmuteAdd',
    );
    return;
  }

  if (
    blacklistsRow.kicktof === true &&
    amount % Number(blacklistsRow.kickafter) === 0 &&
    amount !== Number(blacklistsRow.banafter)
  ) {
    client.emit(
      'modBaseEvent',
      {
        executor: client.user,
        target: msg.author,
        reason: language.commands.toxicityCheck.warnReason,
        msg,
        guild: msg.guild,
      },
      'kickAdd',
    );
    return;
  }

  if (blacklistsRow.bantof === true && amount >= Number(blacklistsRow.banafter)) {
    client.emit(
      'modBaseEvent',
      {
        executor: client.user,
        target: msg.author,
        reason: language.commands.toxicityCheck.warnReason,
        msg,
        guild: msg.guild,
      },
      'banAdd',
    );
  }
};

const getAmount = async (msg: CT.Message) => {
  let amount;

  const toxicitycheckRow = await client.ch
    .query('SELECT * FROM toxicitycheck WHERE userid = $2 AND guildid = $1;', [
      msg.guildID,
      msg.author.id,
    ])
    .then((r: DBT.toxicitycheck[] | null) => (r ? r[0] : null));

  if (toxicitycheckRow) {
    client.ch.query('UPDATE toxicitycheck SET amount = $2 WHERE userid = $3 AND guildid = $1;', [
      msg.guildID,
      Number(toxicitycheckRow.amount) + 1,
      msg.author.id,
    ]);
    amount = Number(toxicitycheckRow.amount);
  } else {
    client.ch.query('INSERT INTO toxicitycheck (guildid, userid, amount) VALUES ($1, $3, $2);', [
      msg.guildID,
      1,
      msg.author.id,
    ]);
    amount = 0;
  }
  amount += 1;

  return amount;
};

const sendDm = async (msg: CT.Message, words: string[]) => {
  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: msg.language.commands.toxicityCheck.author,
      icon_url: client.objectEmotes.warning.link,
      url: client.constants.standard.invite,
    },
    description: `${client.ch.stp(msg.language.commands.toxicityCheck.info, {
      guild: msg.guild,
    })} ${words.map((w) => `\`${w}\``)}`,
    color: client.constants.commands.toxicityCheck,
  };

  const DMchannel = await msg.author.getDMChannel().catch(() => null);
  if (DMchannel) client.ch.send(DMchannel, { embeds: [embed] }, msg.language);
};
