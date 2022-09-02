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
    const m = await msg.client.channels.cache
      .get('554487212276842534')
      .messages.fetch('1013981979580043344');

    const e = new Builders.UnsafeEmbedBuilder(m.embeds[0]);

    e.setDescription(
      '**Want to post your artwork?**\n' +
        '- Apply for the <@&972491319912067092> role\n' +
        '- Talk in <#298954459172700181> to gain <@&334832484581769217>\n' +
        '\n' +
        '**How to apply for <@&972491319912067092>**\n' +
        "1. DM an <@&809261905855643668> 3 of your artworks. These images will be reverse image searched, so don't try to pull anything funny!\n" +
        '2. A staff member will verify you as an Artist!\n' +
        '\n' +
        '**General Art posting Rules**\n' +
        '- Do not steal Art\n' +
        '- Do not post NSFW Art\n' +
        '- Line Tracing posts are allowed __as long as__ you provide a link to the original artwork\n' +
        'Failure to adhere to these rules will result in punishment and exclusion.',
    );
    e.setColor(11599616);

    m.edit({ embeds: [e] });
  },
};

/*
    msg.client.application.commands.edit('awaw', {
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
