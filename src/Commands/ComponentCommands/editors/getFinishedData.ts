import type * as Eris from 'eris';
import type CT from '../../../typings/CustomTypings';

export default (oldRow: CT.BasicReturnType, field: string, c: Eris.ApplicationCommand) => {
  const f = oldRow[field as keyof typeof oldRow];

  if (
    Number(c.options?.length) > 1 &&
    !(
      (c.options?.[0] as Eris.InteractionDataOptionsSubCommandGroup)
        ?.options as Eris.InteractionDataOptionsString[]
    )?.length
  ) {
    if (!f) return [];
    return f;
  }

  if (!f) return null;
  return f;
};
