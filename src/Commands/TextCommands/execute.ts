/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
// @ts-ignore
import client from '../../BaseClient/ErisClient';

const cmd: CT.Command = {
  name: 'execute',
  aliases: ['e'],
  perm: 0,
  dm: true,
  takesFirstArg: false,
  type: 'owner',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  execute: async (_msg: Eris.Message) => {
    if (!_msg.guildID) return;
    const guild = client.guilds.get(_msg.guildID);
    if (!guild) return;
  },
};

export default cmd;

/*

    client.createCommand({
      name: 'ping',
      description: "Calculates Ayako's Latency",
      defaultPermission: true,
      type: 1,
    });
    */
