// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Widget } from '~/components/modules/widget/types/widget'
import type { Project } from '~~/types/project'
import type { Config } from '~~/lib/chat/chart/types'

export interface CopilotData {
  widget?: Widget
  icon?: string
  suggestions: string
  project?: Project
  question?: string
  params?: CopilotParams
}

export type CopilotParams = Record<string, string | number | null>

export type MessagePartType = 'router-status' | 
                              'sql-result' | 
                              'text' | 
                              'pipe-result' | 
                              'chat-response-id' | 
                              'conversation-id';
export type MessageStatus = 'analyzing' | 'complete' | 'error' | 'ask_clarification';
export type MessageData = Record<string, string | number | null | string[] | object>;
export type MessageRole = 'user' | 'assistant';

export type ChartErrorType = 'default' | 'chart-empty' | 'chart-error'

export interface ResultsHistory {
  id: string;
  data: MessageData[];
  title?: string;
  chartConfig?: Config | null;
  chartErrorType?: ChartErrorType;
  routerReasoning?: string;
  conversationId?: string;
}

export interface AIMessage {
  id: string;
  role: MessageRole;
  type: MessagePartType;
  status: MessageStatus;
  content: string;
  timestamp: number;
  conversationId?: string;
  chatResponseId?: string;
  sql?: string;
  data?: Array<MessageData>;
  explanation?: string;
  routerReasoning?: string;
  reformulatedQuestion?: string;
  question?: string; // Clarification question when status is 'ask_clarification'
  instructions?: {
    pipes: Array<{
      id: string
      name: string
      inputs: Record<string, string>
    }>
    output: Array<{
      type: string
      name: string
      pipeId: string
      sourceColumn: string
    }>
  }
}

// export interface CopilotMessage {
//   role: 'user' | 'assistant';
//   parts: Array<CopilotMessagePart>;
// }

// export interface CopilotMessagePart {
//   type: MessagePartType;
//   text?: string;
//   image?: string;
// }
