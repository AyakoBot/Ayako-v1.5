import type CT from '../../../typings/CustomTypings';

const editor: CT.Editor = {
  run: (_cmd, earlierRow, field) => {
    const newRow: CT.BasicReturnType = {};

    Object.entries(earlierRow).forEach(([k, v]) => {
      newRow[k] = v;
    });

    newRow[field] = !newRow[field];

    return newRow;
  },
};

export default editor;
