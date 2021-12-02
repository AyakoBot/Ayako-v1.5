const SA = require('superagent');
const fs = require('fs');

const linkLists = require('../../sources').antivirus;

module.exports = {
  async execute() {
    let list = [];
    let url;
    const promises = [];
    const getList = async (entry) => {
      await SA.get(entry).catch(() => {});
      url = url ? (list = [...list, ...url.text.split(/\n+/)]) : null;
    };
    linkLists.forEach((entry) => {
      promises.push(getList(entry));
    });
    await Promise.all(promises);
    const blacklist = [...new Set(list)];
    blacklist.forEach((entry, index) => {
      blacklist[index] = entry.replace(/#{2}-{1}/g, '');
      if (blacklist[index].startsWith('#')) blacklist.splice(index, 1);
    });
    fs.writeFileSync('./Files/blocklist.json', JSON.stringify(blacklist));
  },
};
