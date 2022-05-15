const Builders = require('@discordjs/builders');

module.exports = {
  name: 'reload',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['r'],
  type: 'owner',
  execute: async (msg) => {
    const paths = Object.keys(require.cache).filter((k) =>
      k
        .toLowerCase()
        .replace(/\.json|\.js|\.log|\.txt/gim, '')
        .endsWith(
          msg.args
            .slice(0)
            .join('/')
            .toLowerCase()
            .replace(/\.json|\.js|\.log|\.txt/gim, ''),
        ),
    );

    if (!paths.length) {
      msg.client.ch.error(msg, { content: 'No Files found!' });
      return;
    }

    if (paths.length === 1) {
      end(msg, paths[0]);
      return;
    }

    if (paths.length > 25) {
      msg.client.ch.error(msg, 'Too many Files found! Please be more specific.');
      return;
    }

    let content = '';
    for (let i = 0; i < paths.length; i += 1) {
      content += `${i + 1}. \`${paths[i].replace(require.main.path, '')}\`\n`;
    }

    const embed = new Builders.UnsafeEmbedBuilder()
      .setColor(msg.client.constants.standard.color)
      .setTitle('Reply with the Number of the File you want to reload')
      .setDescription(content);

    const options = paths.map((path, i) =>
      new Builders.UnsafeSelectMenuOptionBuilder()
        .setLabel(String(i + 1))
        .setValue(path.slice(-100, path.length))
        .setDescription(path.slice(-100, path.length)),
    );

    const select = new Builders.UnsafeSelectMenuBuilder()
      .setPlaceholder('Select the Number')
      .setCustomId('reload')
      .setMaxValues(options.length)
      .setMinValues(1)
      .setOptions(...options);

    const m = await msg.client.ch.reply(msg, {
      embeds: [embed],
      components: msg.client.ch.buttonRower([select]),
    });

    const interactionCollector = m.createMessageComponentCollector({ time: 360000 });
    interactionCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction);
        return;
      }

      if (interaction.customId === 'reload') {
        interaction.values.forEach((v) => {
          end(msg, v);
        });

        msg.client.ch.edit(interaction, { components: msg.client.ch.buttonRower([select]) });
      }
    });

    interactionCollector.on('end', (c, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg, m);
      }
    });
  },
};

const end = (msg, path) => {
  delete require.cache[require.resolve(path)];
  require(path);

  msg.client.ch.reply(
    msg,
    { content: `\`${path.replace(require.main.path, '')}\` reloaded!` },
    2000,
  );
};
