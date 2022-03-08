/* eslint-disable prettier/prettier */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-vars */
const axios = require('axios');
const fs = require('fs');
const superagent = require('superagent');
const Discord = require('discord.js');
const jobs = require('node-schedule');
const ms = require('ms');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0n,
  dm: true,
  takesFirstArg: false,
  execute: async (msg) => {
    const m = await msg.channel.send({
      content: 'Test Message',
      components: [
        new Discord.ActionRow().setComponents(
          new Discord.ButtonComponent().setLabel('Test Button').setCustomId('test').setStyle(1),
        ),
      ],
    });

    const buttonsCollector = m.channel.createMessageComponentCollector({ time: 500000 });
    buttonsCollector.on('collect', (interaction) => {
      if (interaction.customId === 'test') {
        // Create the modal
        const modal = new Discord.Modal().setTitle('My Awesome Form').setCustomId('AwesomeForm');

        // Create text input fields
        const one = new Discord.TextInputComponent()
          .setCustomId('1')
          .setLabel('Test Short')
          .setStyle(Discord.TextInputStyle.Short);

        const two = new Discord.TextInputComponent()
          .setCustomId('2')
          .setLabel('Test Paragraph')
          .setStyle(Discord.TextInputStyle.Paragraph);

        const rows = [one, two].map((component) =>
          new Discord.ActionRow().addComponents(component),
        );

        // Add action rows to form
        modal.addComponents(...rows);

        // Present the modal to the user
        interaction.showModal(modal);
      }
    });
  },
};
