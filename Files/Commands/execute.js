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
  perm: 0n,
  dm: true,
  takesFirstArg: false,
  execute: async (msg) => {

    if (msg.author.id !== '318453143476371456') return;
    msg.client.channels.cache.get('827302309368561715').send({
      content: `This is a Channel about Support for <@650691698409734151>\n**Do not send Messages here if you don't need help with Ayako**\nThis is not a general Support Channel`,
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
              description: 'The Message Link of the Giveaway to edit',
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
              description: 'The Time after which the Winner will be chosen',
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
          name: 'list',
          description: 'List running Giveaways',
          options: [],
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
              description: 'The Message Link of the Giveaway to edit',
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
              description: 'The Time after which the Winner will be chosen',
              required: true,
            },
            {
              type: 3,
              name: 'prize-description',
              description: 'A Description of the Prize the Winners will win',
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
      ],
      default_permission: true,
    });

    return;

    const command = new Builders.SlashCommandBuilder()
      .setName('giveaway')
      .setDescription('Giveaway related Commands')
      .setDefaultPermission(true)
      .addSubcommand(
        new Builders.SlashCommandSubcommandBuilder()
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setName('message-link')
              .setDescription('The Message Link of the Giveaway to edit')
              .setAutocomplete(true)
              .setRequired(true),
          )
          .setName('edit')
          .setDescription('Edits a Giveaway')
          .addIntegerOption(
            new Builders.SlashCommandIntegerOption()
              .setDescription('The Amount of Winners this Giveaway has')
              .setMaxValue(9999999)
              .setMinValue(1)
              .setName('winners')
              .setAutocomplete(true)
              .setRequired(false),
          )
          .addRoleOption(
            new Builders.SlashCommandRoleOption()
              .setDescription('Role required to participate in this Giveaway')
              .setName('role')
              .setRequired(false),
          )
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setDescription('A Description of the Prize the Winners will win')
              .setName('prize-description')
              .setAutocomplete(true)
              .setRequired(false),
          )
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setDescription(
                'The actual Prize (If given, the Prize will be sent to winners automatically)',
              )
              .setName('actual-prize')
              .setAutocomplete(true)
              .setRequired(false),
          )
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setDescription('The Time after which the Winner will be chosen')
              .setName('time')
              .setAutocomplete(true)
              .setRequired(false),
          )
          .addUserOption(
            new Builders.SlashCommandUserOption()
              .setDescription('The User who hosts the Giveaway')
              .setName('host')
              .setRequired(false),
          ),
      )
      .addSubcommand(
        new Builders.SlashCommandSubcommandBuilder()
          .setName('list')
          .setDescription('List running Giveaways'),
      )
      .addSubcommand(
        new Builders.SlashCommandSubcommandBuilder()
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setName('message-link')
              .setDescription('The Message Link of the Giveaway to edit')
              .setAutocomplete(true)
              .setRequired(true),
          )
          .setName('end')
          .setDescription('Ends a Giveaway manually'),
      )
      .addSubcommand(
        new Builders.SlashCommandSubcommandBuilder()
          .setDescription('Create a Giveaway')
          .setName('create')
          .addChannelOption(
            new Builders.SlashCommandChannelOption()
              .addChannelTypes(...[0, 5])
              .setDescription('The Channel to start the Giveaway in')
              .setName('channel')
              .setRequired(true),
          )
          .addIntegerOption(
            new Builders.SlashCommandIntegerOption()
              .setDescription('The Amount of Winners this Giveaway has')
              .setMaxValue(9999999)
              .setMinValue(1)
              .setName('winners')
              .setAutocomplete(true)
              .setRequired(true),
          )
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setDescription('The Time after which the Winner will be chosen')
              .setName('time')
              .setAutocomplete(true)
              .setRequired(true),
          )
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setDescription('A Description of the Prize the Winners will win')
              .setName('prize-description')
              .setAutocomplete(true)
              .setRequired(true),
          )
          .addRoleOption(
            new Builders.SlashCommandRoleOption()
              .setDescription('Role required to participate in this Giveaway')
              .setName('role')
              .setRequired(false),
          )
          .addStringOption(
            new Builders.SlashCommandStringOption()
              .setDescription(
                'The actual Prize (If given, the Prize will be sent to winners automatically)',
              )
              .setName('actual-prize')
              .setAutocomplete(true)
              .setRequired(false),
          )
          .addUserOption(
            new Builders.SlashCommandUserOption()
              .setDescription('The User who hosts the Giveaway')
              .setName('host')
              .setRequired(false),
          ),
      );

    console.log(JSON.stringify(command.toJSON(), null, 2));
    return;

    */
