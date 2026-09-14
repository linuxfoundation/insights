// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

/**
 * Structured error log line (JSON) so log aggregators like Datadog can parse it,
 * instead of a free-text `console.error('[scope] message:', error)` call.
 */
export function logError(scope: string, message: string, error: unknown): void {
  console.error(
    JSON.stringify({
      scope,
      message,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
    }),
  );
}
