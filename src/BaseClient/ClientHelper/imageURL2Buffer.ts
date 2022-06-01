import axios from 'axios';

export default async (urls: string[]) => {
  return (await Promise.all(urls.map((url) => axios.get(url).catch((e) => e))))
    .map((res, i) => {
      const URLObject = new URL(urls[i]);
      const name = URLObject.pathname.split(/\/+/).pop();

      const buffer = res?.body;

      if (buffer) {
        return {
          attachment: buffer,
          name,
        };
      }
      return null;
    })
    .filter((r) => !!r);
};