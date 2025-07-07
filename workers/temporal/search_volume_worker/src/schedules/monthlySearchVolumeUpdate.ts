// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { ScheduleAlreadyRunning, ScheduleOverlapPolicy } from '@temporalio/client'

import { svc } from '../main'
import { monthlySearchVolumeUpdateWorkflow } from '../workflows/monthlySearchVolumeUpdate'

export async function scheduleMonthlySearchVolumeUpdate() {
  try {
    await svc.temporal.schedule.create({
      scheduleId: 'scheduleMonthlySearchVolumeUpdate',
      spec: {
        calendars: [
          {
            dayOfMonth: 1,
            hour: 3,
            minute: 17,
          },
        ],
      },
      policies: {
        overlap: ScheduleOverlapPolicy.BUFFER_ONE,
        catchupWindow: '1 minute',
      },
      action: {
        type: 'startWorkflow',
        workflowType: monthlySearchVolumeUpdateWorkflow,
        taskQueue: 'search-volume',
        retry: {
          initialInterval: '15 seconds',
          backoffCoefficient: 2,
          maximumAttempts: 3,
        },
        args: [{

        }],
      },
    })
  } catch (err) {
    if (err instanceof ScheduleAlreadyRunning) {
      svc.log.info('Search Volume schedule already registered in Temporal.')
      svc.log.info('Configuration may have changed since. Please make sure they are in sync.')
    } else {
      throw new Error(err)
    }
  }
}
