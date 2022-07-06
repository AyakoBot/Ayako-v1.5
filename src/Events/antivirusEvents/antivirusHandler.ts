import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';

export default async (msg: CT.Message, m: Eris.Message, type: string) => {
  if (msg) msg.delete().catch(() => null);

  let amountOfTimes = await client.ch
    .query('SELECT * FROM antiviruslog WHERE userid = $1;', [msg.author.id])
    .then((r: DBT.antiviruslog[] | null) => (r ? r.length : 0));

  client.ch.query(
    'INSERT INTO antiviruslog (guildid, userid, type, dateofwarn) VALUES ($1, $2, $3, $4);',
    [msg.guildID, msg.author.id, type, Date.now()],
  );
  amountOfTimes += 1;

  const settingsRow = await client.ch
    .query('SELECT * FROM antivirus WHERE guildid = $1 AND active = true;', [msg.guildID])
    .then((r: DBT.antivirus[] | null) => (r ? r[0] : null));

  if (settingsRow) {
    switch (true) {
      case amountOfTimes >= Number(settingsRow.banafterwarnsamount) &&
        settingsRow.bantof === true: {
        doPunish('banAdd', msg, m);
        return;
      }
      case amountOfTimes >= Number(settingsRow.kickafterwarnsamount) &&
        settingsRow.kicktof === true: {
        doPunish('kickAdd', msg, m);
        return;
      }
      case amountOfTimes >= Number(settingsRow.muteafterwarnsamount) &&
        settingsRow.mutetof === true: {
        doPunish('tempmuteAdd', msg, m);
        return;
      }
      case amountOfTimes >= Number(settingsRow.warnafterwarnsamount) &&
        settingsRow.warntof === true: {
        doPunish('warnAdd', msg, m);
        return;
      }
      case amountOfTimes >= 1 && settingsRow.verbaltof === true: {
        softwarn(msg);
        return;
      }
      default: {
        break;
      }
    }
  }

  client.emit('modSourceHandler', m, 'antivirus', settingsRow);
};

const doPunish = (type: CT.ModBaseEventOptions['type'], msg: CT.Message, m: Eris.Message) => {
  if (!msg.guild) return;

  const options: CT.ModBaseEventOptions = {
    executor: client.user,
    target: msg.author,
    reason: msg.language.autotypes.antivirus,
    msg,
    m,
    guild: msg.guild,
    type,
  };

  client.emit('modBaseEvent', options);
};

const softwarn = (msg: CT.Message) => {
  client.ch.send(
    msg.channel,
    {
      content: `${msg.author} ${msg.language.mod.warnAdd.antivirus.description}`,
      allowedMentions: {
        users: [msg.author.id],
      },
    },
    msg.language,
  );
};
