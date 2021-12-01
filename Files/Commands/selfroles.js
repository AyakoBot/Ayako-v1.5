const Discord = require('discord.js');

module.exports = {
  name: 'selfroles',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['im', 'iam', 'iamn', 'iamnot', 'lsar', 'imn'],
  type: 'roles',
  async execute(msg, answer) {
    const res = await msg.client.ch.query(
      'SELECT * FROM selfroles WHERE guildid = $1 AND active = true ORDER BY id ASC;',
      [msg.guild.id],
    );
    const Objects = {
      cOptions: [],
      rOptions: [],
      cTake: [],
      rTake: [],
      cPage: 1,
      rPage: 1,
    };

    const getCategoryFields = (take, embed) => {
      take.forEach((took) => {
        const row = res.rows.find((r) => r.uniquetimestamp === took.value);
        const roles = row.roles
          .map((role) => (msg.guild.roles.cache.get(role) ? msg.guild.roles.cache.get(role) : null))
          .filter((role) => !!role);
        if (roles.length) {
          embed.addField(`${row.name}`, `${roles.length} ${msg.language.roles}`, true);
        }
      });
    };

    const getComponents = (row) => {
      const buttons = [];

      const categoryMenu = new Discord.MessageSelectMenu()
        .setCustomId('categoryMenu')
        .addOptions(Object.cTake)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder(msg.language.select.selfroles.select);

      const prevCategory = new Discord.MessageButton()
        .setCustomId('prevCategory')
        .setLabel(msg.lan.prevCategory)
        .setDisabled(Objects.cPage === 1)
        .setStyle('DANGER');

      const nextCategory = new Discord.MessageButton()
        .setCustomId('nextCategory')
        .setLabel(msg.lan.nextCategory)
        .setDisabled(Objects.cPage === Math.ceil(res.rowCount / 25))
        .setStyle('SUCCESS');

      buttons.push([categoryMenu], [prevCategory, nextCategory]);

      if (row) {
        const roleMenu = new Discord.MessageSelectMenu()
          .setCustomId('roleMenu')
          .addOptions(Object.rTake)
          .setMinValues(1)
          .setMaxValues(row.onlyone ? 1 : Object.rTake.length)
          .setPlaceholder(
            row.onlyone ? msg.language.select.role.select : msg.language.select.roles.select,
          )
          .setDisabled(row.isBlacklisted);

        const prevRoles = new Discord.MessageButton()
          .setCustomId('prevRoles')
          .setLabel(msg.lan.prevRoles)
          .setDisabled(Object.rPage === 1)
          .setStyle('DANGER');

        const nextRoles = new Discord.MessageButton()
          .setCustomId('nextRoles')
          .setLabel(msg.lan.nextRoles)
          .setDisabled(Objects.rPage === Math.ceil(Objects.rOptions / 25))
          .setStyle('SUCCESS');

        const back = new Discord.MessageButton()
          .setCustomId('back')
          .setLabel(msg.language.back)
          .setEmoji(msg.client.constants.emotes.back)
          .setStyle('DANGER');

        buttons.push([roleMenu], [prevRoles, nextRoles], [back]);
      }

      return msg.client.ch.buttonRower(buttons);
    };

    const roleGetter = (row) => {
      const roles = row.roles
        .map((r) => (msg.guild.roles.cache.get(r) ? msg.guild.roles.cache.get(r) : null))
        .filter((r) => !!r)
        .map((r) => {
          const obj = {
            has: !!msg.member.roles.cache.has(r.id),
            role: r,
            row,
          };
          return obj;
        });

      roles.sort((a, b) => a.role.rawPosition - b.role.rawPosition);

      return roles;
    };

    const categoryMenuHandler = (clickButton) => {};

    const embed = new Discord.MessageEmbed();
    embed
      .setColor(msg.client.ch.colorSelector(msg.guild.me))
      .setAuthor(msg.lan.author, null, msg.client.constants.standard.invite);

    if (res && res.rowCount > 0) {
      let disabled = false;
      let isBlacklisted = false;

      res.rows.forEach((thisrow) => {
        !disabled
          ? thisrow.blacklistedroles?.forEach((id) => {
              if (msg.member.roles.cache.get(id)) {
                (disabled = true), (isBlacklisted = true);
              }
            })
          : null;

        !disabled
          ? thisrow.blacklistedusers?.forEach((id) => {
              if (msg.author.id == id) {
                disabled = true;
                isBlacklisted = true;
              }
            })
          : null;

        !disabled
          ? thisrow.roles?.forEach((id) => {
              msg.member.roles.cache.find((r) => r.id == id) && thisrow.onlyone
                ? (disabled = true)
                : null;
            })
          : null;

        disabled
          ? thisrow.whitelistedroles?.forEach((id) => {
              if (msg.member.roles.cache.find((r) => r.id == id)) {
                disabled = false;
                isBlacklisted = false;
              }
            })
          : null;

        disabled
          ? thisrow.whitelistedusers?.forEach((id) => {
              if (msg.author.id == id) {
                disabled = false;
                isBlacklisted = false;
              }
            })
          : null;

        Objects.cOptions.push({
          label: `${msg.language.add} ${thisrow.name}`,
          value: thisrow.uniquetimestamp,
          emoji: disabled ? msg.client.constants.emotes.lock : null,
          description: disabled ? msg.lan.disabled : null,
        });

        thisrow.isBlacklisted = isBlacklisted;
      });

      for (let i = 0; i < res.rowCount && i < 25; i++) {
        const r = res.rows[i];
        Objects.cOptions.push({
          label: r.name,
          value: r.uniquetimestamp,
          description: r.disabled ? msg.lan.disabled : null,
          emoji: r.disabled ? msg.client.constants.emotes.lock : msg.client.constants.emotes.unlock,
        });
      }

      for (let i = 0; i < Objects.cTake.length && i < 25; i++) {
        Objects.cTake.push(Objects.cOptions[i]);
      }

      getCategoryFields(Objects.cTake, embed);
    }

    const rows = getComponents();
    embed.setDescription(`${msg.language.page}: \`1/${Math.ceil(Objects.cOptions.length / 25)}\``);

    if (answer) {
      await answer.update({ embeds: [embed], components: rows });
      msg.m = answer.message;
    } else if (msg.m) msg.m = await msg.m.edit({ embeds: [embed], components: rows });
    else msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });

    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    buttonsCollector.on('collect', async (clickButton) => {
      if (clickButton.user.id == msg.author.id) {
        switch (clickButton.customId) {
          case 'back': {
            buttonsCollector.stop();
            this.execute(msg, clickButton);
            return;
          }
          case 'roleMenu': {
            roleMenuHandler(clickButton);
            break;
          }
          case 'categoryMenu': {
            categoryMenuHandler(clickButton);
            break;
          }
          case 'prevCategory': {
            categoryButtonHandler(clickButton, false);
            break;
          }
          case 'nextCategory': {
            categoryButtonHandler(clickButton, true);
            break;
          }
          case 'prevRoles': {
            roleButtonHandler(clickButton, false);
            break;
          }
          case 'nextRoles': {
            roleButtonHandler(clickButton, true);
            break;
          }
        }
      } else msg.client.ch.notYours(clickButton, msg);
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason == 'time') {
        msg.m.edit({ embeds: [embed], components: [] });
      }
    });
  },
};
