// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
export enum StreamDataType {
  ROUTER_STATUS = 'router-status',
  CHAT_RESPONSE_ID = 'chat-response-id',
  SQL_RESULT = 'sql-result',
  PIPE_RESULT = 'pipe-result',
  AUDITOR_STATUS = 'auditor-status',
}

export enum StreamDataStatus {
  ANALYZING = 'analyzing',
  COMPLETE = 'complete',
  ASK_CLARIFICATION = 'ask_clarification',
  VALIDATING = 'validating',
  VALIDATED = 'validated',
  RETRYING = 'retrying',
  MAX_RETRIES = 'max_retries',
}

export enum RouterDecisionAction {
  STOP = 'stop',
  CREATE_QUERY = 'create_query',
  PIPES = 'pipes',
  ASK_CLARIFICATION = 'ask_clarification',
}
