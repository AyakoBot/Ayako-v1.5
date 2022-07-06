import type Eris from 'eris';

export default async (id: string) => {
  const { default: client } = await import('../ErisClient');

  let emote: Eris.Emoji | undefined;

  client.guilds.forEach((guild) => {
    if (emote) return;
    emote = guild.emojis.find((em) => em.id === id);
  });

  return emote;
};
