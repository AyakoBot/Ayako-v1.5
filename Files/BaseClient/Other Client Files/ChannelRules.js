const { BitField } = require('discord.js');

class ChannelRules extends BitField {
  missing(bits) {
    return super.missing(bits);
  }

  any(permission) {
    return super.any(permission);
  }

  has(permission) {
    return super.has(permission);
  }
}

ChannelRules.Flags = {
  HAS_LEAST_ATTACHMENTS: 1n << 0n,
  HAS_MOST_ATTACHMENTS: 1n << 1n,
  HAS_LEAST_CHARACTERS: 1n << 2n,
  HAS_MOST_CHARACTERS: 1n << 3n,
  HAS_LEAST_WORDS: 1n << 4n,
  HAS_MOST_WORDS: 1n << 5n,
  MENTIONS_LEAST_USERS: 1n << 6n,
  MENTIONS_MOST_USERS: 1n << 7n,
  MENTIONS_LEAST_CHANNELS: 1n << 8n,
  MENTIONS_MOST_CHANNELS: 1n << 9n,
  MENTIONS_LEAST_ROLES: 1n << 10n,
  MENTIONS_MOST_ROLES: 1n << 11n,
  HAS_LEAST_LINKS: 1n << 12n,
  HAS_MOST_LINKS: 1n << 13n,
  HAS_LEAST_EMOTES: 1n << 14n,
  HAS_MOST_EMOTES: 1n << 15n,
  HAS_LEAST_MENTIONS: 1n << 16n,
  HAS_MOST_MENTIONS: 1n << 17n,
};

ChannelRules.ALL = Object.values(ChannelRules.Flags).reduce((all, p) => all | p, 0n);

ChannelRules.defaultBit = BigInt(0);

module.exports = ChannelRules;
