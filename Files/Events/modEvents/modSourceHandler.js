module.exports = {
  async execute(msg, embed) {
    let minimizeTimeout = 0;
    let deleteTimeout = 0;

    switch (msg.source) {
      default: {
        break;
      }
      case 'antirivurs': {
        minimizeTimeout = msg.r.minimize;
        deleteTimeout = msg.r.delete;

        if (deleteTimeout <= minimizeTimeout + 2000) {
          setTimeout(() => msg.m.delete().catch(() => {}), deleteTimeout);
        } else {
          setTimeout(() => msg.m.edit({ embeds: [embed] }).catch(() => {}), minimizeTimeout);
          setTimeout(() => msg.m.delete().catch(() => {}), deleteTimeout);
        }

        break;
      }
    }
  },
};
