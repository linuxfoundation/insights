// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { WorkflowInterceptorsFactory } from '@temporalio/workflow'

import { WorkflowMonitoringInterceptor } from '../interceptors'

export const interceptors: WorkflowInterceptorsFactory = () => ({
  inbound: [new WorkflowMonitoringInterceptor()],
})
