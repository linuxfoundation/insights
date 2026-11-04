// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import fastifySwagger from '@fastify/swagger';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { LogController, type FastifyInstance } from 'fastify';
import type { JWTVerifyGetKey } from 'jose';

import { authenticate } from './auth.js';
import { useTinybirdLog } from './clients/tinybird.js';
import { healthRoutes } from './health.js';
import { notFoundHandler } from './lib/errors.js';
import { rateLimit } from './rate-limit.js';
import { cacheResponses } from './response-cache.js';
import { recordRequest, tagCaller } from './telemetry.js';
import { applyLifecycle } from './versions/lifecycle.js';
import { specVersionFor, versionRegistry, type ApiVersion } from './versions/registry.js';

export interface BuildAppOptions {
  versions?: readonly ApiVersion[];
  authKeys?: JWTVerifyGetKey;
}

type ComponentSections = Record<string, Record<string, unknown>>;

function collectRefs(node: unknown, into: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectRefs(item, into);
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') {
        into.add(value);
      } else {
        collectRefs(value, into);
      }
    }
  }
}

// Swagger hoists every scope's shared schemas into one root components block, so a
// version's document must keep only the definitions its own paths reach via $ref.
function prunedComponents(components: ComponentSections, paths: unknown): ComponentSections {
  const kept = new Set<string>();
  let frontier = new Set<string>();
  collectRefs(paths, frontier);
  while (frontier.size > 0) {
    const next = new Set<string>();
    for (const ref of frontier) {
      // A ref may point inside a definition (.../User/properties/id), so only the
      // first two segments name the component to keep.
      const match = /^#\/components\/([^/]+)\/([^/]+)/.exec(ref);
      if (!match) {
        continue;
      }
      const key = `${match[1]}/${match[2]}`;
      if (kept.has(key)) {
        continue;
      }
      kept.add(key);
      collectRefs(components[match[1]]?.[match[2]], next);
    }
    frontier = next;
  }
  return Object.fromEntries(
    Object.entries(components).map(([section, defs]) => [
      section,
      // Security schemes are referenced by name from `security`, never by $ref.
      section === 'securitySchemes'
        ? defs
        : Object.fromEntries(
            Object.entries(defs).filter(([name]) => kept.has(`${section}/${name}`)),
          ),
    ]),
  );
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      // pino rejects an unknown level at startup, so a typo fails the deploy instead of going quiet.
      level: process.env.API_LOG_LEVEL ?? 'info',
      // Datadog reads a string level as the log status; pino writes a number by default.
      formatters: { level: (label) => ({ level: label }) },
    },
    logController: new LogController({ disableRequestLogging: true }),
  }).withTypeProvider<TypeBoxTypeProvider>();
  useTinybirdLog(app.log);

  // The local default lives in .env.dist, not here; see src/env.ts.
  const publicUrl = process.env.API_PUBLIC_URL;
  const versions = options.versions ?? versionRegistry;

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'LFX Insights API',
        version: '0.1.0',
        description: 'LFX Insights public API.',
      },
      // Omitted servers means same-origin per the OpenAPI spec.
      ...(publicUrl ? { servers: [{ url: publicUrl }] } : {}),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'A personal access token (`lfi_...`) from LFX Developer Settings.',
          },
        },
      },
      // Covers every documented route; the spec and health routes are public and hidden.
      security: [{ bearerAuth: [] }],
    },
  });

  const versionedDoc = (prefix: string) => {
    const source = app.swagger();
    // Exact prefix with trailing slash so e.g. /v1-alpha/ routes never leak into /v1's spec.
    const pathPrefix = `${prefix}/`;
    const paths = Object.fromEntries(
      Object.entries(source.paths ?? {}).filter(([path]) => path.startsWith(pathPrefix)),
    );
    const components =
      'components' in source && source.components
        ? prunedComponents(source.components as ComponentSections, paths)
        : undefined;
    return {
      ...source,
      info: { ...source.info, version: specVersionFor(prefix) },
      paths,
      ...(components ? { components } : {}),
    };
  };

  app.decorateRequest('username', null);

  for (const entry of versions) {
    await app.register(
      async (scope) => {
        applyLifecycle(scope, entry.lifecycle);
        // A child scope keeps the spec route below public (ADR-0009). preValidation runs after the
        // version's onRequest headers (ADR-0013) and before schema validation.
        await scope.register(async (data) => {
          data.addHook('preValidation', authenticate(options.authKeys));
          data.addHook('preValidation', tagCaller);
          data.addHook('preValidation', rateLimit(app.log));
          data.addHook('onResponse', recordRequest);
          data.addHook('onRoute', cacheResponses(app.log));
          await data.register(entry.plugin);
        });
        // The route set is fixed once the app is ready, so the document is derived once per version.
        let cached: ReturnType<typeof versionedDoc> | undefined;
        scope.get(
          '/openapi.json',
          { schema: { hide: true } },
          async () => (cached ??= versionedDoc(entry.prefix)),
        );
      },
      { prefix: entry.prefix },
    );
  }

  await app.register(healthRoutes);

  // Deprecated version scopes register this same handler, so the two 404 bodies can't drift
  // (see src/lib/errors.ts).
  app.setNotFoundHandler(notFoundHandler);

  return app;
}
