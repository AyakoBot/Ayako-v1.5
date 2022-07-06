import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

export default async (
  msg: CT.Message,
  reaction: { animated?: boolean; id?: string; name: string },
) => {
  const channels = (
    await client.ch
      .query('SELECT messageevents FROM logchannels WHERE guildid = $1;', [msg.guildID])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].messageevents : null))
  )?.map((id: string) => msg.guild?.channels.get(id));

  if (!channels) return;

  const lan = msg.language.events.messageReactionRemoveEmoji;
  const con = client.constants.events.messageReactionRemoveEmoji;

  const getEmbed = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: lan.title,
        icon_url: con.image,
        url: msg.jumpLink,
      },
      description: client.ch.stp(lan.description, {
        msg,
        reaction,
        id: reaction.id || msg.language.none,
      }),
      color: con.color,
      fields: [],
    };

    return embed;
  };

  const embed = getEmbed();

  const getBuffers = async () => {
    const emoji = await client.ch.fileURL2Buffer([
      `https://cdn.discordapp.com/emojis/${reaction.id}.${
        reaction.animated ? 'gif' : 'png'
      }?size=240`,
    ]);
    return emoji;
  };

  const payload: { embeds: Eris.Embed[]; files?: Eris.FileContent[] } = {
    embeds: [embed],
    files: [],
  };

  if (reaction.id) {
    const buffers = await getBuffers();
    if (buffers[0]) {
      payload.files = buffers.filter((b): b is { name: string; file: Buffer } => !!b);

      embed.thumbnail = {
        url: `attachment://${buffers[0].name}`,
      };
    }
  }

  await client.ch.send(channels, payload, msg.language, null, 10000);
};
