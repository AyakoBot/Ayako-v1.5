module.exports = {
  key: ['boolean'],
  requiresInteraction: false,
  requiresMenu: false,
  execute(msg, required, values, row) {
    if (!row[required.assinger]) values[required.assinger] = true;
    else values[required.assinger] = false;
  },
};
