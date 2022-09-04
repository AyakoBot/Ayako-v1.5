import type CT from '../../../typings/CustomTypings';

const editor: CT.ManagedEditor = {
  getOptions: () =>
    new Array(25).fill(null).map((_v, i) => ({
      type: 7,
      name: `channel-${i}`,
      description: `Channel Option No. ${i}`,
      required: i === 0,
      channel_types: [0, 2, 5, 10, 11, 12, 15],
    })),
};

export default editor;
