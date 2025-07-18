// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {
  Next,
  WorkflowExecuteInput,
  WorkflowInboundCallsInterceptor,
  proxyActivities,
  workflowInfo,
} from '@temporalio/workflow'

import * as activities from './activities'

const activity = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
})

export class WorkflowMonitoringInterceptor implements WorkflowInboundCallsInterceptor {
  async execute(
    input: WorkflowExecuteInput,
    next: Next<WorkflowInboundCallsInterceptor, 'execute'>,
  ): Promise<unknown> {
    const info = workflowInfo()

    const tags = {
      workflow_run_id: info.runId,
      workflow_id: info.workflowId,
      workflow_type: info.workflowType,
      task_queue: info.taskQueue,
    }

    const start = new Date()

    try {
      const result = await next(input)
      return result
    } finally {
      const end = new Date()
      const duration = end.getTime() - start.getTime()

      // Only send telemetry if duration is more than 2 hours
      if (duration > 3 * 60 * 60 * 1000) {
        await activity.telemetryDistribution('temporal.workflow_execution_duration', duration, tags)
      }
    }
  }
}
