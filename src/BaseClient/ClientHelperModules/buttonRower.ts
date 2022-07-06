import type Eris from 'eris';

export default (
  buttonArrays: (Eris.Button | Eris.SelectMenu)[] | (Eris.Button | Eris.SelectMenu)[][],
): Eris.ActionRow[] =>
  buttonArrays.map((buttonRow) => {
    const actionRow: Eris.ActionRow = {
      components: [],
      type: 1,
    };

    if (Array.isArray(buttonRow)) {
      buttonRow.forEach((button) => {
        actionRow.components.push(button);
      });
    } else actionRow.components.push(buttonRow);

    return actionRow;
  });
