// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Pool } from 'pg';

export interface InsightsProject {
  id: string;
  name: string;
  description?: string;
  segmentId: string;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
  organizationId: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  widgets: string[];
  slug: string;
  enabled: boolean;
  isLF: boolean;
  keywords: string[];
  searchKeywords: string[];
  deletedAt?: string;
}

export class InsightsProjectsRepository {
  constructor(private pool: Pool) {}

  async findInsightsProjectsBySlug(slug: string): Promise<InsightsProject | null> {
    try {
      const query = `
        SELECT 
          id,
          name,
          description,
          "segmentId",
          "createdAt",
          "updatedAt",
          "logoUrl",
          "organizationId",
          website,
          github,
          linkedin,
          twitter,
          widgets,
          slug,
          enabled,
          "isLF",
          keywords,
          "searchKeywords",
          "deletedAt"
        FROM "insightsProjects"
        WHERE slug = $1 AND "deletedAt" IS NULL
      `;

      const result = await this.pool.query(query, [slug]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error finding insights project by slug:', error);
      throw new Error('Could not find insights project');
    }
  }
}
