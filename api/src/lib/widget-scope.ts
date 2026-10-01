// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Type, type Static, type TObject, type TSchema } from '@sinclair/typebox';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { withBucket } from '../clients/tinybird.js';
import { ProjectSlugParams } from '../schemas/common.js';
import { collectionExists } from './collections-db.js';
import { NotFoundError } from './errors.js';

// Registers one handler under /projects/:slug and /collections/:slug. The collection copy drops
// `repos`, rewrites project wording in the descriptions and answers 404 for an unknown slug.

// Pipe params for the scope: the Tinybird client resolves a collection's bucket from the slug.
export interface PipeTarget {
  project?: string;
  collectionSlug?: string;
  bucketId?: number;
}

// Null when the project has no Tinybird bucket, which the handler answers with its empty result.
export type WithTarget = <T>(query: (target: PipeTarget) => Promise<T>) => Promise<T | null>;

export type WidgetRequest<Q extends TObject> = FastifyRequest<{ Querystring: Static<Q> }>;

export interface WidgetRoute<Q extends TObject, R extends TSchema> {
  path: string;
  schema: {
    tags: string[];
    summary: string;
    description: string;
    querystring: Q;
    response: { 200: R };
  };
  handler: (request: WidgetRequest<Q>, withTarget: WithTarget) => Promise<Static<R>>;
}

const CollectionSlugParams = Type.Object({
  slug: Type.String({ minLength: 1 }),
});

// Rewrites project wording for a collection and drops project-only sentences: an unknown
// collection is a 404 rather than empty, and `repos` does not apply.
const collectionRules: [RegExp, string][] = [
  [/An unknown project(?:, or | or )a ([^,.]+?),? (returns|gets)/g, 'A $1 $2'],
  [/ ?An unknown project [^.]*\./g, ''],
  [/ ?`repos` narrows [^.]*\./g, ''],
  [/, or only in `repos` when given/g, ''],
  [/lists for the project\b/g, 'lists for a project of the collection'],
  [/\b([Tt])he project's/g, "$1he collection's"],
  [/\b([Tt])he project\b/g, '$1he collection'],
  [/project repository/g, 'collection repository'],
];

export function collectionText(text: string): string {
  return collectionRules
    .reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text)
    .trim();
}

function isRecord(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === 'object' && value !== null;
}

// Changed nodes drop `title` so their OpenAPI component cannot clash with the project one.
// Untouched subschemas are returned as is and keep sharing theirs.
function rewrite(node: unknown): unknown {
  if (Array.isArray(node)) {
    const items = node.map(rewrite);
    return items.some((item, index) => item !== node[index]) ? items : node;
  }
  if (!isRecord(node)) {
    return node;
  }
  const copy: Record<string | symbol, unknown> = {};
  let changed = false;
  for (const key of Reflect.ownKeys(node)) {
    const value = node[key];
    const next =
      key === 'description' && typeof value === 'string' ? collectionText(value) : rewrite(value);
    changed ||= next !== value;
    if (!(key === 'description' && next === '')) {
      copy[key] = next;
    }
  }
  if (!changed) {
    return node;
  }
  delete copy.title;
  return copy;
}

export function collectionSchema<T extends TSchema>(schema: T): T {
  return rewrite(schema) as T;
}

type SlugRequest<Q extends TObject> = FastifyRequest<{
  Params: { slug: string };
  Querystring: Static<Q>;
}>;

// Fastify cannot resolve the request and reply types of a generic schema, so the route is
// registered through this loose signature; `WidgetRoute` carries the real types to the handler.
type Register = <Q extends TObject>(
  path: string,
  options: { schema: object },
  handler: (request: SlugRequest<Q>) => Promise<unknown>,
) => void;

export function widgetRoutes<Q extends TObject, R extends TSchema>(
  scope: FastifyInstance,
  { path, schema, handler }: WidgetRoute<Q, R>,
): void {
  const get = scope.get.bind(scope) as unknown as Register;

  get(
    `/projects/:slug/${path}`,
    { schema: { ...schema, params: ProjectSlugParams } },
    async (request: SlugRequest<Q>) => {
      const { slug } = request.params;
      return handler(request, (query) =>
        withBucket(request, slug, (bucketId) => query({ project: slug, bucketId })),
      );
    },
  );

  get(
    `/collections/:slug/${path}`,
    {
      schema: {
        ...schema,
        tags: ['Collections'],
        summary: collectionText(schema.summary),
        description: `${collectionText(schema.description)} An unknown or private collection returns 404.`,
        params: CollectionSlugParams,
        querystring: collectionSchema(Type.Omit(schema.querystring, ['repos'])),
        response: { 200: collectionSchema(schema.response[200]) },
      },
    },
    async (request: SlugRequest<Q>) => {
      const { slug } = request.params;
      if (!(await collectionExists(request, slug))) {
        throw new NotFoundError('Collection not found');
      }
      // Ajv keeps undeclared query keys, so a caller's repos is dropped here rather than forwarded.
      delete (request.query as { repos?: unknown }).repos;
      return handler(request, (query) => query({ collectionSlug: slug }));
    },
  );
}
