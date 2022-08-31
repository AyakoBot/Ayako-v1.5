import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

const command: CT.SlashCommand = {
  name: 'strike',
  dm: true,
  type: 'other',
  execute: async (cmd: CT.CommandInteraction, { language }: { language: CT.Language }) => {
    const userID = (
      cmd.data.options?.find((o) => o.name === 'target') as Eris.InteractionDataOptionsUser
    )?.value;
    const reason =
      (cmd.data.options?.find((o) => o.name === 'reason') as Eris.InteractionDataOptionsString)
        ?.value || language.noReasonProvided;

    const user = await client.ch.getUser(userID);
    if (!user) return;

    (await import('../../Events/modEvents/modStrikeHandler')).default(
      cmd.user,
      user,
      reason,
      cmd,
      this,
    );
  },
  aliases: [],
};

export default command;
