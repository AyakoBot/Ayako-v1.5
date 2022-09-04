import type CT from '../../../typings/CustomTypings';

const editor: CT.ManagedEditor = {
  getOptions: () =>
    new Array(25).fill(null).map((_v, i) => ({
      type: 8,
      name: `role-${i}`,
      description: `Role Option No. ${i}`,
      required: i === 0,
    })),
};

export default editor;
