import type Eris from 'eris';
import colorSelector from './colorSelector';

export default async (
  guild: Eris.Guild,
  {
    lan,
    language,
  }: {
    language: typeof import('../../Languages/en.json');
    lan: { author: string; loading?: string };
  },
) => {
  const { default: client } = await import('../ErisClient');

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.author,
      icon_url: client.objectEmotes.loading.link,
      url: client.constants.standard.invite,
    },
    color: colorSelector(guild.members.get(client.user.id)),
    description: `${client.stringEmotes.loading} ${lan.loading ? lan.loading : language.loading}`,
  };
  return embed;
};
