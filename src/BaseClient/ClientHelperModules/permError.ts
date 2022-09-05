import * as Eris from 'eris';
import bitUniques from './bitUniques';
import reply from './reply';
import * as util from './util';

export default async (
  msg:
    | Eris.CommandInteraction
    | Eris.ComponentInteraction
    | Eris.Message<Eris.PrivateChannel>
    | Eris.Message<Eris.TextChannel>
    | Eris.Message<Eris.TextableChannel>
    | void,
  bits: bigint | number,
  language: typeof import('../../Languages/lan-en.json'),
  me?: boolean,
) => {
  const { default: client } = await import('../ErisClient');

  if (!msg) return;
  if (!msg.guildID) return;
  if (typeof bits === 'number') bits = BigInt(bits);

  const clientMember = client.guilds.get(msg.guildID)?.members.get(client.user.id);
  if (!clientMember) return;

  const neededPerms = new Eris.Permission(
    bitUniques(
      bits,
      me ? BigInt(clientMember.permissions.allow) : BigInt(msg.member?.permissions.allow || 0),
    )[0],
  );

  const embed: Eris.EmbedOptions = {
    author: {
      name: language.error,
      icon_url: client.constants.standard.error,
      url: client.constants.standard.invite,
    },
    color: client.constants.colors.warning,
    description: me ? language.permissions.error.msg : language.permissions.error.you,
    fields: [
      {
        name: util.makeBold(language.permissions.error.needed),
        value: `\u200b${
          neededPerms.has(8n)
            ? `${util.makeInlineCode(language.permissions.perms.administrator)}`
            : Object.entries(neededPerms.json)
                .filter(([, e]) => !!e)
                .map(
                  ([name]) =>
                    `${util.makeInlineCode(
                      language.permissions.perms[name as keyof typeof language.permissions.perms],
                    )}`,
                )
        }`,
        inline: false,
      },
    ],
  };

  if (msg instanceof Eris.CommandInteraction || msg instanceof Eris.ComponentInteraction) {
    reply(msg, { embeds: [embed], ephemeral: true }, language);
    return;
  }

  reply(msg, { embeds: [embed] }, language);
};
