// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Earliest date each AI tool could realistically appear in commits.
// Data points before these dates are false positives (e.g. "cursor" meaning something else).
export const AI_TOOL_RELEASE_DATES: Record<string, string> = {
  'github-copilot': '2021-06-01', // Technical preview June 2021
  chatgpt: '2022-11-01', // Launched November 2022
  claude: '2023-03-01', // Launched March 2023
  cursor: '2023-03-01', // Launched March 2023
  codewhisperer: '2022-06-01', // Preview June 2022
  gemini: '2023-12-01', // Launched December 2023
  codeium: '2022-10-01', // Launched late 2022
  aider: '2023-05-01', // First release May 2023
  devin: '2024-03-01', // Announced March 2024
  tabnine: '2018-01-01', // Codota/Tabnine has been around since 2018
  other: '2021-01-01', // Generic AI-generated markers unlikely before 2021
};
