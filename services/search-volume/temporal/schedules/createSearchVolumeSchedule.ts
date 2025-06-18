import { Connection, ScheduleClient } from '@temporalio/client';

async function createMonthlySchedule() {
  const connection = await Connection.connect();
  const scheduleClient = new ScheduleClient({ connection });

  await scheduleClient.create({
    scheduleId: 'search-volume-monthly',
    spec: {
      calendars: [
        {
          dayOfMonth: 1,
          hour: 0,
          minute: 0,
        },
      ],
    },
    action: {
      type: 'startWorkflow',
      workflowType: 'searchVolumeWorkflow',
      taskQueue: 'search-volume',
      args: [],
    },
    policies: {
      overlap: 'SKIP',
    },
  });

  console.log('Monthly schedule created for search-volume workflow.');
}

createMonthlySchedule().catch((err) => {
  console.error(err);
  process.exit(1);
});

