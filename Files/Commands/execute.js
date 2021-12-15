/* eslint-disable prettier/prettier */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const axios = require('axios');
const fs = require('fs');
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 268435456n,
  dm: true,
  takesFirstArg: false,
  async execute(msg) {

  },
};

/*

function abc() {
  const markup = document.documentElement.innerHTML;
  const regex = /src="?.*\.ico"/g;
  let found = [];
  const foundRegex = markup.match(regex);
  found = found.concat(foundRegex);
  if (document.querySelector("link[rel*='ico']")) {
    found.push(document.querySelector("link[rel*='ico']").href);
    found.push(document.querySelector("link[rel*='ico']").src);
  }
  const filtered = found.filter((el) => {
    return el != null;
  });

  console.log(filtered);
}
abc();
*/
