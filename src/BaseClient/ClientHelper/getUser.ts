import client from '../ErisClient';

export default (id: string) => {
  const user = client.users.get(id);
  if (!user) return client.getRESTUser(id).catch(() => null);
  return user;
};
