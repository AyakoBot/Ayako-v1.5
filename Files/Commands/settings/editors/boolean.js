/* eslint-disable no-param-reassign */
module.exports = {
  key: ['boolean'],
  requiresInteraction: false,
  execute(msg, required, values) {
    if (!msg.rows[required.assigner]) values[required.assigner] = true;
    else values[msg.assigner] = false;
  },
};
