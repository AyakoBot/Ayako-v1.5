export default async (id: string) => {
  const { default: client } = await import('../ErisClient');

  const user = client.users.get(id);
  if (!user) return client.getRESTUser(id).catch(() => null);
  return user;
};
