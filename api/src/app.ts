// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance } from 'fastify';

export interface BuildAppOptions {
  docsRoot?: string;
}

const defaultDocsRoot = fileURLToPath(new URL('../docs/site/.vitepress/dist', import.meta.url));

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
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

  app.get('/v1/openapi.json', async () => app.swagger());

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

      // Extensionless docs paths (e.g. /docs/reference) must resolve to the
      // VitePress-emitted `<path>.html` file, since cleanUrls is off. We try
      // that once per request via sendFile, which sanitizes the path itself;
      // if the file does not exist, sendFile calls reply.callNotFound()
      // again, and htmlFallbackAttempted (already true by then) routes us to
      // the plain 404 page instead of retrying forever.
      const htmlFallbackAttempted = new WeakSet<object>();

      docsScope.setNotFoundHandler((request, reply) => {
        const pathname = request.url.split('?')[0]?.slice(docsScope.prefix.length) ?? '';
        const hasExtension = /\.[^/]+$/.test(pathname);

        if (docsRootExists && !hasExtension && !htmlFallbackAttempted.has(request)) {
          htmlFallbackAttempted.add(request);
          reply.type('text/html').sendFile(`${pathname}.html`);
          return;
        }

        if (docsNotFoundHtml) {
          reply.code(404).type('text/html').send(docsNotFoundHtml);
          return;
        }
        reply.code(404).send({ error: 'Not Found' });
      });
    },
    { prefix: '/docs' },
  );

  return app;
}
