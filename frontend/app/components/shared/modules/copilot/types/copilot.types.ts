// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Widget } from '~/components/modules/widget/types/widget';

export interface CopilotData {
  widget: Widget;
  icon: string;
  suggestions: string;

  question?: string;
}

export type MessagePartType = 'router-status' | 'sql-result' | 'text' | 'pipe-result';

export interface AIMessage {
  id: string; 
  role: 'user' | 'assistant'; 
  content: string; 
  timestamp: number;
}

export interface CopilotMessage {
  role: 'user' | 'assistant';
  parts: Array<CopilotMessagePart>;
}

export interface CopilotMessagePart {
  type: MessagePartType;
  text?: string;
  image?: string;
}