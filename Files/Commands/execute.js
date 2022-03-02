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
const math = require('math.js');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0n,
  dm: true,
  takesFirstArg: false,
  execute: async (msg) => {
    let x;
    const y = 1150;
    {
      (x =
        (243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275))) **
        (1 / 3 / 30 +
          325 /
            (2 *
              (243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
              (1 / 3) -
          9 / 2)),
        (x =
          (-(243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
          (1 / 3 / 60 -
            325 /
              (4 *
                (243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
                (1 / 3) -
            9 / 2 -
            (Math.sqrt(3) *
              (243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275))) **
                (1 / 3 / 30 -
                  325 /
                    (2 *
                      (243000 +
                        8100 * y +
                        75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
                      (1 / 3)) *
              math.i) /
              2)),
        (x =
          (-(243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
          (1 / 3 / 60 -
            325 /
              (4 *
                (243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
                (1 / 3) -
            9 / 2 +
            (Math.sqrt(3) *
              (243000 + 8100 * y + 75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275))) **
                (1 / 3 / 30 -
                  325 /
                    (2 *
                      (243000 +
                        8100 * y +
                        75 * Math.sqrt((11664 * y) ** (2 + 699840 * y - 10099275)))) **
                      (1 / 3)) *
              math.i) /
              2));
    }

    console.log(x);
  },
};
