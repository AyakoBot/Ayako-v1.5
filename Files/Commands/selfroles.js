/* eslint-disable no-param-reassign */
const Discord = require('discord.js');

module.exports = {
  name: 'selfroles',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['im', 'iam', 'iamn', 'iamnot', 'lsar', 'imn', 'lsr'],
  type: 'roles',
  async execute(msg, answer) {
    const res = await msg.client.ch.query(
      'SELECT * FROM selfroles WHERE guildid = $1 AND active = true ORDER BY id ASC;',
      [msg.guild.id],
    );
    const Data = {
      currentRow: null,
      cOptions: [],
      rOptions: [],
      cTake: [],
      rTake: [],
      cPage: 1,
      rPage: 1,
    };

    const getCategoryFields = (embed) => {
      Data.cTake.forEach((took) => {
        const row = res.rows.find((r) => r.uniquetimestamp === took.value);
        const roles = row.roles
          .map((role) => (msg.guild.roles.cache.get(role) ? msg.guild.roles.cache.get(role) : null))
          .filter((role) => !!role);
        if (roles.length) {
          embed.addField(`${row.name}`, `${roles.length} ${msg.language.roles}`, true);
        }
      });
    };

    const getComponents = () => {
      const buttons = [];

      const categoryMenu = new Discord.MessageSelectMenu()
        .setCustomId('categoryMenu')
        .addOptions(Data.cTake)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder(msg.language.select.selfroles.select);

      const prevCategory = new Discord.MessageButton()
        .setCustomId('prevCategory')
        .setLabel(msg.lan.prevCategory)
        .setDisabled(Data.cPage === 1)
        .setStyle('DANGER');

      const nextCategory = new Discord.MessageButton()
        .setCustomId('nextCategory')
        .setLabel(msg.lan.nextCategory)
        .setDisabled(Data.cPage === Math.ceil(res.rowCount / 25))
        .setStyle('SUCCESS');

      buttons.push([categoryMenu], [prevCategory, nextCategory]);

      if (Data.currentRow) {
        const roleMenu = new Discord.MessageSelectMenu()
          .setCustomId('roleMenu')
          .addOptions(Data.rTake)
          .setMinValues(1)
          .setMaxValues(Data.currentRow.onlyone ? 1 : Data.rTake.length)
          .setPlaceholder(
            Data.currentRow.onlyone
              ? msg.language.select.role.select
              : msg.language.select.roles.select,
          )
          .setDisabled(Data.currentRow.isBlacklisted);

        const prevRoles = new Discord.MessageButton()
          .setCustomId('prevRoles')
          .setLabel(msg.lan.prevRoles)
          .setDisabled(Data.rPage === 1)
          .setStyle('DANGER');

        const nextRoles = new Discord.MessageButton()
          .setCustomId('nextRoles')
          .setLabel(msg.lan.nextRoles)
          .setDisabled(Data.rPage === Math.ceil(Data.rOptions.length / 25))
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

    const roleGetter = (clickButton, doesntNeedNewRow) => {
      if (!doesntNeedNewRow) {
        Data.currentRow = res.rows.find((r) => r.uniquetimestamp === clickButton.values[0]);
        if (!Data.currentRow) {
          Data.currentRow = res.rows.find((r) => r.roles.includes(clickButton.values[0]));
        }
      }

      Data.rOptions = [];
      for (let i = 0; i < Data.currentRow.roles.length; i += 1) {
        const r = msg.guild.roles.cache.get(Data.currentRow.roles[i]);
        if (r) {
          let disabled;
          if (msg.member.roles.cache.has(r.id)) disabled = msg.client.constants.emotes.minusBGID;
          else disabled = msg.client.constants.emotes.plusBGID;
          Data.rOptions.push({
            label: `${r.name}`,
            value: r.id,
            emoji: disabled,
          });
        }
      }

      Data.rTake = [];
      const neededIndex = Data.rPage * 25 - 25;
      for (let j = neededIndex + 1; j < neededIndex + 26 && j < Data.rOptions.length; j += 1) {
        if (msg.member.roles.cache.has(Data.rOptions[j].value) && Data.currentRow.onlyone) {
          Data.rTake.push(Data.rOptions[j]);
        } else if (
          !msg.member.roles.cache.some((r) => Data.currentRow.roles.includes(r.id)) ||
          !Data.currentRow.onlyone
        ) {
          Data.rTake.push(Data.rOptions[j]);
        }
      }
    };

    const getRoleUpdateReplyEmbed = async (add, remove) => {
      const embed = new Discord.MessageEmbed()
        .setAuthor(msg.lan.rolesUpdated, null, msg.client.constants.standard.invite)
        .setColor(msg.client.ch.colorSelector(msg.guild.me));

      if (add.length) {
        embed.addField(msg.lan.addedRoles, add.map((r) => `<@&${r}>`).join(', '), false);
      }
      if (remove.length) {
        embed.addField(msg.lan.removedRoles, remove.map((r) => `<@&${r}>`).join(', '), false);
      }

      if (add.length) await msg.member.roles.add(add, msg.language.autotypes.selfroles);
      if (remove.length) await msg.member.roles.remove(remove, msg.language.autotypes.selfroles);

      return embed;
    };

    const getRoleUpdateEmbed = () => {
      return new Discord.MessageEmbed()
        .setColor(msg.client.ch.colorSelector(msg.guild.me))
        .setAuthor(Data.currentRow.name, null, msg.client.constants.standard.invite)
        .setDescription(
          `${Data.rOptions.map((r) => `<@&${r.value}>`).join(', ')}\n\n${msg.lan.categoryPage}: \`${
            Data.cPage
          }/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`${
            Data.rPage
          }/${Math.ceil(Data.rOptions.length / 25)}\``,
        );
    };

    const getCategoryUpdateEmbed = () => {
      return new Discord.MessageEmbed()
        .setColor(msg.client.ch.colorSelector(msg.guild.me))
        .setAuthor(Data.currentRow.name, null, msg.client.constants.standard.invite)
        .setDescription(
          `${Data.rOptions.map((r) => `<@&${r.value}>`).join(', ')}\n\n${msg.lan.categoryPage}: \`${
            Data.cPage
          }/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`1/${Math.ceil(
            (Data.rOptions.length + 1) / 25,
          )}\``,
        );
    };

    const categoryMenuHandler = (clickButton) => {
      roleGetter(clickButton);
      Data.cTake.forEach((c, i) => {
        if (c.value === clickButton.values[0]) {
          Data.cTake[i].default = true;
        } else {
          Data.cTake[i].default = false;
        }
      });
      const embed = getCategoryUpdateEmbed();
      const currentRows = getComponents();
      return { embeds: [embed], components: currentRows };
    };

    const roleMenuHandler = async (clickButton) => {
      const add = [];
      const remove = [];
      clickButton.values.forEach((id) => {
        if (msg.member.roles.cache.has(id)) remove.push(id);
        else add.push(id);
      });

      const replyEmbed = await getRoleUpdateReplyEmbed(add, remove);
      roleGetter(clickButton);
      const embed = getRoleUpdateEmbed();
      const currentRows = getComponents();

      clickButton.reply({ embeds: [replyEmbed], ephemeral: true });
      msg.m.edit({ embeds: [embed], components: currentRows });

      return null;
    };

    const getCategoryButtonEmbed = () => {
      if (Data.currentRow) {
        return new Discord.MessageEmbed()
          .setColor(msg.client.ch.colorSelector(msg.guild.me))
          .setAuthor(Data.currentRow.name, null, msg.client.constants.standard.invite)
          .setDescription(
            `${Data.rOptions.map((r) => `<@&${r.value}>`).join(', ')}\n\n${
              msg.lan.categoryPage
            }: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`${
              Data.rPage
            }/${Math.ceil((Data.rOptions.length + 1) / 25)}\``,
          );
      }
      const embed = new Discord.MessageEmbed()
        .setColor(msg.client.ch.colorSelector(msg.guild.me))
        .setAuthor(msg.language.autotypes.selfroles, null, msg.client.constants.standard.invite)
        .setDescription(
          `${msg.language.page}: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\``,
        );
      getCategoryFields(embed);
      return embed;
    };

    const getRoleButtonEmbed = () => {
      return new Discord.MessageEmbed()
        .setColor(msg.client.ch.colorSelector(msg.guild.me))
        .setAuthor(Data.currentRow.name, null, msg.client.constants.standard.invite)
        .setDescription(
          `${Data.rOptions.map((r) => `<@&${r.value}>`).join(', ')}\n\n${msg.lan.categoryPage}: \`${
            Data.cPage
          }/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`${
            Data.rPage
          }/${Math.ceil((Data.rOptions.length + 1) / 25)}\``,
        );
    };

    const categoryButtonHandler = (clickButton, increasePage) => {
      if (increasePage) Data.cPage += 1;
      else Data.cPage -= 1;

      Data.cTake = [];
      if (increasePage) {
        const indexLast = Data.cOptions.findIndex(
          (r) =>
            r.value ===
            clickButton.message.components[0].components[0].options[
              clickButton.message.components[0].components[0].options.length - 1
            ].value,
        );
        for (let j = indexLast + 1; j < indexLast + 26 && j < Data.cOptions.length; j += 1) {
          Data.cTake.push(Data.cOptions[j]);
        }
      } else {
        const indexFirst = Data.cOptions.findIndex(
          (r) => r.value === clickButton.message.components[0].components[0].options[0].value,
        );
        for (let j = indexFirst - 25; j < indexFirst && j < Data.cOptions.length; j += 1) {
          Data.cTake.push(Data.cOptions[j]);
        }
      }

      const currentRows = getComponents();
      const embed = getCategoryButtonEmbed();

      return { embeds: [embed], components: currentRows };
    };

    const roleButtonHandler = (clickButton, increasePage) => {
      if (increasePage) Data.rPage += 1;
      else Data.rPage -= 1;

      roleGetter(clickButton, true);

      const currentRows = getComponents();
      const embed = getRoleButtonEmbed();

      return { embeds: [embed], components: currentRows };
    };

    const embed = new Discord.MessageEmbed();
    embed
      .setColor(msg.client.ch.colorSelector(msg.guild.me))
      .setAuthor(msg.lan.author, null, msg.client.constants.standard.invite);

    if (res && res.rowCount > 0) {
      let disabled = false;
      let isBlacklisted = false;

      res.rows.forEach((thisrow, i) => {
        if (!disabled || !isBlacklisted) {
          thisrow.blacklistedroles?.forEach((id) => {
            if (msg.member.roles.cache.get(id)) {
              disabled = true;
              isBlacklisted = true;
            }
          });
        }

        if (!disabled || !isBlacklisted) {
          thisrow.disabled?.forEach((id) => {
            if (msg.member.roles.cache.get(id)) {
              disabled = true;
              isBlacklisted = true;
            }
          });
        }

        if (!disabled) {
          thisrow.roles?.forEach((id) => {
            if (thisrow.onlyone && msg.member.roles.cache.find((r) => r.id === id)) {
              disabled = true;
            }
          });
        }

        if (disabled || isBlacklisted) {
          thisrow.whitelistedroles?.forEach((id) => {
            if (msg.member.roles.cache.find((r) => r.id === id)) {
              disabled = false;
              isBlacklisted = false;
            }
          });
        }

        if (disabled || isBlacklisted) {
          thisrow.whitelistedusers?.forEach((id) => {
            if (msg.author.id === id) {
              disabled = false;
              isBlacklisted = false;
            }
          });
        }

        res.rows[i].isBlacklisted = isBlacklisted;
        res.rows[i].disabled = disabled;
      });

      for (let i = 0; i < res.rowCount; i += 1) {
        const r = res.rows[i];
        Data.cOptions.push({
          label: r.name,
          value: r.uniquetimestamp,
          description: r.disabled ? msg.lan.disabled : null,
          emoji: r.disabled ? msg.client.constants.emotes.lock : msg.client.constants.emotes.unlock,
        });
      }

      for (let i = 0; i < Data.cOptions.length && i < 25; i += 1) {
        Data.cTake.push(Data.cOptions[i]);
      }

      getCategoryFields(embed);
    }

    const rows = getComponents();
    embed.setDescription(`${msg.language.page}: \`1/${Math.ceil(Data.cOptions.length / 25)}\``);

    if (answer) {
      await answer.update({ embeds: [embed], components: rows });
      msg.m = answer.message;
    } else if (msg.m) msg.m = await msg.m.edit({ embeds: [embed], components: rows });
    else msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });

    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    buttonsCollector.on('collect', async (clickButton) => {
      if (clickButton.user.id === msg.author.id) {
        let responseBody;
        switch (clickButton.customId) {
          case 'roleMenu': {
            responseBody = await roleMenuHandler(clickButton);
            break;
          }
          case 'categoryMenu': {
            responseBody = categoryMenuHandler(clickButton);
            break;
          }
          case 'prevCategory': {
            responseBody = categoryButtonHandler(clickButton, false);
            break;
          }
          case 'nextCategory': {
            responseBody = categoryButtonHandler(clickButton, true);
            break;
          }
          case 'prevRoles': {
            responseBody = roleButtonHandler(clickButton, false);
            break;
          }
          case 'nextRoles': {
            responseBody = roleButtonHandler(clickButton, true);
            break;
          }
          default: {
            buttonsCollector.stop();
            this.execute(msg, clickButton);
          }
        }
        if (responseBody) clickButton.update(responseBody);
        buttonsCollector.resetTimer();
      } else msg.client.ch.notYours(clickButton, msg);
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.m.edit({ embeds: [embed], components: [] });
      }
    });
  },
};
