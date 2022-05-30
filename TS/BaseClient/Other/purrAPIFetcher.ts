import axios from 'axios';

export default async (name: string) => {
  const res = await axios.get(`https://purrbot.site/api/img/sfw/${name}/gif`);

  if (res && res.status === 200) return res.data.link;
  return null;
};
