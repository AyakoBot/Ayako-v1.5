const axios = require('axios');

module.exports = async (name) => {
  const res = await axios.get(`https://purrbot.site/api/img/sfw/${name}/gif`);

  if (res && res.status === 200) {
    return res.data.link;
  }
  return null;
};
