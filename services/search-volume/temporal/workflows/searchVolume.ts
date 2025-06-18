import { proxyActivities, defineSignal, setHandler } from '@temporalio/workflow';

const { runSearchVolume } = proxyActivities<{
  runSearchVolume: () => Promise<void>;
}>({ startToCloseTimeout: '1 hour' });

export const triggerSignal = defineSignal('trigger');

export async function searchVolumeWorkflow(): Promise<void> {
  setHandler(triggerSignal, async () => {
    await runSearchVolume();
  });
  await runSearchVolume();
}

