import * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type CT from '../../typings/CustomTypings';

export default async (
  interaction:
    | CT.CommandInteraction
    | CT.AutocompleteInteraction
    | CT.AutocompleteInteraction
    | Eris.PingInteraction
    | Eris.UnknownInteraction,
) => {
  switch (interaction.type) {
    case 2: {
      if (!(interaction instanceof Eris.CommandInteraction)) return;

      const success = await convert(interaction as unknown as CT.CommandInteraction);
      if (!success) return;

      (await import('./commandHandler')).default(interaction as unknown as CT.CommandInteraction);
      break;
    }
    case 3: {
      if (!(interaction instanceof Eris.ComponentInteraction)) return;

      const success = await convert(interaction as unknown as CT.ComponentInteraction);
      if (!success) return;

      (await import('./componentHandler')).default(
        interaction as unknown as CT.ComponentInteraction,
      );
      break;
    }
    case 4: {
      if (!(interaction instanceof Eris.AutocompleteInteraction)) return;

      const success = await convert(interaction as unknown as CT.AutocompleteInteraction);
      if (!success) return;

      (await import('./autocompleteHandler')).default(
        interaction as unknown as CT.AutocompleteInteraction,
      );
      break;
    }
    default: {
      break;
    }
  }
};

const convert = async (
  interaction: CT.CommandInteraction | CT.AutocompleteInteraction | CT.ComponentInteraction,
) => {
  const check =
    interaction instanceof Eris.CommandInteraction ||
    interaction instanceof Eris.ComponentInteraction ||
    interaction instanceof Eris.AutocompleteInteraction;

  const guild = interaction.guildID ? client.guilds.get(interaction.guildID) : null;
  if (!guild) return false;
  interaction.guild = guild;

  const language = await client.ch.languageSelector(check ? interaction.guildID : null);
  interaction.language = language;

  if (interaction.user) return true;
  if (interaction.member?.user) interaction.user = interaction.member.user;
  if (interaction.user && interaction.guild) {
    const member = await client.ch.getMember(interaction.user.id, interaction.guild.id);
    if (!member) return false;
    interaction.member = member;
  }
  return true;
};
