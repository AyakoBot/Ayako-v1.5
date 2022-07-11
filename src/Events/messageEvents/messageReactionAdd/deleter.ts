import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message, reaction: Eris.Emoji, user: Eris.User) => {
  if (user.id === client.user.id) return;
  if (!msg.guild) return;
  if (msg.guild.id !== '298954459172700181') return;
  if (msg.channel.id !== '298954459172700181') return;
  if (reaction.name !== '❌' || reaction.id) return;
  if (msg.attachments.length === 0) return;
  if (msg.createdAt - Date.now() > 300000) return;

  const last100 = (await msg.channel.getMessages({ limit: 100 })) as unknown as Eris.Message[];
  const byThisUser = last100.filter((m) => m.author.id === user.id);
  if (byThisUser.length < 10) {
    msg.removeReaction('❌', user.id).catch(() => null);
    return;
  }

  const users: string[] = [];
  last100.forEach((m) => {
    if (users.includes(m.author.id)) return;
    if (last100.filter((ms) => ms.author.id === m.author.id).length < 10) return;

    users.push(m.author.id);
  });

  if (msg.reactions['❌'].count >= users.length / 2) {
    msg.delete().catch(() => null);
  }
};
