import type Eris from 'eris';

export default async (
  msg: Eris.Message,
  answer: Eris.ComponentInteraction,
  options: { [key: string]: string },
  embed: Eris.Embed,
  page: number,
) =>
  (await import(`${process.cwd()}/dist/Commands/TextCommands/embedbuilder`)).builder(
    msg,
    answer,
    embed,
    page,
    options,
  );
