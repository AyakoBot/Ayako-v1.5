module.exports = {
  async execute(msg, embed) {
    let deleteTimeout = 0;
    switch (msg.source) {
      default: {
        break;
      }
      case 'antirivurs': {
        deleteTimeout = msg.r.delete;
        setTimeout(() => msg.m.edit({ embeds: [embed] }).catch(() => {}), deleteTimeout);
        break;
      }
    }
  },
};
