import pool from '../DataBase';

export default async (
  string: string,
  args?: (string | number | boolean | null)[],
  debug?: boolean,
) => {
  // eslint-disable-next-line no-console
  if (debug) console.log(string, args);

  const res = await pool.query(string, args).catch((err) => {
    throw new Error(err);
  });

  if (!res || !res.length) return null;
  return res;
};
