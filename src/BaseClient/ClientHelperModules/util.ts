import type * as Eris from 'eris';

export const makeCodeBlock = (text: string) => `\`\`\`${text}\`\`\``;
export const makeInlineCode = (text: string) => `\`${text}\``;
export const makeBold = (text: string) => `**${text}**`;
export const makeUnderlined = (text: string) => `__${text}__`;
export const checkVal = (obj: Eris.InteractionDataOptions | undefined) => {
  if (!obj) return null;
  if ('value' in obj) return obj.value;
  return null;
};
