import fs from 'fs';
import type CT from '../../../typings/CustomTypings';

export default async (type: string) => {
  const isDisallowed = (file: string) =>
    ['.d.ts', '.d.ts.map', '.js.map'].some((end) => file.endsWith(end));

  const dir = `${process.cwd()}/dist/Commands/ComponentCommands/editors`;
  const files = fs.readdirSync(dir).filter((f) => !isDisallowed(dir) && f.endsWith('.js'));
  const possibleFiles = await Promise.all(files.map((f) => import(`${dir}/${f}`)));

  const file: CT.ManagedEditor | undefined | null = files
    .map((f, i) => {
      const { default: possibleFile }: { default: CT.ManagedEditor } = possibleFiles[i];

      if (f.replace('.js', '').replace('-managed', '') === type) return possibleFile;
      return null;
    })
    .filter((f) => !!f)
    .shift();

  return file;
};
