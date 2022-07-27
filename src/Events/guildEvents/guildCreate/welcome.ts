import type Eris from 'eris';
import Discord from 'discord.js';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild) => {
  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: 'Recommended Commands you should check out first',
      icon_url: client.constants.events.guildCreate.image,
    },
    fields: [
      {
        name: client.ch.stp('`{{prefix}}help`', { prefix: client.constants.standard.prefix }),
        value: 'All Commands to get started on setting up my behavior',
      },
      {
        name: client.ch.stp('`{{prefix}}settings`', { prefix: client.constants.standard.prefix }),
        value: 'All Settings related Commands',
      },
      {
        name: client.ch.stp('`{{prefix}}contact` `{{prefix}}invite` `{{prefix}}support`', {
          prefix: client.constants.standard.prefix,
        }),
        value:
          "If you are stuck, something isn't working or you have Data Deletion Requests, use these Commands to contact Support",
      },
    ],
    title: client.ch.stp('Default Prefix: `{{prefix}}`', {
      prefix: client.constants.standard.prefix,
    }),
  });

  const getChannel = () =>
    guild.channels
      .filter(
        (c) =>
          new Discord.PermissionsBitField(c.permissionsOf(client.user.id).allow).has(16384n) &&
          c.type === 0,
      )
      .sort((a, b) => a.position - b.position)[0];

  const embed = getEmbed();
  const audit = await client.ch.getAudit(guild, 28, client.user);
  const content = audit ? `Thanks <@${audit.user.id}>, for adding me to your Server!` : undefined;
  const channel = getChannel();
  const language = await client.ch.languageSelector(null);

  if (audit) {
    const m = await client.ch.send(
      await audit.user.getDMChannel(),
      { embeds: [embed], content },
      language,
    );
    if (!m) client.ch.send(channel, { embeds: [embed], content }, language);
  } else {
    client.ch.send(channel, { embeds: [embed], content }, language);
  }
};
