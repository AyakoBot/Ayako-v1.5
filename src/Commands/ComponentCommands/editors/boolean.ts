import type CT from '../../../typings/CustomTypings';

const editor: CT.Editor = {
  handles: ['boolean'],
  run: (cmd, earlierRow) => {
    const newRow: CT.BasicReturnType = {};
    const [, , , , , field] = cmd.data.custom_id.split(/_/g);

    Object.entries(earlierRow).forEach(([k, v]) => {
      newRow[k] = v;
    });

    newRow[field] = !newRow[field];

    return newRow;
  },
};

export default editor;
