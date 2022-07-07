import type * as Eris from 'eris';

export default async (stage: Eris.StageInstance, oldStage: Eris.OldStageInstance) => {
  (await import('./log')).default(stage, oldStage);
};
