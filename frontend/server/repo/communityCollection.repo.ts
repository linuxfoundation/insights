// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool, PoolClient } from 'pg';
import { generateSlug } from '~~/server/utils/common';

export interface CommunityCollection {
  id: string;
  name: string;
  description: string;
  slug: string;
  isPrivate: boolean;
  ssoUserId: string;
  logoUrl: string | null;
  color: string | null;
  imageUrl: string | null;
  projects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityCollectionInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
  ssoUserId: string;
  projects?: string[];
}

export interface UpdateCommunityCollectionInput {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  projects?: string[];
}

export class CommunityCollectionRepository {
  constructor(private pool: Pool) {}

  async create(input: CreateCommunityCollectionInput): Promise<CommunityCollection> {
    const client = await this.pool.connect();
    let collectionId: string;

    try {
      await client.query('BEGIN');

      const collectionResult = await client.query(
        `
        INSERT INTO collections (name, description, slug, "isPrivate", "ssoUserId", starred)
        VALUES ($1, $2, $3, $4, $5, false)
        RETURNING *
      `,
        [
          input.name,
          input.description ?? null,
          generateSlug(input.name),
          input.isPrivate ?? false,
          input.ssoUserId,
        ],
      );

      collectionId = collectionResult.rows[0].id;

      if (input.projects?.length) {
        await this.connectProjects(client, collectionId, input.projects);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      this.handlePgError(error);
      throw error;
    } finally {
      client.release();
    }

    return this.findById(collectionId);
  }

  async update(
    id: string,
    ssoUserId: string,
    input: UpdateCommunityCollectionInput,
  ): Promise<CommunityCollection> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      await this.validateOwnership(client, id, ssoUserId);

      const { projects, ...collectionData } = input;

      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (collectionData.name !== undefined) {
        fields.push(`name = $${paramIndex}`);
        values.push(collectionData.name);
        paramIndex++;

        fields.push(`slug = $${paramIndex}`);
        values.push(generateSlug(collectionData.name));
        paramIndex++;
      }

      if (collectionData.description !== undefined) {
        fields.push(`description = $${paramIndex}`);
        values.push(collectionData.description);
        paramIndex++;
      }

      if (collectionData.isPrivate !== undefined) {
        fields.push(`"isPrivate" = $${paramIndex}`);
        values.push(collectionData.isPrivate);
        paramIndex++;
      }

      if (fields.length > 0) {
        fields.push(`"updatedAt" = NOW()`);
        await client.query(
          `UPDATE collections SET ${fields.join(', ')} WHERE id = $${paramIndex} AND "deletedAt" IS NULL`,
          [...values, id],
        );
      }

      if (projects !== undefined) {
        await this.disconnectProjects(client, id);
        if (projects.length > 0) {
          await this.connectProjects(client, id, projects);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      this.handlePgError(error);
      throw error;
    } finally {
      client.release();
    }

    return this.findById(id);
  }

  async destroy(id: string, ssoUserId: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      await this.validateOwnership(client, id, ssoUserId);

      await this.disconnectProjects(client, id);

      await client.query(
        `UPDATE collections SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1 AND "deletedAt" IS NULL`,
        [id],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<CommunityCollection> {
    const collectionResult = await this.pool.query(
      `SELECT * FROM collections WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (collectionResult.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }

    const projectsResult = await this.pool.query(
      `SELECT "insightsProjectId" FROM "collectionsInsightsProjects" WHERE "collectionId" = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    return {
      ...collectionResult.rows[0],
      projects: projectsResult.rows.map((r: { insightsProjectId: string }) => r.insightsProjectId),
    };
  }

  async query(options: {
    page: number;
    pageSize: number;
    search?: string;
    categoryIds?: string;
    type?: string;
    orderByField?: string;
    orderByDirection?: string;
  }): Promise<{ data: CommunityCollection[]; total: number }> {
    const { page, pageSize, search, categoryIds, type, orderByField, orderByDirection } = options;

    const conditions: string[] = ['c."deletedAt" IS NULL', 'c."isPrivate" = false'];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`c.name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryIds) {
      const ids = categoryIds.split(',');
      conditions.push(`c."categoryId" = ANY($${paramIndex})`);
      params.push(ids);
      paramIndex++;
    }

    if (type === 'community') {
      conditions.push(`c."ssoUserId" IS NOT NULL`);
    } else if (type === 'curated') {
      conditions.push(`c."ssoUserId" IS NULL`);
    }

    const where = conditions.join(' AND ');

    const allowedOrderFields: Record<string, string> = {
      name: 'c.name',
      starred: 'c.starred',
      createdAt: 'c."createdAt"',
    };
    const orderField = allowedOrderFields[orderByField || 'name'] || 'c.name';
    const orderDir = orderByDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderClause =
      orderByField === 'starred' ? `c.starred DESC, c.name ASC` : `${orderField} ${orderDir}`;

    const offset = page * pageSize;

    const [collectionsResult, countResult] = await Promise.all([
      this.pool.query(
        `SELECT c.*, u."displayName" AS "ownerName", u."avatarUrl" AS "ownerLogo"
         FROM collections c
         LEFT JOIN "insightsSsoUsers" u ON u.id = c."ssoUserId"
         WHERE ${where}
         ORDER BY ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, pageSize, offset],
      ),
      this.pool.query(`SELECT COUNT(*)::int as total FROM collections c WHERE ${where}`, params),
    ]);

    const collections = collectionsResult.rows;
    const total = countResult.rows[0]?.total || 0;

    if (collections.length === 0) {
      return { data: [], total };
    }

    const collectionIds = collections.map((r: { id: string }) => r.id);
    const [projectsResult, likeCountResult] = await Promise.all([
      this.pool.query(
        `SELECT cip."collectionId", cip."insightsProjectId",
                ip.name, ip.slug, ip."logoUrl"
         FROM "collectionsInsightsProjects" cip
         LEFT JOIN "insightsProjects" ip ON ip.id = cip."insightsProjectId"
         WHERE cip."collectionId" = ANY($1) AND cip."deletedAt" IS NULL`,
        [collectionIds],
      ),
      this.pool.query(
        `SELECT "collectionId", COUNT(*)::int AS "likeCount"
         FROM "collectionLikes"
         WHERE "collectionId" = ANY($1) AND "deletedAt" IS NULL
         GROUP BY "collectionId"`,
        [collectionIds],
      ),
    ]);

    const projectsByCollection = new Map<
      string,
      { id: string; name: string; slug: string; logoUrl: string }[]
    >();
    for (const row of projectsResult.rows) {
      const list = projectsByCollection.get(row.collectionId) || [];
      list.push({
        id: row.insightsProjectId,
        name: row.name,
        slug: row.slug,
        logoUrl: row.logoUrl,
      });
      projectsByCollection.set(row.collectionId, list);
    }

    const likeCountByCollection = new Map<string, number>();
    for (const row of likeCountResult.rows) {
      likeCountByCollection.set(row.collectionId, row.likeCount);
    }

    return {
      data: collections.map(
        (c: CommunityCollection & { ownerName?: string; ownerLogo?: string }) => ({
          ...c,
          ownerName: undefined,
          ownerLogo: undefined,
          projects: (projectsByCollection.get(c.id) || []).map((p) => p.id),
          projectCount: (projectsByCollection.get(c.id) || []).length,
          featuredProjects: (projectsByCollection.get(c.id) || []).slice(0, 5).map((p) => ({
            name: p.name,
            slug: p.slug,
            logo: p.logoUrl,
          })),
          owner: c.ownerName
            ? {
                name: c.ownerName,
                logo: c.ownerLogo || '',
              }
            : undefined,
          likeCount: likeCountByCollection.get(c.id) || 0,
        }),
      ),
      total,
    };
  }

  async findBySlug(slug: string): Promise<
    | (CommunityCollection & {
        projectCount: number;
        featuredProjects: { name: string; slug: string; logo: string }[];
      })
    | null
  > {
    const collectionResult = await this.pool.query(
      `SELECT c.*, u."displayName" AS "ownerName", u."avatarUrl" AS "ownerLogo"
       FROM collections c
       LEFT JOIN "insightsSsoUsers" u ON u.id = c."ssoUserId"
       WHERE c.slug = $1 AND c."deletedAt" IS NULL AND c."isPrivate" = false`,
      [slug],
    );

    if (collectionResult.rows.length === 0) {
      return null;
    }

    const collection = collectionResult.rows[0];

    const [projectsResult, likeCountResult] = await Promise.all([
      this.pool.query(
        `SELECT cip."insightsProjectId",
                ip.name, ip.slug, ip."logoUrl"
         FROM "collectionsInsightsProjects" cip
         LEFT JOIN "insightsProjects" ip ON ip.id = cip."insightsProjectId"
         WHERE cip."collectionId" = $1 AND cip."deletedAt" IS NULL`,
        [collection.id],
      ),
      this.pool.query(
        `SELECT COUNT(*)::int AS "likeCount"
         FROM "collectionLikes"
         WHERE "collectionId" = $1 AND "deletedAt" IS NULL`,
        [collection.id],
      ),
    ]);

    return {
      ...collection,
      ownerName: undefined,
      ownerLogo: undefined,
      projects: projectsResult.rows.map((r: { insightsProjectId: string }) => r.insightsProjectId),
      projectCount: projectsResult.rows.length,
      featuredProjects: projectsResult.rows
        .slice(0, 5)
        .map((r: { name: string; slug: string; logoUrl: string }) => ({
          name: r.name,
          slug: r.slug,
          logo: r.logoUrl,
        })),
      owner: collection.ownerName
        ? {
            name: collection.ownerName,
            logo: collection.ownerLogo || '',
          }
        : undefined,
      likeCount: likeCountResult.rows[0]?.likeCount || 0,
    };
  }

  async findBySsoUserId(
    ssoUserId: string,
    options?: { page?: number; pageSize?: number },
  ): Promise<{ data: CommunityCollection[]; total: number }> {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 10;
    const offset = page * pageSize;

    const [collectionsResult, countResult] = await Promise.all([
      this.pool.query(
        `SELECT * FROM collections WHERE "ssoUserId" = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
        [ssoUserId, pageSize, offset],
      ),
      this.pool.query(
        `SELECT COUNT(*)::int as total FROM collections WHERE "ssoUserId" = $1 AND "deletedAt" IS NULL`,
        [ssoUserId],
      ),
    ]);

    const total = countResult.rows[0]?.total || 0;

    if (collectionsResult.rows.length === 0) {
      return { data: [], total };
    }

    const collectionIds = collectionsResult.rows.map((r: { id: string }) => r.id);
    const projectsResult = await this.pool.query(
      `SELECT "collectionId", "insightsProjectId" FROM "collectionsInsightsProjects" WHERE "collectionId" = ANY($1) AND "deletedAt" IS NULL`,
      [collectionIds],
    );

    const projectsByCollection = new Map<string, string[]>();
    for (const row of projectsResult.rows) {
      const list = projectsByCollection.get(row.collectionId) || [];
      list.push(row.insightsProjectId);
      projectsByCollection.set(row.collectionId, list);
    }

    return {
      data: collectionsResult.rows.map((c: CommunityCollection) => ({
        ...c,
        projects: projectsByCollection.get(c.id) || [],
      })),
      total,
    };
  }

  async findProjectIdsBySlug(
    slug: string,
  ): Promise<{ collectionId: string; projectIds: string[] } | null> {
    const collectionResult = await this.pool.query(
      `SELECT c.id FROM collections c
       WHERE c.slug = $1 AND c."deletedAt" IS NULL AND c."isPrivate" = false`,
      [slug],
    );

    if (collectionResult.rows.length === 0) {
      return null;
    }

    const collectionId = collectionResult.rows[0].id;

    const projectsResult = await this.pool.query(
      `SELECT "insightsProjectId" FROM "collectionsInsightsProjects"
       WHERE "collectionId" = $1 AND "deletedAt" IS NULL`,
      [collectionId],
    );

    return {
      collectionId,
      projectIds: projectsResult.rows.map(
        (r: { insightsProjectId: string }) => r.insightsProjectId,
      ),
    };
  }

  private async validateOwnership(
    client: PoolClient,
    collectionId: string,
    ssoUserId: string,
  ): Promise<void> {
    const result = await client.query(
      `SELECT "ssoUserId" FROM collections WHERE id = $1 AND "deletedAt" IS NULL`,
      [collectionId],
    );

    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Collection not found' });
    }

    if (result.rows[0].ssoUserId !== ssoUserId) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }
  }

  private async connectProjects(
    client: PoolClient,
    collectionId: string,
    insightsProjectIds: string[],
  ): Promise<void> {
    // Deduplicate project IDs to avoid unique constraint violations
    const uniqueIds = [...new Set(insightsProjectIds)];
    if (uniqueIds.length === 0) return;

    const values = uniqueIds.map((_, i) => `($1, $${i + 2}, false)`).join(', ');

    await client.query(
      `INSERT INTO "collectionsInsightsProjects" ("collectionId", "insightsProjectId", starred) VALUES ${values}`,
      [collectionId, ...uniqueIds],
    );
  }

  private async disconnectProjects(client: PoolClient, collectionId: string): Promise<void> {
    await client.query(
      `UPDATE "collectionsInsightsProjects" SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE "collectionId" = $1 AND "deletedAt" IS NULL`,
      [collectionId],
    );
  }

  private handlePgError(error: unknown): void {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A collection with this name already exists',
      });
    }
  }
}
