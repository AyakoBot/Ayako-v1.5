import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild) => {
  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: 'Guild Left',
      icon_url: client.constants.events.guildDelete.image,
      url: `https://discord.com/channels/${guild.id}`,
    },
    description: '<@&669894051851403294> left a Guild',
    fields: [
      { name: 'Guild Name', value: `\u200b${guild.name}`, inline: false },
      { name: 'Guild ID', value: guild.id, inline: true },
      { name: 'Member Count', value: String(guild.memberCount), inline: true },
      { name: 'Guild Owner', value: guild.ownerID, inline: true },
    ],
    footer: {
      text: `Ayako is now in ${client.guilds.size} Guilds`,
    },
    color: client.constants.colors.warning,
  };

  const channel = client.guilds.get('669893888856817665')?.channels.get('718181439354437693');
  if (!channel) return;

  const language = await client.ch.languageSelector(null);

  client.ch.send(channel as Eris.AnyGuildChannel, { embeds: [embed] }, language, null, 5000);
};
