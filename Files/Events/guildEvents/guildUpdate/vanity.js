const axios = require('axios');
const { token } = require('../../../BaseClient/auth.json');

module.exports = async (oldG, newG) => {
  if (!newG.available) return;
  if (newG.premiumTier !== 3) return;

  const vanity = await getVanity(newG);
  if (!vanity) return;

  const actualVanity = vanity.replace(/ /g, '-').slice(0, 26);

  if (newG.vanity === actualVanity) return;
  if (!newG.members.me.permissions.has(8n)) return;

  setToken(newG, vanity);
};

const getVanity = async (g) => {
  const res = await g.client.ch.query(`SELECT * FROM guildsettings WHERE guildid = $1;`, [g.id]);
  if (res && res.rowCount) return res.rows[0].vanity;
  return null;
};

const setToken = (g, vanity) => {
  axios({
    method: 'patch',
    url: `https://discord.com/api/v10/guilds/${g.id}/vanity-url`,
    data: { code: vanity },
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
