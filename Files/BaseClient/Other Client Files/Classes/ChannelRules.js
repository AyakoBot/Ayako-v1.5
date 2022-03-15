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
  HasLeastAttachments: 1n << 0n,
  HasMostAttachments: 1n << 1n,
  HasLeastCharacters: 1n << 2n,
  HasMostCharacters: 1n << 3n,
  HasLeastWords: 1n << 4n,
  HasMostWords: 1n << 5n,
  MentionsLeastUsers: 1n << 6n,
  MentionsMostUsers: 1n << 7n,
  MentionsLeastChannels: 1n << 8n,
  MentionsMostChannels: 1n << 9n,
  MentionsLeastRoles: 1n << 10n,
  MentionsMostRoles: 1n << 11n,
  HasLeastLinks: 1n << 12n,
  HasMostLinks: 1n << 13n,
  HasLeastEmotes: 1n << 14n,
  HasMostEmotes: 1n << 15n,
  HasLeastMentions: 1n << 16n,
  HasMostMentions: 1n << 17n,
};

ChannelRules.All = Object.values(ChannelRules.Flags).reduce((all, p) => all | p, 0n);

ChannelRules.defaultBit = BigInt(0);

module.exports = ChannelRules;
