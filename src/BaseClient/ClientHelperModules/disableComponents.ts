import type * as Eris from 'eris';
import buttonRower from './buttonRower';

export default (msg: Eris.Message, embeds: Eris.Embed[]) => {
  const rows = msg.components?.map((c1) =>
    c1.components.map((c2) => {
      if ('style' in c2 && c2.style === 5) return c2;
      c2.disabled = true;
      return c2;
    }),
  );

  if (!rows) return null;

  return msg.edit({
    embeds: embeds || msg.embeds,
    components: buttonRower(rows),
  });
};
