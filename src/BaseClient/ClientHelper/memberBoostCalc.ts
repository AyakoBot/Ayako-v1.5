import Discord from 'discord.js';
import client from '../ErisClient';

export default (
  bits: number,
  lan: typeof import('../../Languages/lan-en.json'),
  emotes = false,
) => {
  if (!bits) return [];
  const bitField = new Discord.BitField(bits);
  const flags = [];

  switch (true) {
    case bitField.has(1): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost1 : ''} ${lan.userFlags.Boost1}`);
      break;
    }
    case bitField.has(2): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost2 : ''} ${lan.userFlags.Boost2}`);
      break;
    }
    case bitField.has(4): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost3 : ''} ${lan.userFlags.Boost3}`);
      break;
    }
    case bitField.has(8): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost6 : ''} ${lan.userFlags.Boost6}`);
      break;
    }
    case bitField.has(16): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost9 : ''} ${lan.userFlags.Boost9}`);
      break;
    }
    case bitField.has(32): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost12 : ''} ${lan.userFlags.Boost12}`);
      break;
    }
    case bitField.has(64): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost15 : ''} ${lan.userFlags.Boost15}`);
      break;
    }
    case bitField.has(128): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost18 : ''} ${lan.userFlags.Boost18}`);
      break;
    }
    case bitField.has(256): {
      flags.push(`${emotes ? client.stringEmotes.userFlags.Boost24 : ''} ${lan.userFlags.Boost24}`);
      break;
    }
    default: {
      break;
    }
  }

  return flags;
};
