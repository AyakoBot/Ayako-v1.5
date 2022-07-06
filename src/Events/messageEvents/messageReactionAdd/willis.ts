import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

const giveawayTitle = 'Mega Giveaway!';
const hostIcon =
  'https://cdn.discordapp.com/attachments/764376037751521290/987061511769964634/unknown.png';
const giveawayLink = 'https://clik.cc/A3KLb/';

export default async (msg: CT.Message, reaction: Eris.Emoji, user: Eris.User) => {
  if (user.id === client.user.id) return;
  if (!msg.guild) return;
  const member = msg.guild.members.get(user.id);
  if (!member) return;
  if (msg.channel.id !== '979811225212956722') return;

  if (
    !member.roles.includes('278332463141355520') &&
    !member.roles.includes('293928278845030410') &&
    !member.roles.includes('768540224615612437')
  ) {
    return;
  }

  const logchannel = msg.guild.channels.get('805860525300776980');
  if (!logchannel) return;

  const statsRow = await client.ch
    .query('SELECT * FROM stats;')
    .then((r: DBT.stats[] | null) => (r ? r[0] : null));
  if (!statsRow) return;

  switch (reaction.name) {
    case '✅': {
      const tick = async () => {
        msg.delete().catch(() => null);
        const embed: Eris.Embed = {
          type: 'rich',
          color: client.constants.standard.color,
          thumbnail: { url: user.avatarURL },
          description: `<@${user.id}> accepted the submission of <@${msg.author.id}>`,
          author: { name: msg.author.username, icon_url: msg.author.avatarURL },
        };

        await client.ch.send(logchannel, { embeds: [embed] }, msg.language);

        if (statsRow.willis?.includes(msg.author.id)) {
          const DM: Eris.Embed = {
            type: 'rich',
            author: {
              name: giveawayTitle,
              icon_url: hostIcon,
              url: client.constants.standard.invite,
            },
            description: '**You already entered the Giveaway!**',
            color: 16776960,
            fields: [
              {
                name: '\u200b',
                value: `[Click here to get to the Giveaway](${giveawayLink})`,
                inline: false,
              },
            ],
          };

          await client.ch.send(await msg.author.getDMChannel(), { embeds: [DM] }, msg.language);
          return;
        }

        const arr: string[] = [];
        if (statsRow.willis?.length) {
          arr.push(...statsRow.willis, msg.author.id);
        }

        const DM: Eris.Embed = {
          type: 'rich',
          author: {
            name: giveawayTitle,
            icon_url: hostIcon,
            url: client.constants.standard.invite,
          },
          description: '**Your submission was accepted!**\nGood Luck!',
          color: client.constants.standard.color,
        };

        await client.ch.send(await msg.author.getDMChannel(), { embeds: [DM] }, msg.language);

        client.ch.query('UPDATE stats SET willis = $1, count = $2;', [arr, arr.length]);
      };

      tick();
      break;
    }
    case '❌': {
      const cross = async () => {
        msg.delete().catch(() => null);
        const embed: Eris.Embed = {
          type: 'rich',
          color: 16711680,
          thumbnail: { url: user.avatarURL },
          description: `<@${user.id}> rejected the submission of <@${msg.author.id}>`,
          author: { name: msg.author.username, icon_url: msg.author.avatarURL },
        };

        await client.ch.send(logchannel, { embeds: [embed] }, msg.language);

        const DM: Eris.Embed = {
          type: 'rich',
          author: {
            name: giveawayTitle,
            icon_url: hostIcon,
            url: client.constants.standard.invite,
          },
          description: '**Your submission was rejected!**',
          color: 16711680,
          fields: [
            {
              name: 'Please check back on the requirements',
              value: '\u200b',
            },
          ],
        };

        await client.ch.send(await msg.author.getDMChannel(), { embeds: [DM] }, msg.language);
      };

      cross();
      break;
    }
    default: {
      break;
    }
  }
};
