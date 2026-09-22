// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { UIMessageStreamWriter } from 'ai';

/** UI message stream data part carrying copilot status/result payloads to the client. */
export const COPILOT_DATA_PART = 'data-copilot';

export function writeStreamData(
  dataStream: UIMessageStreamWriter,
  payload: Record<string, unknown>,
): void {
  dataStream.write({ type: COPILOT_DATA_PART, data: payload });
}
