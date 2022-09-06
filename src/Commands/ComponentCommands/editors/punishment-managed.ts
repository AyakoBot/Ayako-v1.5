import type CT from '../../../typings/CustomTypings';

const editor: CT.ManagedEditor = {
  getOptions: (cmd) =>
    new Array(1).fill(null).map((_v, i) => ({
      type: 3,
      name: `punishment-${i}`,
      description: `Punishment Option No. ${i}`,
      required: i === 0,
      choices: Object.entries(cmd.language.punishments).map(([k, v]) => ({ name: v, value: k })),
    })),
};

export default editor;
