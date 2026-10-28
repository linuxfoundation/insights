// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { TinybirdLogger } from './types.js';

// Events print as one JSON line, so consumers on the default logger keep a parseable format.
const line = (message: string, fields?: Record<string, unknown>) =>
  fields ? JSON.stringify({ message, ...fields }) : message;

/** The default logger: console output, with each event as one JSON line. */
export const consoleLogger: TinybirdLogger = {
  warn: (message, fields) => console.warn(line(message, fields)),
  error: (message, fields) => console.error(line(message, fields)),
};
