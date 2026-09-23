// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { existsSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance } from 'fastify';

import { notFoundHandler } from './lib/errors.js';
import { applyLifecycle } from './versions/lifecycle.js';
import { specVersionFor, versionRegistry, type ApiVersion } from './versions/registry.js';

export interface BuildAppOptions {
  docsRoot?: string;
  versions?: readonly ApiVersion[];
}

const defaultDocsRoot = fileURLToPath(new URL('../docs/site/.vitepress/dist', import.meta.url));

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
    logger: { level: 'warn' },
    disableRequestLogging: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // The local default lives in .env.dist, not here; see src/env.ts.
  const publicUrl = process.env.API_PUBLIC_URL;
  const versions = options.versions ?? versionRegistry;

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'LFX Insights API',
        version: '0.1.0',
        description: 'Public API for LFX Insights.',
      },
      // Omitted servers means same-origin per the OpenAPI spec.
      ...(publicUrl ? { servers: [{ url: publicUrl }] } : {}),
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

  for (const entry of versions) {
    await app.register(
      async (scope) => {
        applyLifecycle(scope, entry.lifecycle);
        await scope.register(entry.plugin);
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

  const docsRoot = options.docsRoot ?? defaultDocsRoot;
  const docsNotFoundPage = existsSync(docsRoot) ? join(docsRoot, '404.html') : undefined;
  const docsNotFoundHtml =
    docsNotFoundPage && existsSync(docsNotFoundPage)
      ? readFileSync(docsNotFoundPage, 'utf-8')
      : undefined;

  await app.register(
    async (docsScope) => {
      const docsRootExists = existsSync(docsRoot);
      if (docsRootExists) {
        await docsScope.register(fastifyStatic, {
          root: docsRoot,
          prefix: '',
          redirect: true,
        });
      }

      // cleanUrls is off in VitePress, so an extensionless path (e.g. /docs/reference)
      // is only servable from its `<path>.html` file on disk.
      docsScope.setNotFoundHandler((request, reply) => {
        const pathname = request.url.split('?')[0]?.slice(docsScope.prefix.length) ?? '';
        const hasExtension = /\.[^/]+$/.test(pathname);

        if (docsRootExists && !hasExtension) {
          const candidatePath = join(docsRoot, `${decodeURIComponent(pathname)}.html`);
          if (
            (candidatePath === docsRoot || candidatePath.startsWith(docsRoot + sep)) &&
            existsSync(candidatePath)
          ) {
            reply.type('text/html').sendFile(`${pathname}.html`);
            return;
          }
        }

        if (docsNotFoundHtml) {
          reply.code(404).type('text/html; charset=utf-8').send(docsNotFoundHtml);
          return;
        }
        reply.code(404).send({ error: 'Not Found' });
      });
    },
    { prefix: '/docs' },
  );

  // Deprecated version scopes register this same handler, so the two 404 bodies can't drift
  // (see src/lib/errors.ts).
  app.setNotFoundHandler(notFoundHandler);

  return app;
}
