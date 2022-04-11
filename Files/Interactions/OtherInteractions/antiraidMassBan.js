const Discord = require('discord.js');

module.exports = {
  name: 'antiraid_massban',
  split: null,
  execute: async (cmd, language) => {
    cmd.deferReply();
    const command = cmd.client.commands.get('massban');

    cmd.language = language;

    if (!(await cmd.member.fetch()).permissions.has(command.perm)) {
      cmd.client.ch.permError(cmd, new Discord.PermissionsBitField(command.perm), false);
      return;
    }

    const rawContent = await cmd.client.ch.convertTxtFileLinkToString(
      (await cmd.message.fetch()).attachments.first().url,
    );

    const args = rawContent.replace(/\\n/g, ' ').split(/ +/);

    const msg = {
      client: cmd.client,
      args,
      guild: cmd.guild,
      language,
      lan: language.commands.massban,
      author: cmd.user,
      member: cmd.member,
    };

    msg.logchannels = [];
    const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [
      msg.guild.id,
    ]);
    if (res && res.rowCount > 0) {
      msg.logchannels = res.rows[0].modlogs
        ?.map((id) =>
          typeof msg.client.channels.cache.get(id)?.send === 'function'
            ? msg.client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
    }

    command.execute(msg, cmd);
  },
};
