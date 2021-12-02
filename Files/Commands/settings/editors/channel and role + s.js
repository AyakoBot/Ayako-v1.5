/* eslint-disable no-param-reassign */
const Discord = require('discord.js');
const misc = require('../misc');

module.exports = {
  key: ['channel', 'channels', 'role', 'roles'],
  async execute(
    msg,
    i,
    embed,
    values,
    answer,
    AddRemoveEditView,
    fail,
    srmEditing,
    comesFromSRM,
    answered,
  ) {
    if (!Array.isArray(msg.rows) && msg.rows) answered = msg.rows[msg.assigner];
    const req = msg.guild[msg.compatibilityType].cache;
    req.sort((a, b) => a.rawPosition - b.rawPosition);
    const options = [];
    req.forEach((r) => {
      if (msg.compatibilityType === 'channels') {
        if (
          r.type === 'GUILD_TEXT' ||
          r.type === 'GUILD_NEWS' ||
          r.type === 'GUILD_NEWS_THREAD' ||
          r.type === 'GUILD_PUBLIC_THREAD' ||
          r.type === 'GUILD_PRIVATE_THREAD'
        )
          options.push({
            label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name,
            value: r.id,
            description: r.parent ? `${r.parent.name}` : null,
          });
      } else if (msg.compatibilityType === 'roles')
        options.push({
          label: r.name.length > 25 ? `${r.name.slice(0, 24)}\u2026` : r.name,
          value: r.id,
        });
    });
    const take = [];
    for (let j = 0; j < 25 && j < options.length; j += 1) take.push(options[j]);
    const menu = new Discord.MessageSelectMenu()
      .setCustomId(msg.property)
      .addOptions(take)
      .setMinValues(1)
      .setMaxValues(msg.property.includes('s') ? take.length : 1)
      .setPlaceholder(msg.language.select[msg.property].select);
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(options.length < 25)
      .setStyle('SUCCESS');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(true)
      .setStyle('DANGER');
    const done = new Discord.MessageButton()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(true)
      .setStyle('PRIMARY');
    const back = new Discord.MessageButton()
      .setCustomId('back')
      .setLabel(msg.language.back)
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle('DANGER');
    embed = new Discord.MessageEmbed()
      .setAuthor(
        msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
        msg.client.constants.emotes.settingsLink,
        msg.client.constants.standard.invite,
      )
      .setDescription(
        `${msg.language.select[msg.property].desc}\n${msg.language.page}: \`1/${Math.ceil(
          options.length / 25,
        )}\``,
      );
    if (answered?.length)
      embed.addField(
        msg.language.selected,
        `${
          msg.property.includes('s')
            ? answered.map((c) =>
                msg.compatibilityType == 'channels'
                  ? `<#${c}>`
                  : msg.compatibilityType == 'roles'
                  ? `<@&${c}>`
                  : ` ${c}`,
              )
            : msg.compatibilityType == 'channels'
            ? `<#${answered}>`
            : msg.compatibilityType == 'roles'
            ? `<@&${answered}>`
            : `${answered}`
        } `,
      );
    const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
    if (answer) answer.update({ embeds: [embed], components: rows }).catch(() => {});
    else msg.m.edit({ embeds: [embed], components: rows }).catch(() => {});
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    let interaction;
    const resolved = await new Promise((resolve) => {
      buttonsCollector.on('collect', (clickButton) => {
        if (clickButton.user.id == msg.author.id) {
          if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
            let indexLast;
            let indexFirst;
            for (let j = 0; options.length > j; j++) {
              if (
                options[j] &&
                options[j].value ==
                  clickButton.message.components[0].components[0].options[
                    clickButton.message.components[0].components[0].options.length - 1
                  ].value
              )
                indexLast = j;
              if (
                options[j] &&
                options[j].value == clickButton.message.components[0].components[0].options[0].value
              )
                indexFirst = j;
            }
            take.splice(0, take.length);
            if (clickButton.customId == 'next')
              for (let j = indexLast + 1; j < indexLast + 26; j++) {
                if (options[j]) {
                  take.push(options[j]);
                }
              }
            if (clickButton.customId == 'prev')
              for (let j = indexFirst - 25; j < indexFirst; j++) {
                if (options[j]) {
                  take.push(options[j]);
                }
              }
            let page = clickButton.message.embeds[0].description
              ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0]
              : 0;
            clickButton.customId == 'next' ? page++ : page--;
            const menu = new Discord.MessageSelectMenu()
              .setCustomId(msg.property)
              .addOptions(take)
              .setMinValues(1)
              .setMaxValues(msg.property.includes('s') ? take.length : 1)
              .setPlaceholder(msg.language.select[msg.property].select);
            const next = new Discord.MessageButton()
              .setCustomId('next')
              .setLabel(msg.language.next)
              .setDisabled(options.length < page * 25 + 26)
              .setStyle('SUCCESS');
            const prev = new Discord.MessageButton()
              .setCustomId('prev')
              .setLabel(msg.language.prev)
              .setDisabled(page == 1)
              .setStyle('DANGER');
            const done = new Discord.MessageButton()
              .setCustomId('done')
              .setLabel(msg.language.done)
              .setStyle('PRIMARY');
            const back = new Discord.MessageButton()
              .setCustomId('back')
              .setLabel(msg.language.back)
              .setEmoji(msg.client.constants.emotes.back)
              .setStyle('DANGER');
            if (answered.length) done.setDisabled(false);
            else done.setDisabled(true);
            const embed = new Discord.MessageEmbed()
              .setAuthor(
                msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
                msg.client.constants.emotes.settingsLink,
                msg.client.constants.standard.invite,
              )
              .setDescription(
                `${msg.language.select[msg.property].desc}\n${
                  msg.language.page
                }: \`${page}/${Math.ceil(+options.length / 25)}\``,
              );
            if (answered?.length)
              embed.addField(
                msg.language.selected,
                `${
                  msg.property.includes('s')
                    ? answered.map((c) =>
                        msg.compatibilityType == 'channels'
                          ? `<#${c}>`
                          : msg.compatibilityType == 'roles'
                          ? `<@&${c}>`
                          : ` ${c}`,
                      )
                    : msg.compatibilityType == 'channels'
                    ? `<#${answered}>`
                    : msg.compatibilityType == 'roles'
                    ? `<@&${answered}>`
                    : `${answered}`
                } `,
              );
            if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
            else next.setDisabled(false);
            if (page > 1) prev.setDisabled(false);
            else prev.setDisabled(true);
            const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
            clickButton.update({ embeds: [embed], components: rows }).catch(() => {});
          } else if (clickButton.customId == 'done') {
            if (msg.compatibilityType == 'channels' || msg.compatibilityType == 'roles') {
              if (answered.length) {
                if (msg.property.includes('s')) {
                  answered.forEach((id) => {
                    if (values[msg.assigner] && values[msg.assigner].includes(id)) {
                      const index = values[msg.assigner].indexOf(id);
                      values[msg.assigner].splice(index, 1);
                    } else if (values[msg.assigner] && values[msg.assigner].length)
                      values[msg.assigner].push(id);
                    else values[msg.assigner] = [id];
                  });
                } else values[msg.assigner] = answered[0];
              }
            } else if (msg.compatibilityType == 'number') {
              if (answered.length) {
                if (msg.property.includes('s')) {
                  answered.forEach((id) => {
                    if (values[msg.assigner] && values[msg.assigner].includes(id)) {
                      const index = values[msg.assigner].indexOf(id);
                      values[msg.assigner].splice(index, 1);
                    } else if (values[msg.assigner] && values[msg.assigner].length)
                      values[msg.assigner].push(id);
                    else values[msg.assigner] = [id];
                  });
                } else values[msg.assigner] = answered[0];
              }
            }
            messageCollector.stop('finished');
            buttonsCollector.stop('finished');
            interaction = clickButton;
            resolve(true);
          } else if (clickButton.customId == msg.property) {
            clickButton.values.forEach((val) => {
              if (!answered.includes(val))
                msg.guild[msg.compatibilityType].cache.get(val)
                  ? answered.push(msg.guild[msg.compatibilityType].cache.get(val).id)
                  : '';
              else answered.splice(answered.indexOf(val), 1);
            });
            const page = clickButton.message.embeds[0].description
              ? clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0]
              : 0;
            const menu = new Discord.MessageSelectMenu()
              .setCustomId(msg.property)
              .addOptions(take)
              .setMinValues(1)
              .setMaxValues(msg.property.includes('s') ? take.length : 1)
              .setPlaceholder(msg.language.select[msg.property].select);
            const next = new Discord.MessageButton()
              .setCustomId('next')
              .setLabel(msg.language.next)
              .setDisabled(options.length < page * 25 + 26)
              .setStyle('SUCCESS');
            const prev = new Discord.MessageButton()
              .setCustomId('prev')
              .setLabel(msg.language.prev)
              .setDisabled(page == 1)
              .setStyle('DANGER');
            const done = new Discord.MessageButton()
              .setCustomId('done')
              .setLabel(msg.language.done)
              .setStyle('PRIMARY');
            const back = new Discord.MessageButton()
              .setCustomId('back')
              .setLabel(msg.language.back)
              .setEmoji(msg.client.constants.emotes.back)
              .setStyle('DANGER');
            if (answered.length) done.setDisabled(false);
            else done.setDisabled(true);
            const embed = new Discord.MessageEmbed()
              .setAuthor(
                msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
                msg.client.constants.emotes.settingsLink,
                msg.client.constants.standard.invite,
              )
              .setDescription(
                `${msg.language.select[msg.property].desc}\n${
                  msg.language.page
                }: \`${page}/${Math.ceil(+options.length / 25)}\``,
              )
              .addField(
                msg.language.selected,
                `${
                  msg.property.includes('s')
                    ? answered.map((c) =>
                        msg.compatibilityType == 'channels'
                          ? `<#${c}>`
                          : msg.compatibilityType == 'roles'
                          ? `<@&${c}>`
                          : ` ${c}`,
                      )
                    : msg.compatibilityType == 'channels'
                    ? `<#${answered}>`
                    : msg.compatibilityType == 'roles'
                    ? `<@&${answered}>`
                    : `${answered}`
                } `,
              );
            const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
            clickButton.update({ embeds: [embed], components: rows }).catch(() => {});
          } else if (clickButton.customId == 'back') {
            messageCollector.stop();
            buttonsCollector.stop();
            resolve(false);
            if (comesFromSRM)
              return require('../singleRowManager').redirecter(
                msg,
                clickButton,
                AddRemoveEditView,
                fail,
                values,
                values.id ? 'redirecter' : null,
              );
            return require('../multiRowManager').edit(msg, clickButton, {});
          }
        } else msg.client.ch.notYours(clickButton, msg);
      });
      messageCollector.on('collect', async (message) => {
        if (msg.author.id == message.author.id) {
          if (message.content == msg.language.cancel) {
            resolve(false);
            return misc.aborted(msg, [messageCollector, buttonsCollector]);
          }
          message.delete().catch(() => {});
          if (msg.property == 'role' || msg.property == 'channel') {
            const answerContent = message.content.replace(/\D+/g, '');
            const result = msg.guild[msg.compatibilityType].cache.get(answerContent);
            if (result) {
              values[msg.assigner] = answerContent;
              answered = values[msg.assigner];
            } else misc.notValid(msg);
          } else if (msg.property == 'roles' || msg.property == 'channels') {
            const args = message.content.split(/ +/);
            Promise.all(
              args.map(async (raw) => {
                const id = raw.replace(/\D+/g, '');
                const request = msg.guild[msg.compatibilityType].cache.get(id);
                if (
                  (!request || !request.id) &&
                  (!values[msg.assigner] ||
                    (values[msg.assigner] && !values[msg.assigner].includes(id)))
                )
                  fail.push(`\`${raw}\` ${msg.lan.edit[msg.property].fail.no}`);
                else answered.push(id);
              }),
            );
            if (answered.length) {
              if (msg.property.includes('s')) {
                answered.forEach((id) => {
                  if (values[msg.assigner] && values[msg.assigner].includes(id)) {
                    const index = values[msg.assigner].indexOf(id);
                    values[msg.assigner].splice(index, 1);
                  } else if (values[msg.assigner] && values[msg.assigner].length)
                    values[msg.assigner].push(id);
                  else values[msg.assigner] = [id];
                });
              } else values[msg.assigner] = answered;
            }
            answered = values[msg.assigner];
          } else return misc.notValid(msg);
          buttonsCollector.stop();
          messageCollector.stop();
          resolve(true);
        }
        buttonsCollector.on('end', (collected, reason) => {
          if (reason == 'time') {
            msg.client.ch.collectorEnd(msg);
            resolve(false);
          }
        });
      });
    });
    if (resolved)
      return [
        'repeater',
        msg,
        i + 1,
        embed,
        values,
        interaction,
        AddRemoveEditView,
        fail,
        srmEditing,
        comesFromSRM,
        answered,
      ];
    return null;
  },
};
