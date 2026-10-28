// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TinybirdLogger, TinybirdLogLevel } from './types.js';

const rank: Record<TinybirdLogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

// Events print as one JSON line, so consumers on the default logger keep a parseable format.
const line = (message: string, fields?: Record<string, unknown>) =>
  fields ? JSON.stringify({ message, ...fields }) : message;

/** Console output from `level` up, with each event as one JSON line. */
export function createConsoleLogger(level: TinybirdLogLevel = 'info'): TinybirdLogger {
  // Levels usually come from an env var, so a typo falls back to info instead of silencing the client.
  const min = Object.hasOwn(rank, level) ? rank[level] : rank.info;
  const at = (target: TinybirdLogLevel) => (message: string, fields?: Record<string, unknown>) => {
    if (rank[target] >= min) console[target](line(message, fields));
  };
  return { debug: at('debug'), info: at('info'), warn: at('warn'), error: at('error') };
}

export const consoleLogger = createConsoleLogger();
