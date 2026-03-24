// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { lfxColors } from '~/config/styles/colors';

export const AI_TOOL_COLOR_MAP: Record<string, string> = {
  'github-copilot': lfxColors.brand[500],
  chatgpt: lfxColors.positive[500],
  claude: lfxColors.warning[500],
  cursor: lfxColors.violet[500],
  codewhisperer: lfxColors.negative[400],
  gemini: lfxColors.accent[500],
  codeium: lfxColors.discovery[500],
  other: lfxColors.neutral[400],
};

export const getAiToolColor = (toolKey: string): string => {
  return AI_TOOL_COLOR_MAP[toolKey] || lfxColors.neutral[400];
};
