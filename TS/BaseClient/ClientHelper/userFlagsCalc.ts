import Discord from 'discord.js';
import client from '../ErisClient';

export default (
  bits: number,
  lan: typeof import('../../Languages/lan-en.json'),
  emotes = false,
) => {
  if (!bits) return [];
  const bitField = new Discord.UserFlagsBitField(Number(bits));
  const flags = [];

  if (bitField.has(1)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.DiscordEmployee : ''} ${
        lan.userFlags.DiscordEmployee
      }`,
    );
  }
  if (bitField.has(2)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.PartneredServerOwner : ''} ${
        lan.userFlags.PartneredServerOwner
      }`,
    );
  }
  if (bitField.has(4)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.HypesquadEvents : ''} ${
        lan.userFlags.HypesquadEvents
      }`,
    );
  }
  if (bitField.has(8)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.BughunterLevel1 : ''} ${
        lan.userFlags.BughunterLevel1
      }`,
    );
  }
  if (bitField.has(64)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.HouseBravery : ''} ${lan.userFlags.HouseBravery}`,
    );
  }
  if (bitField.has(128)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.HouseBrilliance : ''} ${
        lan.userFlags.HouseBrilliance
      }`,
    );
  }
  if (bitField.has(256)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.HouseBalance : ''} ${lan.userFlags.HouseBalance}`,
    );
  }
  if (bitField.has(512)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.EarlySupporter : ''} ${
        lan.userFlags.EarlySupporter
      }`,
    );
  }
  if (bitField.has(1024)) {
    flags.push(`${lan.userFlags.TeamUser}`);
  }
  if (bitField.has(2048)) {
    flags.push(`${emotes ? client.stringEmotes.userFlags.Bot : ''} ${lan.userFlags.Bot}`);
  }
  if (bitField.has(4096)) {
    flags.push(`${emotes ? client.stringEmotes.userFlags.Nitro : ''} ${lan.userFlags.Nitro}`);
  }
  if (bitField.has(16384)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.BughunterLevel2 : ''} ${
        lan.userFlags.BughunterLevel2
      }`,
    );
  }
  if (bitField.has(65536)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.VerifiedBot : ''} ${lan.userFlags.VerifiedBot}`,
    );
  }
  if (bitField.has(131072)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.EarlyVerifiedBotDeveloper : ''} ${
        lan.userFlags.EarlyVerifiedBotDeveloper
      }`,
    );
  }
  if (bitField.has(262144)) {
    flags.push(
      `${emotes ? client.stringEmotes.userFlags.DiscordCertifiedModerator : ''} ${
        lan.userFlags.DiscordCertifiedModerator
      }`,
    );
  }
  if (bitField.has(524288)) {
    flags.push(`${lan.userFlags.BotHTTPInteractions}`);
  }

  return flags;
};
