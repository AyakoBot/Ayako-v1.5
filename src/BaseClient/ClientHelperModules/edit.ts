import type Eris from 'eris';
import type CT from '../../typings/CustomTypings';
// eslint-disable-next-line import/no-self-import
import edit from './edit';

export default async (
  msg: Eris.CommandInteraction | Eris.ComponentInteraction | Eris.Message,
  payload: CT.MessagePayload,
  m?: Eris.Message,
): Promise<Eris.Message | null> => {
  if ('editOriginalMessage' in msg) {
    return (
      (await msg.editOriginalMessage(payload).catch(() => {
        if (!m) return null;
        return edit(m, payload);
      })) || null
    );
  }
  if (msg) {
    return (
      (await msg.edit(payload).catch(() => {
        if (!m) return null;
        return edit(m, payload);
      })) || null
    );
  }
  return null;
};
