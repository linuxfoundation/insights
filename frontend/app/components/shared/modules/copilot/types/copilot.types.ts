// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Widget } from '~/components/modules/widget/types/widget';
import type { Project } from '~~/types/project';
import type { Config } from '~~/lib/chat/chart/types';

export interface CopilotData {
  widget: Widget;
  icon: string;
  suggestions: string;
  project?: Project
  question?: string;
  params?: CopilotParams;
}

export type CopilotParams = Record<string, string | number | null>;

export type MessagePartType = 'router-status' | 'sql-result' | 'text' | 'pipe-result' | 'chat-response-id';
export type MessageStatus = 'analyzing' | 'complete' | 'error';
export type MessageData = Record<string, string | number | null | string[] | object>;
export type MessageRole = 'user' | 'assistant';

export interface ResultsHistory {
  id: string;
  data: MessageData[];
  chartConfig?: Config;
}

export interface AIMessage {
  id: string; 
  role: MessageRole; 
  type: MessagePartType;
  status: MessageStatus;
  content: string; 
  timestamp: number;
  sql?: string;
  data?: Array<MessageData>;
  explanation?: string;
  instructions?: {
    pipes: Array<{
      id: string;
      name: string;
      inputs: Record<string, string>;
    }>;
    output: Array<{
      type: string;
      name: string;
      pipeId: string;
      sourceColumn: string;
    }>;
  };
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