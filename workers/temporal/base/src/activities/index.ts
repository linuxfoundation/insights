// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { getServiceChildLogger } from '@crowd/logging'
import { SlackChannel, SlackPersona, sendSlackNotificationAsync } from '@crowd/slack'
import telemetry from '@crowd/telemetry'

const log = getServiceChildLogger('activity-interceptor')

async function telemetryDistribution(
  name: string,
  value: number,
  tags?: Record<string, string | number>,
) {
  telemetry.distribution(name, value, tags)
}

async function slackNotify(message: string, persona: SlackPersona | string) {
  // Accept string to allow workflow code to pass string literals without importing enum
  await sendSlackNotificationAsync(
    SlackChannel.ALERTS,
    persona as SlackPersona,
    'Temporal Alert',
    message,
  )
  log.info('Slack notification sent from Temporal activity')
}

export { telemetryDistribution, slackNotify }
