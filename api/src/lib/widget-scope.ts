// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static, type TObject, type TSchema } from '@sinclair/typebox';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { type RequestLog, withBucket } from '../clients/tinybird.js';
import { ProjectSlugParams } from '../schemas/common.js';
import { collectionExists } from './collections-db.js';
import { NotFoundError } from './errors.js';

// Registers one handler under /projects/:slug and /collections/:slug, each documented with the
// text its route passes. The collection copy ignores `repos` and answers 404 for an unknown slug.

export type Scope = 'project' | 'collection';

// Pipe params for the scope: the Tinybird client resolves a collection's bucket from the slug.
export interface PipeTarget {
  project?: string;
  collectionSlug?: string;
  bucketId?: number;
}

// Null when the project has no Tinybird bucket, which the handler answers with its empty result.
export type WithTarget = <T>(query: (target: PipeTarget) => Promise<T>) => Promise<T | null>;

// Exported so tests can hand a project `WithTarget` to helpers that take one.
export function projectTarget(request: RequestLog, slug: string): WithTarget {
  return (query) => withBucket(request, slug, (bucketId) => query({ project: slug, bucketId }));
}

export type WidgetRequest<Q extends TObject> = FastifyRequest<{ Querystring: Static<Q> }>;

export interface ScopeSchema<Q extends TObject = TObject, R extends TSchema = TSchema> {
  description: string;
  querystring: Q;
  response: R;
}

export interface WidgetRoute<Q extends TObject, R extends TSchema> {
  path: string;
  tags: string[];
  summary: string;
  project: ScopeSchema<Q, R>;
  // The project schemas without `repos`, in collection wording. widgetRoutes adds the 404 sentence.
  collection: ScopeSchema;
  handler: (request: WidgetRequest<Q>, withTarget: WithTarget) => Promise<Static<R>>;
}

const CollectionSlugParams = Type.Object({
  slug: Type.String({ minLength: 1 }),
});

type SlugRequest<Q extends TObject> = FastifyRequest<{
  Params: { slug: string };
  Querystring: Static<Q>;
}>;

// Fastify cannot resolve the request and reply types of a generic schema, so the route is
// registered through this loose signature; `WidgetRoute` carries the real types to the handler.
type Register = <Q extends TObject>(
  path: string,
  options: { schema: object; preHandler?: (request: SlugRequest<Q>) => Promise<void> },
  handler: (request: SlugRequest<Q>) => Promise<unknown>,
) => void;

export function widgetRoutes<Q extends TObject, R extends TSchema>(
  scope: FastifyInstance,
  { path, tags, summary, project, collection, handler }: WidgetRoute<Q, R>,
): void {
  const get = scope.get.bind(scope) as unknown as Register;

  get(
    `/projects/:slug/${path}`,
    {
      schema: {
        tags,
        summary,
        description: project.description,
        querystring: project.querystring,
        response: { 200: project.response },
        params: ProjectSlugParams,
      },
    },
    async (request: SlugRequest<Q>) => {
      return handler(request, projectTarget(request, request.params.slug));
    },
  );

  get(
    `/collections/:slug/${path}`,
    {
      schema: {
        tags: ['Collections'],
        summary,
        description: `${collection.description} An unknown or private collection returns 404.`,
        params: CollectionSlugParams,
        querystring: collection.querystring,
        response: { 200: collection.response },
      },
      // A hook runs ahead of the response cache read, so a collection made private or deleted
      // answers 404 even while its metrics are cached (ADR-0013).
      preHandler: async (request: SlugRequest<Q>) => {
        if (!(await collectionExists(request, request.params.slug))) {
          throw new NotFoundError('Collection not found');
        }
      },
    },
    async (request: SlugRequest<Q>) => {
      const { slug } = request.params;
      // Ajv keeps undeclared query keys, so a caller's repos is dropped here rather than forwarded.
      delete (request.query as { repos?: unknown }).repos;
      return handler(request, (query) => query({ collectionSlug: slug }));
    },
  );
}
