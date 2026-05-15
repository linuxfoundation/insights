// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

export class TinybirdClientError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'TinybirdClientError';
  }
}

export class TinybirdQueueFullError extends TinybirdClientError {
  constructor() {
    super(503, 'Tinybird request queue full — try again shortly');
    this.name = 'TinybirdQueueFullError';
  }
}

export class TinybirdQueueTimeoutError extends TinybirdClientError {
  constructor() {
    super(503, 'Tinybird request queue timeout — try again shortly');
    this.name = 'TinybirdQueueTimeoutError';
  }
}

export class TinybirdProjectNotFoundError extends TinybirdClientError {
  constructor(project: string) {
    super(404, `Project not found: ${project}`);
    this.name = 'TinybirdProjectNotFoundError';
  }
}

export class TinybirdInvalidResponseError extends TinybirdClientError {
  constructor(message = 'Invalid response from Tinybird') {
    super(502, message);
    this.name = 'TinybirdInvalidResponseError';
  }
}
