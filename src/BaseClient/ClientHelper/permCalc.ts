import Discord from 'discord.js';

export default (
  bits: number,
  lan: typeof import('../../Languages/lan-en.json'),
  isntRole: false,
) => {
  const bitField = new Discord.PermissionsBitField(BigInt(bits));
  const perms = [];

  switch (true) {
    case bitField.has(1n, false): {
      perms.push(lan.permissions.CreateInstantInvite);
      break;
    }
    case bitField.has(2n, false): {
      perms.push(lan.permissions.KickMembers);
      break;
    }
    case bitField.has(4n, false): {
      perms.push(lan.permissions.BanMembers);
      break;
    }
    case bitField.has(8n, false): {
      perms.push(lan.permissions.Administrator);
      break;
    }
    case bitField.has(16n, false): {
      if (isntRole) {
        perms.push(lan.permissions.ManageChannel);
      } else {
        perms.push(lan.permissions.ManageChannels);
      }
      break;
    }
    case bitField.has(32n, false): {
      perms.push(lan.permissions.AddReactions);
      break;
    }
    case bitField.has(64n, false): {
      perms.push(lan.permissions.AddReactions);
      break;
    }
    case bitField.has(128n, false): {
      perms.push(lan.permissions.ViewAuditLog);
      break;
    }
    case bitField.has(256n, false): {
      perms.push(lan.permissions.PrioritySpeaker);
      break;
    }
    case bitField.has(512n, false): {
      perms.push(lan.permissions.Stream);
      break;
    }
    case bitField.has(1024n, false): {
      if (isntRole) {
        perms.push(lan.permissions.ViewChannel);
      } else {
        perms.push(lan.permissions.ViewChannels);
      }
      break;
    }
    case bitField.has(2048n, false): {
      perms.push(lan.permissions.SendMessages);
      break;
    }
    case bitField.has(4096n, false): {
      perms.push(lan.permissions.SendTTSMessages);
      break;
    }
    case bitField.has(8192n, false): {
      perms.push(lan.permissions.ManageMessages);
      break;
    }
    case bitField.has(16384n, false): {
      perms.push(lan.permissions.EmbedLinks);
      break;
    }
    case bitField.has(32768n, false): {
      perms.push(lan.permissions.AttachFiles);
      break;
    }
    case bitField.has(65536n, false): {
      perms.push(lan.permissions.ReadMessageHistory);
      break;
    }
    case bitField.has(131072n, false): {
      perms.push(lan.permissions.MentionEveryone);
      break;
    }
    case bitField.has(262144n, false): {
      perms.push(lan.permissions.UseExternalEmojis);
      break;
    }
    case bitField.has(524288n, false): {
      perms.push(lan.permissions.ViewGuildInsights);
      break;
    }
    case bitField.has(1048576n, false): {
      perms.push(lan.permissions.Connect);
      break;
    }
    case bitField.has(2097152n, false): {
      perms.push(lan.permissions.Speak);
      break;
    }
    case bitField.has(4194304n, false): {
      perms.push(lan.permissions.MuteMembers);
      break;
    }
    case bitField.has(8388608n, false): {
      perms.push(lan.permissions.DeafenMembers);
      break;
    }
    case bitField.has(16777216n, false): {
      perms.push(lan.permissions.MoveMembers);
      break;
    }
    case bitField.has(33554432n, false): {
      perms.push(lan.permissions.UseVAD);
      break;
    }
    case bitField.has(67108864n, false): {
      perms.push(lan.permissions.ChangeNickname);
      break;
    }
    case bitField.has(134217728n, false): {
      perms.push(lan.permissions.ManageNicknames);
      break;
    }
    case bitField.has(268435456n, false): {
      if (isntRole) {
        perms.push(lan.permissions.ManagePermissions);
      } else {
        perms.push(lan.permissions.ManageRoles);
      }
      break;
    }
    case bitField.has(536870912n, false): {
      perms.push(lan.permissions.ManageWebhooks);
      break;
    }
    case bitField.has(1073741824n, false): {
      perms.push(lan.permissions.ManageEmojisAndStickers);
      break;
    }
    case bitField.has(2147483648n, false): {
      perms.push(lan.permissions.UseApplicationCommands);
      break;
    }
    case bitField.has(4294967296n, false): {
      perms.push(lan.permissions.RequestToSpeak);
      break;
    }
    case bitField.has(8589934592n, false): {
      perms.push(lan.permissions.ManageEvents);
      break;
    }
    case bitField.has(17179869184n, false): {
      perms.push(lan.permissions.ManageThreads);
      break;
    }
    case bitField.has(34359738368n, false): {
      perms.push(lan.permissions.CreatePublicThreads);
      break;
    }
    case bitField.has(68719476736n, false): {
      perms.push(lan.permissions.CreatePrivateThreads);
      break;
    }
    case bitField.has(137438953472n, false): {
      perms.push(lan.permissions.UseExternalStickers);
      break;
    }
    case bitField.has(274877906944n, false): {
      perms.push(lan.permissions.SendMessagesInThreads);
      break;
    }
    case bitField.has(549755813888n, false): {
      perms.push(lan.permissions.StartEmbeddedActivities);
      break;
    }
    case bitField.has(1099511627776n, false): {
      perms.push(lan.permissions.ModerateMembers);
      break;
    }
    default: {
      break;
    }
  }

  return perms;
};
