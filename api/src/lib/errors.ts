// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyReply, FastifyRequest } from 'fastify';

// Fastify's default error handler uses statusCode as the HTTP status and puts code in the body.
export class NotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'not_found';
}

// Same message as the Worker's 401, which is the one callers normally see.
export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  readonly code = 'unauthorized';

  constructor() {
    super('A valid personal access token is required');
  }
}

// The message is fixed so an upstream's own error text or status never reaches the caller.
export class UpstreamUnavailableError extends Error {
  readonly statusCode = 503;
  readonly code = 'upstream_unavailable';

  constructor() {
    super('An upstream data source is unavailable');
  }
}

// The root app and every deprecated version scope register this one handler, so the 404
// body has a single definition to change when the error envelope in docs/site/errors.md lands.
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.code(404).send({
    message: `Route ${request.method}:${request.url} not found`,
    error: 'Not Found',
    statusCode: 404,
  });
}
