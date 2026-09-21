// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { FastifyReply, FastifyRequest } from 'fastify';

// The root app and every deprecated version scope register this one handler, so the 404
// body has a single definition to change when the error envelope in docs/site/errors.md lands.
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.code(404).send({
    message: `Route ${request.method}:${request.url} not found`,
    error: 'Not Found',
    statusCode: 404,
  });
}
