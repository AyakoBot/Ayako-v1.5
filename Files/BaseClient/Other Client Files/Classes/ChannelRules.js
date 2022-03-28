const { BitField } = require('discord.js');

class ChannelRules extends BitField {}

ChannelRules.Flags = {
  HasLeastAttachments: 1 << 0,
  HasMostAttachments: 1 << 1,
  HasLeastCharacters: 1 << 2,
  HasMostCharacters: 1 << 3,
  HasLeastWords: 1 << 4,
  HasMostWords: 1 << 5,
  MentionsLeastUsers: 1 << 6,
  MentionsMostUsers: 1 << 7,
  MentionsLeastChannels: 1 << 8,
  MentionsMostChannels: 1 << 9,
  MentionsLeastRoles: 1 << 10,
  MentionsMostRoles: 1 << 11,
  HasLeastLinks: 1 << 12,
  HasMostLinks: 1 << 13,
  HasLeastEmotes: 1 << 14,
  HasMostEmotes: 1 << 15,
  HasLeastMentions: 1 << 16,
  HasMostMentions: 1 << 17,
};

ChannelRules.All = Object.values(ChannelRules.Flags).reduce((all, p) => all | p, 0);

ChannelRules.defaultBit = BigInt(0);

module.exports = ChannelRules;
