const Tenor = require('tenorjs');
const auth = require('./auth.json');

Tenor.client({
  Key: auth.tenor.key1,
  Filter: 'off',
  Locale: 'en_US',
  MediaFilter: 'minimal',
  DateFormat: 'D/MM/YYYY - H:mm:ss A',
});

module.exports = {
  async getGif(url) {
    const split = url.split(/-+/);
    const ID = split[split.length - 1];
    const Gif = await Tenor.Search.Find([ID]);
    return Gif;
  },
};
