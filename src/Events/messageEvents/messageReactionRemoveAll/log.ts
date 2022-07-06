import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

export default async (msg: CT.Message) => {
  const channels = (
    await client.ch
      .query('SELECT messageevents FROM logchannels WHERE guildid = $1;', [msg.guildID])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].messageevents : null))
  )?.map((id: string) => msg.guild?.channels.get(id));

  if (!channels) return;

  const lan = msg.language.events.messageReactionRemoveAll;
  const con = client.constants.events.messageReactionRemoveAll;

  const getEmbed = () => {
    const embed: Eris.Embed = {
      type: 'rich',
      author: {
        name: lan.title,
        icon_url: con.image,
        url: msg.jumpLink,
      },
      description: client.ch.stp(lan.description, { msg }),
      color: con.color,
      fields: [],
    };

    return embed;
  };

  const embed = getEmbed();

  client.ch.send(channels, { embeds: [embed] }, msg.language, null, 10000);
};
