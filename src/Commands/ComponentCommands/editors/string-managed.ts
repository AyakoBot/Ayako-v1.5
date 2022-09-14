import type CT from '../../../typings/CustomTypings';

const editor: CT.ManagedEditor = {
  getOptions: () =>
    new Array(1).fill(null).map((_v, i) => ({
      type: 3,
      name: `string-${i}`,
      description: `String Option No. ${i}`,
      required: i === 0,
    })),
};

export default editor;
