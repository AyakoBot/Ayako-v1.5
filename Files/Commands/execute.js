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
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0,
  dm: true,
  takesFirstArg: false,
  type: 'owner',
  execute: async (msg) => {
    msg.client.channels.cache.get('827302309368561715').send({
      content: `This is a Channel about Support for <@650691698409734151>\n
      **Do not send Messages here if you don't need help with Ayako**\nThis is
      not a general Support Channel`,
    });
  },
};

/*
    msg.client.application.commands.edit('971536827079082054', {
      name: 'giveaway',
      description: 'Giveaway related Commands',
      options: [
        {
          type: 1,
          name: 'edit',
          description: 'Edits a Giveaway',
          options: [
            {
              autocomplete: true,
              type: 3,
              name: 'giveaway',
              description: 'The Giveaway to edit',
              required: true,
            },
            {
              max_value: 9999999,
              min_value: 1,
              type: 4,
              name: 'winners',
              description: 'The Amount of Winners this Giveaway has',
              required: false,
            },
            {
              name: 'role',
              description: 'Role required to participate in this Giveaway',
              required: false,
              type: 8,
            },
            {
              type: 3,
              name: 'prize-description',
              description: 'A Description of the Prize the Winners will win',
              required: false,
            },
            {
              type: 3,
              name: 'actual-prize',
              description:
                'The actual Prize (If given, the Prize will be sent to winners automatically)',
              required: false,
            },
            {
              type: 3,
              name: 'time',
              description:
                'The Time after which the Winner will be chosen (Example: 5 days 20h 15 mins)',
              required: false,
            },
            {
              name: 'host',
              description: 'The User who hosts the Giveaway',
              required: false,
              type: 6,
            },
          ],
        },
        {
          type: 1,
          name: 'end',
          description: 'Ends a Giveaway manually',
          options: [
            {
              autocomplete: true,
              type: 3,
              name: 'giveaway',
              description: 'The Giveaway to end',
              required: true,
            },
          ],
        },
        {
          type: 1,
          name: 'create',
          description: 'Create a Giveaway',
          options: [
            {
              channel_types: [0, 5],
              name: 'channel',
              description: 'The Channel to start the Giveaway in',
              required: true,
              type: 7,
            },
            {
              type: 3,
              name: 'prize-description',
              description: 'A Description of the Prize the Winners will win',
              required: true,
            },
            {
              max_value: 9999999,
              min_value: 1,
              type: 4,
              name: 'winners',
              description: 'The Amount of Winners this Giveaway has',
              required: true,
            },
            {
              type: 3,
              name: 'time',
              description:
                'The Time after which the Winner will be chosen (Example: 5 days 20h 15 mins)',
              required: true,
            },
            {
              name: 'role',
              description: 'Role required to participate in this Giveaway',
              required: false,
              type: 8,
            },
            {
              type: 3,
              name: 'actual-prize',
              description:
                'The actual Prize (If given, the Prize will be sent to winners automatically)',
              required: false,
            },
            {
              name: 'host',
              description: 'The User who hosts the Giveaway',
              required: false,
              type: 6,
            },
          ],
        },
        {
          type: 1,
          name: 'reroll',
          description: 'Re-rolls a Giveaway and picks a new Winner',
          options: [
            {
              autocomplete: true,
              type: 3,
              name: 'giveaway',
              description: 'The Giveaway to re-roll',
              required: true,
            },
          ],
        },
      ],
      default_permission: true,
    });

    */
