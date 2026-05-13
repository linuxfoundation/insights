// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import fastifySwagger from '@fastify/swagger';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance } from 'fastify';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: 'warn' },
    disableRequestLogging: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  const publicUrl = process.env.API_PUBLIC_URL ?? 'http://localhost:4000';

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'LFX Insights API',
        version: '0.1.0',
        description: 'Public API for LFX Insights.',
      },
      servers: [{ url: publicUrl }],
    },
  });

  app.get('/openapi.json', async () => app.swagger());

  return app;
}
