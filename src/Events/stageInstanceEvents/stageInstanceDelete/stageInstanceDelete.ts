import type * as Eris from 'eris';

export default async (stage: Eris.StageInstance) => {
  (await import('./log')).default(stage);
};
