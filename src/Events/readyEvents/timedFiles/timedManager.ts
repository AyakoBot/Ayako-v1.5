export default async () => {
  (await import('./separatorControl')).default();
  (await import('./antivirusClear')).default();
  (await import('./expiry')).default();
  (await import('./stats')).default();
};