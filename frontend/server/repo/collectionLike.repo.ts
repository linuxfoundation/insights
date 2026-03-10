// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

interface LikedCollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  color: string | null;
  imageUrl: string | null;
  updatedAt: string;
  ownerName: string | null;
  ownerLogo: string | null;
}

export interface LikedCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  color: string | null;
  imageUrl: string | null;
  updatedAt: string;
  projectCount: number;
  owner: {
    name: string;
    logo: string;
  } | null;
}

export class CollectionLikeRepository {
  constructor(private pool: Pool) {}

  async like(collectionId: string, ssoUserId: string): Promise<void> {
    // Try to restore a soft-deleted like first
    const restored = await this.pool.query(
      `UPDATE "collectionLikes"
       SET "deletedAt" = NULL
       WHERE id = (
         SELECT id FROM "collectionLikes"
         WHERE "collectionId" = $1 AND "ssoUserId" = $2 AND "deletedAt" IS NOT NULL
         LIMIT 1
       )`,
      [collectionId, ssoUserId],
    );

    // Only insert if there was nothing to restore
    if (restored.rowCount === 0) {
      await this.pool.query(
        `INSERT INTO "collectionLikes" ("collectionId", "ssoUserId")
         VALUES ($1, $2)
         ON CONFLICT ("collectionId", "ssoUserId") WHERE "deletedAt" IS NULL DO NOTHING`,
        [collectionId, ssoUserId],
      );
    }
  }

  async unlike(collectionId: string, ssoUserId: string): Promise<void> {
    await this.pool.query(
      `UPDATE "collectionLikes"
       SET "deletedAt" = NOW()
       WHERE "collectionId" = $1 AND "ssoUserId" = $2 AND "deletedAt" IS NULL`,
      [collectionId, ssoUserId],
    );
  }

  async findLikedByUser(
    ssoUserId: string,
    options?: { page?: number; pageSize?: number },
  ): Promise<{ data: LikedCollection[]; total: number }> {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 10;
    const offset = page * pageSize;

    const [collectionsResult, countResult] = await Promise.all([
      this.pool.query(
        `SELECT c.id, c.name, c.slug, c.description, c."logoUrl", c.color, c."imageUrl", c."updatedAt",
                u."displayName" AS "ownerName", u."avatarUrl" AS "ownerLogo"
         FROM "collectionLikes" cl
         JOIN collections c ON c.id = cl."collectionId" AND c."deletedAt" IS NULL
         LEFT JOIN "insightsSsoUsers" u ON u.id = c."ssoUserId"
         WHERE cl."ssoUserId" = $1 AND cl."deletedAt" IS NULL
         ORDER BY cl."createdAt" DESC
         LIMIT $2 OFFSET $3`,
        [ssoUserId, pageSize, offset],
      ),
      this.pool.query(
        `SELECT COUNT(*)::int AS total
         FROM "collectionLikes" cl
         JOIN collections c ON c.id = cl."collectionId" AND c."deletedAt" IS NULL
         WHERE cl."ssoUserId" = $1 AND cl."deletedAt" IS NULL`,
        [ssoUserId],
      ),
    ]);

    const total = countResult.rows[0]?.total || 0;

    if (collectionsResult.rows.length === 0) {
      return { data: [], total };
    }

    const collectionIds = collectionsResult.rows.map((r: LikedCollectionRow) => r.id);
    const projectCountResult = await this.pool.query(
      `SELECT "collectionId", COUNT(*)::int AS count
       FROM "collectionsInsightsProjects"
       WHERE "collectionId" = ANY($1) AND "deletedAt" IS NULL
       GROUP BY "collectionId"`,
      [collectionIds],
    );

    const projectCountMap = new Map<string, number>();
    for (const row of projectCountResult.rows) {
      projectCountMap.set(row.collectionId, row.count);
    }

    return {
      data: collectionsResult.rows.map((r: LikedCollectionRow) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        logoUrl: r.logoUrl,
        color: r.color,
        imageUrl: r.imageUrl,
        updatedAt: r.updatedAt,
        projectCount: projectCountMap.get(r.id) || 0,
        owner: r.ownerName
          ? {
              name: r.ownerName,
              logo: r.ownerLogo || '',
            }
          : null,
      })),
      total,
    };
  }
}
