import * as Eris from 'eris';
import stringEmotes from '../Other/StringEmotes.json' assert { type: 'json' };

export default (
  bits: number,
  lan: typeof import('../../Languages/lan-en.json'),
  emotes = false,
) => {
  if (!bits) return [];
  const bitField = new Eris.Permission(BigInt(bits));
  const flags = [];

  if (bitField.has(1n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.DiscordEmployee : ''} ${lan.userFlags.DiscordEmployee}`,
    );
  }
  if (bitField.has(2n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.PartneredServerOwner : ''} ${
        lan.userFlags.PartneredServerOwner
      }`,
    );
  }
  if (bitField.has(4n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.HypesquadEvents : ''} ${lan.userFlags.HypesquadEvents}`,
    );
  }
  if (bitField.has(8n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.BughunterLevel1 : ''} ${lan.userFlags.BughunterLevel1}`,
    );
  }
  if (bitField.has(64n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.HouseBravery : ''} ${lan.userFlags.HouseBravery}`,
    );
  }
  if (bitField.has(128n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.HouseBrilliance : ''} ${lan.userFlags.HouseBrilliance}`,
    );
  }
  if (bitField.has(256n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.HouseBalance : ''} ${lan.userFlags.HouseBalance}`,
    );
  }
  if (bitField.has(512n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.EarlySupporter : ''} ${lan.userFlags.EarlySupporter}`,
    );
  }
  if (bitField.has(1024n)) {
    flags.push(`${lan.userFlags.TeamUser}`);
  }
  if (bitField.has(2048n)) {
    flags.push(`${emotes ? stringEmotes.userFlags.Bot : ''} ${lan.userFlags.Bot}`);
  }
  if (bitField.has(4096n)) {
    flags.push(`${emotes ? stringEmotes.userFlags.Nitro : ''} ${lan.userFlags.Nitro}`);
  }
  if (bitField.has(16384n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.BughunterLevel2 : ''} ${lan.userFlags.BughunterLevel2}`,
    );
  }
  if (bitField.has(65536n)) {
    flags.push(`${emotes ? stringEmotes.userFlags.VerifiedBot : ''} ${lan.userFlags.VerifiedBot}`);
  }
  if (bitField.has(131072n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.EarlyVerifiedBotDeveloper : ''} ${
        lan.userFlags.EarlyVerifiedBotDeveloper
      }`,
    );
  }
  if (bitField.has(262144n)) {
    flags.push(
      `${emotes ? stringEmotes.userFlags.DiscordCertifiedModerator : ''} ${
        lan.userFlags.DiscordCertifiedModerator
      }`,
    );
  }
  if (bitField.has(524288n)) {
    flags.push(`${lan.userFlags.BotHTTPInteractions}`);
  }

  return flags;
};
