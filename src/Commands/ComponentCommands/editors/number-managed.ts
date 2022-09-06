import type CT from '../../../typings/CustomTypings';

const editor: CT.ManagedEditor = {
  getOptions: () =>
    new Array(1).fill(null).map((_v, i) => ({
      type: 10,
      name: `number-${i}`,
      description: `Number Option No. ${i}`,
      required: i === 0,
    })),
};

export default editor;
